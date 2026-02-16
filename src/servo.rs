use esp_idf_svc::hal::gpio::OutputPin;
use esp_idf_svc::hal::ledc::config::TimerConfig;
use esp_idf_svc::hal::ledc::*;
use esp_idf_svc::hal::peripheral::Peripheral;
use esp_idf_svc::hal::prelude::*; // Importe les unités comme .Hz()
use esp_idf_svc::sys::EspError;

/// Le Bus gère le Timer unique à 50Hz partagé par tous les servos.
pub struct ServoBus<'a, T: LedcTimer> {
    timer: LedcTimerDriver<'a, T>,
}

impl<'a, T: LedcTimer> ServoBus<'a, T> {
    /// Initialise le timer pour les servos (SG90 = 50Hz).
    pub fn new(timer_periph: impl Peripheral<P = T> + 'a) -> Result<Self, EspError> {
        let timer = LedcTimerDriver::new(
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
        Ok(ServoController { pwm })
    }
}

/// Le contrôleur individuel pour chaque moteur.
pub struct ServoController<'a> {
    pwm: LedcDriver<'a>,
}

impl<'a> ServoController<'a> {
    /// Définit l'angle du servo entre 0 et 180 degrés.
    pub fn set_angle(&mut self, angle: u32) -> Result<(), EspError> {
        let max_duty = self.pwm.get_max_duty();

        // Calcul pour SG90 (0.5ms à 2.5ms sur une période de 20ms)
        // Rapport cyclique : 0.5/20 = 2.5% (min) et 2.5/20 = 12.5% (max)
        let min = max_duty / 40;
        let max = max_duty / 8;

        let duty = self.interpolate(angle, min, max);
        self.pwm.set_duty(duty)
    }

    /// Fonction utilitaire pour mapper l'angle vers le duty cycle.
    fn interpolate(&self, angle: u32, min: u32, max: u32) -> u32 {
        let clamped_angle = angle.min(180);
        (clamped_angle * (max - min) / 180) + min
    }
}
