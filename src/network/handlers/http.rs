use core::str;
use std::net::Ipv4Addr;
use std::sync::Arc;

use esp_idf_svc::http::server::{EspHttpConnection, EspHttpServer, Request};
use esp_idf_svc::http::Method;
use esp_idf_svc::io::{EspIOError, Write};
use esp_idf_svc::sys::{EspError, ESP_FAIL};

use crate::network::manager::{
    apply_speed_with_duration_sync, format_mac, parse_speed_command, ClientSession, MotorTarget,
    SharedClientSessions, SharedMotorControllers, WS_MAX_PAYLOAD_LEN,
};

/// Sortie Vite (`npm run build` dans `src/network/frontend`, `outDir: ../site_compiled`).
const INDEX_HTML: &str = include_str!("../site_compiled/index.html");
const INDEX_JS: &str = include_str!("../site_compiled/assets/index.js");
const INDEX_CSS: &str = include_str!("../site_compiled/assets/index.css");
const FAVICON_SVG: &str = include_str!("../site_compiled/favicon.svg");
const ICONS_SVG: &str = include_str!("../site_compiled/icons.svg");

fn parse_speed_with_optional_duration(payload: &str) -> Option<(MotorTarget, i32, Option<u32>)> {
    let payload = payload.trim_matches(|c: char| c.is_ascii_control() || c.is_whitespace());
    let parts: Vec<&str> = payload.split(':').collect();

    if parts.len() == 2 {
        let (target, speed) = parse_speed_command(payload)?;
        return Some((target, speed, None));
    }

    if parts.len() != 3 {
        return None;
    }

    let speed_payload = format!("{}:{}", parts[0], parts[1]);
    let (target, speed) = parse_speed_command(&speed_payload)?;
    let duration_ms = parts[2].trim().parse::<u32>().ok()?;

    Some((target, speed, Some(duration_ms)))
}

fn parse_calibration_json(payload: &str) -> Option<(i32, u32, Option<u32>, Option<u32>)> {
    let payload = payload.trim();
    if !(payload.starts_with('{') && payload.ends_with('}')) {
        return None;
    }

    let mut vitesse_moteur = None;
    let mut temp_360 = None;
    let mut vitesse_min = None;
    let mut vitesse_max = None;

    let inner = &payload[1..payload.len() - 1];
    for entry in inner.split(',') {
        let (key_raw, value_raw) = entry.split_once(':')?;
        let key = key_raw.trim().trim_matches('"');
        let value = value_raw.trim();

        match key {
            "vitesse_moteur" => {
                vitesse_moteur = value.parse::<i32>().ok();
            }
            "temp_360" => {
                temp_360 = value.parse::<u32>().ok();
            }
            "vitesse_min" => {
                vitesse_min = value.parse::<u32>().ok();
            }
            "vitesse_max" => {
                vitesse_max = value.parse::<u32>().ok();
            }
            _ => {}
        }
    }

    Some((vitesse_moteur?, temp_360?, vitesse_min, vitesse_max))
}

fn resolve_client_session(sessions: &SharedClientSessions, ip: Ipv4Addr) -> Option<ClientSession> {
    let store = sessions.lock().ok()?;
    store.find_session_by_ip(ip)
}

fn log_request_identity(
    context: &str,
    source_ip: Option<Ipv4Addr>,
    session: Option<ClientSession>,
) {
    match (source_ip, session) {
        (Some(ip), Some(session)) => {
            let session_label = session
                .slot
                .map(|slot| slot.to_string())
                .unwrap_or_else(|| "inconnue".to_string());
            log::info!(
                "{} ip={} mac={} session={}",
                context,
                ip,
                format_mac(&session.mac),
                session_label
            );
        }
        (Some(ip), None) => {
            log::warn!("{} ip={} mac=inconnue", context, ip);
        }
        (None, _) => {
            log::warn!("{} ip=inconnue", context);
        }
    }
}

fn request_source_ipv4(req: &mut Request<&mut EspHttpConnection<'_>>) -> Option<Ipv4Addr> {
    let connection = req.connection();
    let raw_connection = connection.raw_connection().ok()?;
    raw_connection.source_ipv4().ok()
}

pub fn register(
    server: &mut EspHttpServer<'static>,
    controllers: SharedMotorControllers,
    sessions: SharedClientSessions,
) -> Result<(), EspError> {
    // SPA Preact : même `index.html` pour `/` et `/http` (router côté client).
    let static_routes: [(&str, &str, &str); 6] = [
        ("/", INDEX_HTML, "text/html; charset=utf-8"),
        ("/http", INDEX_HTML, "text/html; charset=utf-8"),
        (
            "/assets/index.js",
            INDEX_JS,
            "application/javascript; charset=utf-8",
        ),
        ("/assets/index.css", INDEX_CSS, "text/css; charset=utf-8"),
        ("/favicon.svg", FAVICON_SVG, "image/svg+xml"),
        ("/icons.svg", ICONS_SVG, "image/svg+xml"),
    ];

    for (path, content, content_type) in static_routes {
        server.fn_handler(path, Method::Get, move |req| -> Result<(), EspIOError> {
            req.into_response(
                200,
                None,
                &[
                    ("Content-Type", content_type),
                    ("Cache-Control", "no-store, max-age=0"),
                ],
            )?
            .write_all(content.as_bytes())?;
            Ok(())
        })?;
    }

    let calibration_sessions = Arc::clone(&sessions);
    server.fn_handler(
        "/api/calibration",
        Method::Post,
        move |mut req| -> Result<(), EspIOError> {
            const API_HEADERS: [(&str, &str); 2] = [
                ("Content-Type", "text/plain; charset=utf-8"),
                ("Connection", "close"),
            ];
            let source_ip = request_source_ipv4(&mut req);
            let client_session =
                source_ip.and_then(|ip| resolve_client_session(&calibration_sessions, ip));
            log_request_identity("HTTP /api/calibration", source_ip, client_session);

            let mut buffer = [0_u8; WS_MAX_PAYLOAD_LEN];
            let mut len = 0_usize;

            while len < WS_MAX_PAYLOAD_LEN {
                let read = req.read(&mut buffer[len..])?;
                if read == 0 {
                    break;
                }
                len += read;
            }

            if len == WS_MAX_PAYLOAD_LEN {
                let mut extra = [0_u8; 1];
                if req.read(&mut extra)? > 0 {
                    req.into_response(413, None, &API_HEADERS)?
                        .write_all(b"payload_too_large")?;
                    return Ok(());
                }
            }

            if len == 0 {
                req.into_response(400, None, &API_HEADERS)?
                    .write_all(b"empty_payload")?;
                return Ok(());
            }

            let payload = match str::from_utf8(&buffer[..len]) {
                Ok(value) => value,
                Err(_) => {
                    req.into_response(400, None, &API_HEADERS)?
                        .write_all(b"invalid_utf8")?;
                    return Ok(());
                }
            };

            let Some((vitesse_moteur, temp_360, vitesse_min, vitesse_max)) = parse_calibration_json(payload) else {
                req.into_response(400, None, &API_HEADERS)?
                    .write_all(b"invalid_json")?;
                return Ok(());
            };

            if let (Some(vitesse_min), Some(vitesse_max)) = (vitesse_min, vitesse_max) {
                log::info!(
                    "CALIBRATION(ms): {{vitesse_moteur : {} , temp_360 : {} , vitesse_min : {} , vitesse_max : {}}}",
                    vitesse_moteur,
                    temp_360,
                    vitesse_min,
                    vitesse_max
                );
            } else {
                log::info!(
                    "CALIBRATION(ms): {{vitesse_moteur : {} , temp_360 : {}}}",
                    vitesse_moteur,
                    temp_360
                );
            }

            req.into_response(200, None, &API_HEADERS)?
                .write_all(b"calibration_logged")?;
            Ok(())
        },
    )?;

    let servo_sessions = Arc::clone(&sessions);
    server.fn_handler(
        "/api/servo",
        Method::Post,
        move |mut req| -> Result<(), EspIOError> {
            const API_HEADERS: [(&str, &str); 2] = [
                ("Content-Type", "text/plain; charset=utf-8"),
                ("Connection", "close"),
            ];
            let source_ip = request_source_ipv4(&mut req);
            let client_session =
                source_ip.and_then(|ip| resolve_client_session(&servo_sessions, ip));
            log_request_identity("HTTP /api/servo", source_ip, client_session);

            let mut buffer = [0_u8; WS_MAX_PAYLOAD_LEN];
            let mut len = 0_usize;

            while len < WS_MAX_PAYLOAD_LEN {
                let read = req.read(&mut buffer[len..])?;
                if read == 0 {
                    break;
                }
                len += read;
            }

            if len == WS_MAX_PAYLOAD_LEN {
                let mut extra = [0_u8; 1];
                if req.read(&mut extra)? > 0 {
                    req.into_response(413, None, &API_HEADERS)?
                        .write_all(b"payload_too_large")?;
                    return Ok(());
                }
            }

            if len == 0 {
                req.into_response(400, None, &API_HEADERS)?
                    .write_all(b"empty_payload")?;
                return Ok(());
            }

            let payload = match str::from_utf8(&buffer[..len]) {
                Ok(value) => value,
                Err(_) => {
                    req.into_response(400, None, &API_HEADERS)?
                        .write_all(b"invalid_utf8")?;
                    return Ok(());
                }
            };

            let Some((target, speed, duration_ms)) = parse_speed_with_optional_duration(payload)
            else {
                req.into_response(400, None, &API_HEADERS)?
                    .write_all(b"invalid_command")?;
                return Ok(());
            };

            log::info!(
                "Commande HTTP reçue: `{}` -> speed={}, duration_ms={:?}",
                payload,
                speed,
                duration_ms
            );

            if let Some(duration_ms) = duration_ms {
                apply_speed_with_duration_sync(&controllers, target, speed, Some(duration_ms))
                    .map_err(EspIOError)?;
            } else {
                let mut motors = controllers
                    .lock()
                    .map_err(|_| EspIOError(EspError::from_infallible::<ESP_FAIL>()))?;
                motors.clear_duration_for_target(target);
                motors.apply_speed(target, speed).map_err(EspIOError)?;
            }

            req.into_response(200, None, &API_HEADERS)?
                .write_all(b"ok")?;
            Ok(())
        },
    )?;

    Ok(())
}
