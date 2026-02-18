use core::str;

use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::http::Method;
use esp_idf_svc::io::{EspIOError, Write};
use esp_idf_svc::sys::{EspError, ESP_FAIL};

use crate::network::manager::{parse_speed_command, SharedMotorControllers, WS_MAX_PAYLOAD_LEN};

const INDEX_HTML: &str = include_str!("../site/main.html");
const HTTP_INDEX_HTML: &str = include_str!("../site/http.html");
const STYLE_CSS: &str = include_str!("../site/style.css");
const UI_JS: &str = include_str!("../site/script/ui.js");
const MAIN_JS: &str = include_str!("../site/script/main.js");
const HTTP_JS: &str = include_str!("../site/script/http.js");
const API_NETWORK_JS: &str = include_str!("../site/script/api/network.js");
const API_SERVO_JS: &str = include_str!("../site/script/api/servo.js");

pub fn register(
    server: &mut EspHttpServer<'static>,
    controllers: SharedMotorControllers,
) -> Result<(), EspError> {
    let static_routes = [
        ("/", INDEX_HTML, "text/html; charset=utf-8"),
        ("/http", HTTP_INDEX_HTML, "text/html; charset=utf-8"),
        ("/style.css", STYLE_CSS, "text/css; charset=utf-8"),
        (
            "/script/ui.js",
            UI_JS,
            "application/javascript; charset=utf-8",
        ),
        (
            "/script/main.js",
            MAIN_JS,
            "application/javascript; charset=utf-8",
        ),
        (
            "/script/http.js",
            HTTP_JS,
            "application/javascript; charset=utf-8",
        ),
        (
            "/script/api/network.js",
            API_NETWORK_JS,
            "application/javascript; charset=utf-8",
        ),
        (
            "/script/api/servo.js",
            API_SERVO_JS,
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

            let mut motors = controllers
                .lock()
                .map_err(|_| EspIOError(EspError::from_infallible::<ESP_FAIL>()))?;
            motors.apply_speed(target, speed).map_err(EspIOError)?;

            req.into_response(200, None, &API_HEADERS)?.write_all(b"ok")?;
            Ok(())
        },
    )?;

    Ok(())
}
