use esp_idf_hal::delay::FreeRtos;
use esp_idf_hal::gpio::{Input, InputPin, PinDriver, Pull};
use esp_idf_svc::sys::EspError;

const POLL_MS: u32 = 20;
const DEBOUNCE_MS: u32 = 30;

/// Capteur fin de course câblé en C + NO:
/// - repos: HIGH (pull-up)
/// - enclenché: LOW
pub struct CapteurFinCourse<'d> {
    pin: PinDriver<'d, Input>,
}

impl<'d> CapteurFinCourse<'d> {
    pub fn new(pin: impl InputPin + 'd) -> Result<Self, EspError> {
        Ok(Self {
            pin: PinDriver::input(pin, Pull::Up)?,
        })
    }

    pub fn is_enclenche(&self) -> bool {
        self.pin.is_low()
    }

    pub fn is_repos(&self) -> bool {
        self.pin.is_high()
    }

    pub fn wait_for_appui(&self) {
        while self.is_repos() {
            FreeRtos::delay_ms(POLL_MS);
        }

        FreeRtos::delay_ms(DEBOUNCE_MS);

        while self.is_enclenche() {
            FreeRtos::delay_ms(POLL_MS);
        }
    }
}
