pub mod http;
pub mod ws;

use std::sync::Arc;

use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::sys::EspError;

use crate::network::manager::SharedMotorControllers;

pub fn register(
    server: &mut EspHttpServer<'static>,
    controllers: SharedMotorControllers,
) -> Result<(), EspError> {
    http::register(server, Arc::clone(&controllers))?;
    ws::register(server, controllers)?;
    Ok(())
}
