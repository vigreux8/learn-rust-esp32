// création du wifi / gestion dns / switch entre http et websocket

use core::convert::TryInto;
use core::str;

use esp_idf_svc::eventloop::EspSystemEventLoop;
use esp_idf_svc::hal::modem::Modem;
use esp_idf_svc::http::server::ws::EspHttpWsConnection;
use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::http::Method;
use esp_idf_svc::io::{EspIOError, Write};
use esp_idf_svc::mdns::EspMdns;
use esp_idf_svc::nvs::EspDefaultNvsPartition;
use esp_idf_svc::sys::{EspError, ESP_ERR_INVALID_SIZE, ESP_FAIL};
use esp_idf_svc::wifi::{
    AccessPointConfiguration, AuthMethod, BlockingWifi, Configuration, EspWifi,
};
use esp_idf_svc::ws::FrameType;
use std::sync::{Arc, Mutex};

use crate::servo::controller::ServoController;

const WIFI_SSID: &str = "cerveau-moteur-esp32";
const WIFI_PASSWORD: &str = "";
const WIFI_CHANNEL: u8 = 1;
const SERVER_STACK_SIZE: usize = 8192;
const WS_MAX_PAYLOAD_LEN: usize = 32;
const MDNS_HOSTNAME: &str = "servo";
const MDNS_INSTANCE_NAME: &str = "ESP32 Servo Controller";

const INDEX_HTML: &str = include_str!("site/main.html");
const HTTP_INDEX_HTML: &str = include_str!("site/http.html");
const STYLE_CSS: &str = include_str!("site/style.css");
const SCRIPT_JS: &str = include_str!("site/script.js");
const HTTP_SCRIPT_JS: &str = include_str!("site/script-http.js");

pub struct WifiServer {
    _wifi: BlockingWifi<EspWifi<'static>>,
    _server: EspHttpServer<'static>,
    _mdns: EspMdns,
}

struct MotorControllers {
    moteur_bras: ServoController<'static>,
    moteur_pince: ServoController<'static>,
}

enum MotorTarget {
    Bras,
    Pince,
}

impl MotorControllers {
    fn apply_speed(&mut self, target: MotorTarget, speed: i32) -> Result<(), EspError> {
        let apply = |servo: &mut ServoController<'static>| {
            if speed == 0 {
                servo.stop()
            } else {
                servo.set_speed(speed)
            }
        };

        match target {
            MotorTarget::Bras => apply(&mut self.moteur_bras),
            MotorTarget::Pince => apply(&mut self.moteur_pince),
        }
    }
}

impl WifiServer {
    pub fn start(
        modem: Modem,
        sys_loop: EspSystemEventLoop,
        nvs: EspDefaultNvsPartition,
        moteur_bras: ServoController<'static>,
        moteur_pince: ServoController<'static>,
    ) -> Result<Self, EspError> {
        let mut wifi =
            BlockingWifi::wrap(EspWifi::new(modem, sys_loop.clone(), Some(nvs))?, sys_loop)?;

        let wifi_configuration = Configuration::AccessPoint(AccessPointConfiguration {
            ssid: WIFI_SSID.try_into().unwrap(),
            ssid_hidden: false,
            auth_method: AuthMethod::None,
            password: WIFI_PASSWORD.try_into().unwrap(),
            channel: WIFI_CHANNEL,
            max_connections: 4,
            ..Default::default()
        });

        wifi.set_configuration(&wifi_configuration)?;
        wifi.start()?;
        wifi.wait_netif_up()?;

        log::info!(
            "AP prêt. SSID: `{}` | DNS: http://{}.local | IP: http://192.168.71.1",
            WIFI_SSID,
            MDNS_HOSTNAME
        );

        let mut mdns = EspMdns::take()?;
        mdns.set_hostname(MDNS_HOSTNAME)?;
        mdns.set_instance_name(MDNS_INSTANCE_NAME)?;
        mdns.add_service(None, "_http", "_tcp", 80, &[])?;
        log::info!(
            "mDNS publié: http://{}.local (fallback IP: http://192.168.71.1)",
            MDNS_HOSTNAME
        );

        let mut server = EspHttpServer::new(&esp_idf_svc::http::server::Configuration {
            stack_size: SERVER_STACK_SIZE,
            max_open_sockets: 3,
            lru_purge_enable: true,
            ..Default::default()
        })
        .map_err(|e| e.0)?;

        register_routes(&mut server, moteur_bras, moteur_pince)?;

        Ok(Self {
            _wifi: wifi,
            _server: server,
            _mdns: mdns,
        })
    }
}

fn parse_speed_command(payload: &str) -> Option<(MotorTarget, i32)> {
    let payload = payload.trim_matches(|c: char| c.is_ascii_control() || c.is_whitespace());
    let (motor, speed) = payload.split_once(':')?;
    let speed = speed.trim().parse::<i32>().ok()?.clamp(-100, 100);

    let target = match motor.trim().to_ascii_lowercase().as_str() {
        "bras" => MotorTarget::Bras,
        "pince" => MotorTarget::Pince,
        _ => return None,
    };

    Some((target, speed))
}

fn register_routes(
    server: &mut EspHttpServer<'static>,
    moteur_bras: ServoController<'static>,
    moteur_pince: ServoController<'static>,
) -> Result<(), EspError> {
    let static_routes = [
        ("/", INDEX_HTML, "text/html; charset=utf-8"),
        ("/http", HTTP_INDEX_HTML, "text/html; charset=utf-8"),
        ("/style.css", STYLE_CSS, "text/css; charset=utf-8"),
        ("/style-v2.css", STYLE_CSS, "text/css; charset=utf-8"),
        (
            "/script.js",
            SCRIPT_JS,
            "application/javascript; charset=utf-8",
        ),
        (
            "/script-v2.js",
            SCRIPT_JS,
            "application/javascript; charset=utf-8",
        ),
        (
            "/script-http-v1.js",
            HTTP_SCRIPT_JS,
            "application/javascript; charset=utf-8",
        ),
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

    let controllers = Arc::new(Mutex::new(MotorControllers {
        moteur_bras,
        moteur_pince,
    }));

    let controllers_http = Arc::clone(&controllers);
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

            let Some((target, speed)) = parse_speed_command(payload) else {
                req.into_response(400, None, &API_HEADERS)?
                    .write_all(b"invalid_command")?;
                return Ok(());
            };

            log::info!("Commande HTTP reçue: `{}` -> speed={}", payload, speed);

            let mut motors = controllers_http
                .lock()
                .map_err(|_| EspIOError(EspError::from_infallible::<ESP_FAIL>()))?;
            motors.apply_speed(target, speed).map_err(EspIOError)?;

            req.into_response(200, None, &API_HEADERS)?
                .write_all(b"ok")?;
            Ok(())
        },
    )?;

    server.ws_handler(
        "/ws",
        move |ws: &mut EspHttpWsConnection| -> Result<(), EspError> {
            if ws.is_new() {
                log::info!("Nouvelle session WebSocket (fd={})", ws.session());
                ws.send(FrameType::Text(false), b"connected")?;
                return Ok(());
            }

            if ws.is_closed() {
                log::info!("Session WebSocket fermée (fd={})", ws.session());
                return Ok(());
            }

            // NOTE: API ESP-IDF WS: d'abord metadata (len/type), puis payload.
            let (frame_type, len) = ws.recv(&mut [])?;

            if len > WS_MAX_PAYLOAD_LEN {
                ws.send(FrameType::Text(false), b"payload_too_large")?;
                ws.send(FrameType::Close, &[])?;
                return Err(EspError::from_infallible::<ESP_ERR_INVALID_SIZE>());
            }

            let mut buffer = [0_u8; WS_MAX_PAYLOAD_LEN];
            let received_len = if len > 0 {
                let (_frame_type, received_len) = ws.recv(&mut buffer)?;
                received_len
            } else {
                0
            };

            match frame_type {
                FrameType::Ping => {
                    ws.send(FrameType::Pong, &buffer[..received_len])?;
                    return Ok(());
                }
                FrameType::Pong
                | FrameType::Close
                | FrameType::SocketClose
                | FrameType::Continue(_) => return Ok(()),
                FrameType::Text(_) | FrameType::Binary(_) => {}
            }

            if received_len == 0 {
                return Ok(());
            }

            let payload = match str::from_utf8(&buffer[..received_len]) {
                Ok(value) => value,
                Err(_) => {
                    ws.send(FrameType::Text(false), b"invalid_utf8")?;
                    return Ok(());
                }
            };

            let Some((target, speed)) = parse_speed_command(payload) else {
                ws.send(FrameType::Text(false), b"invalid_command")?;
                return Ok(());
            };

            log::info!("Commande WS reçue: `{}` -> speed={}", payload, speed);

            let mut motors = controllers
                .lock()
                .map_err(|_| EspError::from_infallible::<ESP_FAIL>())?;
            motors.apply_speed(target, speed)?;

            ws.send(FrameType::Text(false), b"ok")?;
            Ok(())
        },
    )?;

    Ok(())
}
