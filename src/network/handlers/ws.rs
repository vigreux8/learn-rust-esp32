use core::str;
use std::net::Ipv4Addr;

use esp_idf_svc::http::server::ws::EspHttpWsConnection;
use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::sys::{
    lwip_getpeername, sockaddr_in, socklen_t, EspError, AF_INET, ESP_ERR_INVALID_SIZE, ESP_FAIL,
};
use esp_idf_svc::ws::FrameType;

use crate::network::manager::{
    format_mac, parse_speed_command, ClientSession, SharedClientSessions, SharedMotorControllers,
    WS_MAX_PAYLOAD_LEN,
};

fn source_ipv4_from_socket(socket_fd: i32) -> Result<Ipv4Addr, EspError> {
    if socket_fd == -1 {
        return Err(EspError::from_infallible::<ESP_FAIL>());
    }

    let mut addr = sockaddr_in {
        sin_len: core::mem::size_of::<sockaddr_in>() as _,
        sin_family: AF_INET as _,
        ..Default::default()
    };
    let mut addr_len = core::mem::size_of::<sockaddr_in>() as socklen_t;

    unsafe {
        if lwip_getpeername(socket_fd, &mut addr as *mut _ as *mut _, &mut addr_len) != 0 {
            return Err(EspError::from_infallible::<ESP_FAIL>());
        }
    }

    Ok(Ipv4Addr::from(u32::from_be(addr.sin_addr.s_addr)))
}

fn resolve_client_session(sessions: &SharedClientSessions, ip: Ipv4Addr) -> Option<ClientSession> {
    let store = sessions.lock().ok()?;
    store.find_session_by_ip(ip)
}

fn log_ws_identity(
    context: &str,
    source_ip: Option<Ipv4Addr>,
    session: Option<ClientSession>,
    socket_fd: i32,
) {
    match (source_ip, session) {
        (Some(ip), Some(session)) => {
            let session_label = session
                .slot
                .map(|slot| slot.to_string())
                .unwrap_or_else(|| "inconnue".to_string());
            log::info!(
                "{} fd={} ip={} mac={} session={}",
                context,
                socket_fd,
                ip,
                format_mac(&session.mac),
                session_label
            );
        }
        (Some(ip), None) => {
            log::warn!("{} fd={} ip={} mac=inconnue", context, socket_fd, ip);
        }
        (None, _) => {
            log::warn!("{} fd={} ip=inconnue", context, socket_fd);
        }
    }
}

pub fn register(
    server: &mut EspHttpServer<'static>,
    controllers: SharedMotorControllers,
    sessions: SharedClientSessions,
) -> Result<(), EspError> {
    server.ws_handler(
        "/ws",
        None,
        move |ws: &mut EspHttpWsConnection| -> Result<(), EspError> {
            if ws.is_new() {
                let source_ip = source_ipv4_from_socket(ws.session()).ok();
                let client_session = source_ip.and_then(|ip| resolve_client_session(&sessions, ip));
                log_ws_identity(
                    "Nouvelle session WebSocket",
                    source_ip,
                    client_session,
                    ws.session(),
                );
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

            let source_ip = source_ipv4_from_socket(ws.session()).ok();
            let client_session = source_ip.and_then(|ip| resolve_client_session(&sessions, ip));
            log_ws_identity("Commande WS recu", source_ip, client_session, ws.session());
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
