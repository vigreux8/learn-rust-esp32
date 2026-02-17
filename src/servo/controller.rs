use esp_idf_svc::hal::ledc::*;
use esp_idf_svc::sys::EspError;

const SPEED_MIN: i32 = -100;
const SPEED_MAX: i32 = 100;
const PWM_PERIOD_US: u32 = 20_000;
const PULSE_NEUTRAL_US: u32 = 1_500;
const PULSE_RANGE_US: u32 = 500;

/// Le Bus gère le Timer unique à 50Hz partagé par tous les servos.

/// Le contrôleur individuel pour chaque moteur.
pub struct ServoController<'a> {
    pwm: LedcDriver<'a>,
}

impl<'a> ServoController<'a> {
    pub fn new(pwm: LedcDriver<'a>) -> Self {
        Self { pwm }
    }

    /// Définit l'angle du servo entre -100 a 100
    pub fn set_speed(&mut self, speed: i32) -> Result<(), EspError> {
        let max_duty = self.pwm.get_max_duty();
        let clamped_speed = speed.clamp(SPEED_MIN, SPEED_MAX);

        // Point mort (1.5ms) pour un cycle de 20ms (50Hz).
        let neutral = (max_duty * PULSE_NEUTRAL_US) / PWM_PERIOD_US;

        // Ecart de 0.5ms autour du neutre, soit plage 1.0ms -> 2.0ms.
        let range = (max_duty * PULSE_RANGE_US) / PWM_PERIOD_US;

        let duty = (neutral as i32 + (clamped_speed * range as i32 / SPEED_MAX)) as u32;

        self.pwm.set_duty(duty)
    }

    pub fn stop(&mut self) -> Result<(), EspError> {
        self.set_speed(0)
    }
}
