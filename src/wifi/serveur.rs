use core::convert::TryInto;
use core::str;

use esp_idf_svc::eventloop::EspSystemEventLoop;
use esp_idf_svc::hal::modem::Modem;
use esp_idf_svc::http::server::ws::EspHttpWsConnection;
use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::http::Method;
use esp_idf_svc::io::{EspIOError, Write};
use esp_idf_svc::nvs::EspDefaultNvsPartition;
use esp_idf_svc::sys::{EspError, ESP_FAIL};
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

const INDEX_HTML: &str = include_str!("site/main.html");
const STYLE_CSS: &str = include_str!("site/style.css");
const SCRIPT_JS: &str = include_str!("site/script.js");

pub struct WifiServer<'a> {
    _wifi: BlockingWifi<EspWifi<'static>>,
    _server: EspHttpServer<'a>,
}

struct MotorControllers<'a> {
    moteur_bras: ServoController<'a>,
    moteur_pince: ServoController<'a>,
}

enum MotorTarget {
    Bras,
    Pince,
}

impl MotorControllers<'_> {
    fn apply_speed(&mut self, target: MotorTarget, speed: i32) -> Result<(), EspError> {
        match target {
            MotorTarget::Bras => self.moteur_bras.set_speed(speed),
            MotorTarget::Pince => self.moteur_pince.set_speed(speed),
        }
    }
}

impl<'a> WifiServer<'a> {
    pub fn start(
        modem: Modem,
        sys_loop: EspSystemEventLoop,
        nvs: EspDefaultNvsPartition,
        moteur_bras: ServoController<'a>,
        moteur_pince: ServoController<'a>,
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

        log::info!("AP prêt. SSID: `{}` | Ouvre http://192.168.71.1", WIFI_SSID);

        let mut server = unsafe {
            EspHttpServer::new_nonstatic(&esp_idf_svc::http::server::Configuration {
                stack_size: SERVER_STACK_SIZE,
                ..Default::default()
            })
        }
        .map_err(|e| e.0)?;

        register_routes(&mut server, moteur_bras, moteur_pince)?;

        Ok(Self {
            _wifi: wifi,
            _server: server,
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

fn register_routes<'a>(
    server: &mut EspHttpServer<'a>,
    moteur_bras: ServoController<'a>,
    moteur_pince: ServoController<'a>,
) -> Result<(), EspError> {
    server.fn_handler("/", Method::Get, |req| -> Result<(), EspIOError> {
        req.into_response(
            200,
            None,
            &[
                ("Content-Type", "text/html; charset=utf-8"),
                ("Cache-Control", "no-store, max-age=0"),
            ],
        )?
            .write_all(INDEX_HTML.as_bytes())?;
        Ok(())
    })?;

    server.fn_handler("/style.css", Method::Get, |req| -> Result<(), EspIOError> {
        req.into_response(
            200,
            None,
            &[
                ("Content-Type", "text/css; charset=utf-8"),
                ("Cache-Control", "no-store, max-age=0"),
            ],
        )?
            .write_all(STYLE_CSS.as_bytes())?;
        Ok(())
    })?;

    server.fn_handler("/style-v2.css", Method::Get, |req| -> Result<(), EspIOError> {
        req.into_response(
            200,
            None,
            &[
                ("Content-Type", "text/css; charset=utf-8"),
                ("Cache-Control", "no-store, max-age=0"),
            ],
        )?
        .write_all(STYLE_CSS.as_bytes())?;
        Ok(())
    })?;

    server.fn_handler("/script.js", Method::Get, |req| -> Result<(), EspIOError> {
        req.into_response(
            200,
            None,
            &[
                ("Content-Type", "application/javascript; charset=utf-8"),
                ("Cache-Control", "no-store, max-age=0"),
            ],
        )?
        .write_all(SCRIPT_JS.as_bytes())?;
        Ok(())
    })?;

    server.fn_handler("/script-v2.js", Method::Get, |req| -> Result<(), EspIOError> {
        req.into_response(
            200,
            None,
            &[
                ("Content-Type", "application/javascript; charset=utf-8"),
                ("Cache-Control", "no-store, max-age=0"),
            ],
        )?
        .write_all(SCRIPT_JS.as_bytes())?;
        Ok(())
    })?;

    let controllers = Arc::new(Mutex::new(MotorControllers {
        moteur_bras,
        moteur_pince,
    }));

    server.ws_handler("/ws", move |ws: &mut EspHttpWsConnection| -> Result<(), EspError> {
        if ws.is_new() {
            log::info!("Nouvelle session WebSocket (fd={})", ws.session());
            ws.send(FrameType::Text(false), b"connected")?;
            return Ok(());
        }

        if ws.is_closed() {
            log::info!("Session WebSocket fermée (fd={})", ws.session());
            return Ok(());
        }

        let (frame_type, len) = ws.recv(&mut [])?;
        if !matches!(frame_type, FrameType::Text(_) | FrameType::Binary(_)) {
            return Ok(());
        }

        if len == 0 {
            return Ok(());
        }

        if len > WS_MAX_PAYLOAD_LEN {
            ws.send(FrameType::Text(false), b"payload_too_large")?;
            return Ok(());
        }

        let mut buffer = [0_u8; WS_MAX_PAYLOAD_LEN];
        let (_frame_type, received_len) = ws.recv(&mut buffer)?;

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
    })?;

    Ok(())
}
