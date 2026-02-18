use esp_idf_svc::http::server::{Configuration, EspHttpServer};
use esp_idf_svc::sys::EspError;

pub struct HttpServerService;

impl HttpServerService {
    pub const STACK_SIZE: usize = 8192;
    pub const MAX_OPEN_SOCKETS: usize = 3;
    pub const LRU_PURGE_ENABLE: bool = true;

    pub fn init() -> Result<EspHttpServer<'static>, EspError> {
        EspHttpServer::new(&Configuration {
            stack_size: Self::STACK_SIZE,
            max_open_sockets: Self::MAX_OPEN_SOCKETS,
            lru_purge_enable: Self::LRU_PURGE_ENABLE,
            ..Default::default()
        })
        .map_err(|e| e.0)
    }
}
