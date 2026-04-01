use core::str;

use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::http::Method;
use esp_idf_svc::io::{EspIOError, Write};
use esp_idf_svc::sys::{EspError, ESP_FAIL};

use crate::network::manager::{
    apply_speed_with_duration_sync, parse_speed_command, MotorTarget, SharedMotorControllers,
    WS_MAX_PAYLOAD_LEN,
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

pub fn register(
    server: &mut EspHttpServer<'static>,
    controllers: SharedMotorControllers,
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

    server.fn_handler(
        "/api/servo",
        Method::Post,
        move |mut req| -> Result<(), EspIOError> {
            const API_HEADERS: [(&str, &str); 2] = [
                ("Content-Type", "text/plain; charset=utf-8"),
                ("Connection", "close"),
            ];

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

            let Some((target, speed, duration_ms)) = parse_speed_with_optional_duration(payload) else {
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
