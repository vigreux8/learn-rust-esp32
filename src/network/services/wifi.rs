use core::convert::TryInto;

use esp_idf_svc::wifi::{
    AccessPointConfiguration, AuthMethod, BlockingWifi, Configuration, EspWifi,
};

pub const WIFI_SSID: &str = "cerveau-moteur-esp32";
pub const WIFI_PASSWORD: &str = "";
pub const WIFI_CHANNEL: u8 = 1;

pub fn access_point_configuration() -> Configuration {
    Configuration::AccessPoint(AccessPointConfiguration {
        ssid: WIFI_SSID.try_into().unwrap(),
        ssid_hidden: false,
        auth_method: AuthMethod::None,
        password: WIFI_PASSWORD.try_into().unwrap(),
        channel: WIFI_CHANNEL,
        max_connections: 4,
        ..Default::default()
    })
}

pub fn start_access_point(wifi: &mut BlockingWifi<EspWifi<'static>>) -> Result<(), esp_idf_svc::sys::EspError> {
    let wifi_configuration = access_point_configuration();
    wifi.set_configuration(&wifi_configuration)?;
    wifi.start()?;
    wifi.wait_netif_up()?;
    Ok(())
}
