use core::str;

use esp_idf_svc::http::server::ws::EspHttpWsConnection;
use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::sys::{EspError, ESP_ERR_INVALID_SIZE, ESP_FAIL};
use esp_idf_svc::ws::FrameType;

use crate::network::manager::{parse_speed_command, SharedMotorControllers, WS_MAX_PAYLOAD_LEN};

pub fn register(
    server: &mut EspHttpServer<'static>,
    controllers: SharedMotorControllers,
) -> Result<(), EspError> {
    server.ws_handler(
        "/ws",
        None,
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
