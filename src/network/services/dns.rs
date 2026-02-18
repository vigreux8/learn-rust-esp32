use esp_idf_svc::mdns::EspMdns;
use esp_idf_svc::sys::EspError;

pub const MDNS_HOSTNAME: &str = "servo";
pub const MDNS_INSTANCE_NAME: &str = "ESP32 Servo Controller";

pub fn setup_mdns() -> Result<EspMdns, EspError> {
    let mut mdns = EspMdns::take()?;
    mdns.set_hostname(MDNS_HOSTNAME)?;
    mdns.set_instance_name(MDNS_INSTANCE_NAME)?;
    mdns.add_service(None, "_http", "_tcp", 80, &[])?;
    Ok(mdns)
}
