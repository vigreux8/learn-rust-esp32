use esp_idf_svc::mdns::EspMdns;
use esp_idf_svc::sys::EspError;

pub struct DnsService;

impl DnsService {
    pub const HOSTNAME: &'static str = "servo";
    pub const INSTANCE_NAME: &'static str = "ESP32 Servo Controller";

    pub fn init() -> Result<EspMdns, EspError> {
        let mut mdns = EspMdns::take()?;
        mdns.set_hostname(Self::HOSTNAME)?;
        mdns.set_instance_name(Self::INSTANCE_NAME)?;
        mdns.add_service(None, "_http", "_tcp", 80, &[])?;
        Ok(mdns)
    }
}
