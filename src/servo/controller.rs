use esp_idf_svc::hal::ledc::*;
use esp_idf_svc::sys::EspError;

/// Le Bus gère le Timer unique à 50Hz partagé par tous les servos.

/// Le contrôleur individuel pour chaque moteur.
pub struct ServoController<'a> {
    pwm: LedcDriver<'a>,
}

impl<'a> ServoController<'a> {
    pub fn new(pwm: LedcDriver<'a>) -> Self {
        Self { pwm }
    }

    /// Définit l'angle du servo entre 0 et 180 degrés.
    pub fn set_speed(&mut self, speed: i32) -> Result<(), EspError> {
        let max_duty = self.pwm.get_max_duty();
        let clamped_speed = speed.clamp(-100, 100);

        // Point mort (1.5ms) -> environ 7.5% du cycle
        let neutral = (max_duty * 150) / 2000; // 1.5ms / 20ms * max_duty

        // On calcule l'écart (0.5ms de chaque côté pour atteindre 1ms ou 2ms)
        let range = (max_duty * 50) / 2000; // 0.5ms / 20ms * max_duty

        let duty = (neutral as i32 + (clamped_speed * range as i32 / 100)) as u32;

        self.pwm.set_duty(duty)
    }

    pub fn stop(&mut self) -> Result<(), EspError> {
        self.set_speed(0)
    }
}
