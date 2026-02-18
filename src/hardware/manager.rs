use super::servo::ServoBus;

use esp_idf_svc::hal::ledc::LedcTimer;
use esp_idf_svc::hal::peripheral::Peripheral;
use esp_idf_svc::sys::EspError;

pub struct HardwareManager<'a, T: LedcTimer> {
    servo_bus: ServoBus<'a, T>,
}

impl<'a, T: LedcTimer> HardwareManager<'a, T> {
    pub fn new(timer_periph: impl Peripheral<P = T> + 'a) -> Result<Self, EspError> {
        let servo_bus = ServoBus::new(timer_periph)?;
        Ok(Self { servo_bus })
    }

    pub fn servo_bus(&self) -> &ServoBus<'a, T> {
        &self.servo_bus
    }
}
