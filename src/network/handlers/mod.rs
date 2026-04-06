pub mod http;
pub mod ws;

use std::sync::Arc;

use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::sys::EspError;

use crate::network::manager::{SharedClientSessions, SharedMotorControllers};

pub fn register(
    server: &mut EspHttpServer<'static>,
    controllers: SharedMotorControllers,
    sessions: SharedClientSessions,
) -> Result<(), EspError> {
    http::register(server, Arc::clone(&controllers), Arc::clone(&sessions))?;
    ws::register(server, controllers, sessions)?;
    Ok(())
}
