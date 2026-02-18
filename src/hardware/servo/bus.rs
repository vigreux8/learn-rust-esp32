// use crate::servo::controller::ServoController;  // j'utilise super car le fichier bus et controleur sont trés lié  il y a peut de chance qu'il soit séparer
use super::controller_sg_360::ServoController;

use esp_idf_svc::hal::gpio::OutputPin;
use esp_idf_svc::hal::ledc::config::TimerConfig;
use esp_idf_svc::hal::ledc::{LedcChannel, LedcDriver, LedcTimer, LedcTimerDriver, Resolution};
use esp_idf_svc::hal::peripheral::Peripheral;
use esp_idf_svc::hal::prelude::*;
use esp_idf_svc::sys::EspError;

pub struct ServoBus<'a, T: LedcTimer> {
    timer: LedcTimerDriver<'a, T>,
}

impl<'a, T: LedcTimer> ServoBus<'a, T> {
    /// Initialise le timer pour les servos (SG90 = 50Hz).
    pub fn new(timer_periph: impl Peripheral<P = T> + 'a) -> Result<Self, EspError> {
        let timer: LedcTimerDriver<'_, T> = LedcTimerDriver::new(
            timer_periph,
            &TimerConfig::new()
                .frequency(50.Hz().into())
                .resolution(Resolution::Bits14),
        )?;

        Ok(Self { timer })
    }

    /// Crée un nouveau contrôleur de servo lié à ce bus.
    pub fn add_servo<C, P>(
        &self,
        channel: impl Peripheral<P = C> + 'a,
        pin: impl Peripheral<P = P> + 'a,
    ) -> Result<ServoController<'a>, EspError>
    where
        C: LedcChannel<SpeedMode = T::SpeedMode>, // <--- LA FIX
        P: OutputPin,
    {
        let pwm = LedcDriver::new(channel, &self.timer, pin)?;
        Ok(ServoController::new(pwm))
    }
}
