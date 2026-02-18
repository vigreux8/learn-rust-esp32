use core::convert::TryInto;

use esp_idf_svc::eventloop::EspSystemEventLoop;
use esp_idf_svc::hal::modem::Modem;
use esp_idf_svc::nvs::EspDefaultNvsPartition;
use esp_idf_svc::sys::EspError;
use esp_idf_svc::wifi::{
    AccessPointConfiguration, AuthMethod, BlockingWifi, Configuration, EspWifi,
};

pub struct WifiService;

impl WifiService {
    pub const SSID: &'static str = "cerveau-moteur-esp32";
    pub const PASSWORD: &'static str = "";
    pub const CHANNEL: u8 = 1;
    pub const MAX_CONNECTIONS: u16 = 4;

    pub fn init(
        modem: Modem,
        sys_loop: EspSystemEventLoop,
        nvs: EspDefaultNvsPartition,
    ) -> Result<BlockingWifi<EspWifi<'static>>, EspError> {
        let mut wifi = BlockingWifi::wrap(EspWifi::new(modem, sys_loop.clone(), Some(nvs))?, sys_loop)?;

        let config = Configuration::AccessPoint(AccessPointConfiguration {
            ssid: Self::SSID.try_into().unwrap(),
            ssid_hidden: false,
            auth_method: AuthMethod::None,
            password: Self::PASSWORD.try_into().unwrap(),
            channel: Self::CHANNEL,
            max_connections: Self::MAX_CONNECTIONS,
            ..Default::default()
        });

        wifi.set_configuration(&config)?;
        wifi.start()?;
        wifi.wait_netif_up()?;

        Ok(wifi)
    }
}
