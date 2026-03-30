use super::servo::ServoBus;

use esp_idf_hal::ledc::{LedcTimer, SpeedMode};
use esp_idf_svc::sys::EspError;

pub struct HardwareManager<'a, S: SpeedMode> {
    servo_bus: ServoBus<'a, S>,
}

impl<'a, S: SpeedMode> HardwareManager<'a, S> {
    pub fn new<T: LedcTimer<SpeedMode = S> + 'a>(timer: T) -> Result<Self, EspError> {
        let servo_bus = ServoBus::new(timer)?;
        Ok(Self { servo_bus })
    }

    pub fn servo_bus(&self) -> &ServoBus<'a, S> {
        &self.servo_bus
    }
}
