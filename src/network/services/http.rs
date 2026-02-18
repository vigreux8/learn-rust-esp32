use esp_idf_svc::http::server::{Configuration, EspHttpServer};
use esp_idf_svc::sys::EspError;

pub const SERVER_STACK_SIZE: usize = 8192;
pub const SERVER_MAX_OPEN_SOCKETS: usize = 3;
pub const SERVER_LRU_PURGE_ENABLE: bool = true;

pub fn setup_http_server() -> Result<EspHttpServer<'static>, EspError> {
    EspHttpServer::new(&Configuration {
        stack_size: SERVER_STACK_SIZE,
        max_open_sockets: SERVER_MAX_OPEN_SOCKETS,
        lru_purge_enable: SERVER_LRU_PURGE_ENABLE,
        ..Default::default()
    })
    .map_err(|e| e.0)
}
