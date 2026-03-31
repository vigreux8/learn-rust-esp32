use super::controller_sg_360::ServoController;

use esp_idf_hal::gpio::OutputPin;
use esp_idf_hal::ledc::config::TimerConfig;
use esp_idf_hal::ledc::{
    LedcChannel, LedcDriver, LedcTimer, LedcTimerDriver, Resolution, SpeedMode,
};
use esp_idf_hal::units::FromValueType;
use esp_idf_svc::sys::EspError;

pub struct ServoBus<'a, S: SpeedMode> {
    timer: LedcTimerDriver<'a, S>,
}

impl<'a, S: SpeedMode> ServoBus<'a, S> {
    /// Initialise le timer pour les servos (SG90 = 50Hz).
    pub fn new<T: LedcTimer<SpeedMode = S> + 'a>(timer: T) -> Result<Self, EspError> {
        let timer = LedcTimerDriver::new(
            timer,
            &TimerConfig::new()
                .frequency(50.Hz().into())
                .resolution(Resolution::Bits14),
        )?;

        Ok(Self { timer })
    }

    /// Crée un nouveau contrôleur de servo lié à ce bus.
    pub fn add_servo<C>(
        &self,
        channel: C,
        pin: impl OutputPin + 'a,
    ) -> Result<ServoController<'a>, EspError>
    where
        C: LedcChannel<SpeedMode = S> + 'a,
    {
        let pwm = LedcDriver::new(channel, &self.timer, pin)?;
        Ok(ServoController::new(pwm))
    }
}
