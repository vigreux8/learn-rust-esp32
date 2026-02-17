use core::convert::TryInto;

use esp_idf_svc::eventloop::EspSystemEventLoop;
use esp_idf_svc::hal::modem::Modem;
use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::http::Method;
use esp_idf_svc::io::{EspIOError, Write};
use esp_idf_svc::nvs::EspDefaultNvsPartition;
use esp_idf_svc::sys::EspError;
use esp_idf_svc::wifi::{
    AccessPointConfiguration, AuthMethod, BlockingWifi, Configuration, EspWifi,
};

const WIFI_SSID: &str = "cerveau-moteur-esp32";
const WIFI_PASSWORD: &str = "";
const WIFI_CHANNEL: u8 = 1;
const SERVER_STACK_SIZE: usize = 8192;

const INDEX_HTML: &str = include_str!("site/main.html");
const STYLE_CSS: &str = include_str!("site/style.css");
const SCRIPT_JS: &str = include_str!("site/script.js");

pub struct WifiServer {
    _wifi: BlockingWifi<EspWifi<'static>>,
    _server: EspHttpServer<'static>,
}

impl WifiServer {
    pub fn start(
        modem: Modem,
        sys_loop: EspSystemEventLoop,
        nvs: EspDefaultNvsPartition,
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

        let mut server = EspHttpServer::new(&esp_idf_svc::http::server::Configuration {
            stack_size: SERVER_STACK_SIZE,
            ..Default::default()
        })
        .map_err(|e| e.0)?;

        register_routes(&mut server)?;

        Ok(Self {
            _wifi: wifi,
            _server: server,
        })
    }
}

fn register_routes(server: &mut EspHttpServer<'static>) -> Result<(), EspError> {
    server.fn_handler("/", Method::Get, |req| -> Result<(), EspIOError> {
        req.into_response(200, None, &[("Content-Type", "text/html; charset=utf-8")])?
            .write_all(INDEX_HTML.as_bytes())?;
        Ok(())
    })?;

    server.fn_handler("/style.css", Method::Get, |req| -> Result<(), EspIOError> {
        req.into_response(200, None, &[("Content-Type", "text/css; charset=utf-8")])?
            .write_all(STYLE_CSS.as_bytes())?;
        Ok(())
    })?;

    server.fn_handler("/script.js", Method::Get, |req| -> Result<(), EspIOError> {
        req.into_response(
            200,
            None,
            &[("Content-Type", "application/javascript; charset=utf-8")],
        )?
        .write_all(SCRIPT_JS.as_bytes())?;
        Ok(())
    })?;

    server.fn_handler("/hello", Method::Post, |req| -> Result<(), EspIOError> {
        println!("Hello World");
        log::info!("Hello World");

        req.into_response(200, None, &[("Content-Type", "text/plain; charset=utf-8")])?
            .write_all(b"Hello World")?;
        Ok(())
    })?;

    Ok(())
}
