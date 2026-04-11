use super::capteur_fin_course::CapteurFinCourse;
use super::sd_carte::{SdCarte, SdCarteConfig, SdCartePins};
use super::servo::controller_sg_360::ServoController;
use super::servo::ServoBus;

use esp_idf_hal::gpio::{InputPin, OutputPin};
use esp_idf_hal::ledc::LedcChannel;
use esp_idf_hal::ledc::{LedcTimer, SpeedMode};
use esp_idf_hal::spi::SpiAnyPins;
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

    pub fn add_servo<C>(
        &self,
        channel: C,
        pin: impl OutputPin + 'a,
    ) -> Result<ServoController<'a>, EspError>
    where
        C: LedcChannel<SpeedMode = S> + 'a,
    {
        self.servo_bus.add_servo(channel, pin)
    }

    pub fn add_capteur_fin_course(
        &self,
        pin: impl InputPin + 'a,
    ) -> Result<CapteurFinCourse<'a>, EspError> {
        CapteurFinCourse::new(pin)
    }

    pub fn add_sd_carte<SPI, CS, SCK, MOSI, MISO>(
        &self,
        spi: SPI,
        pins: SdCartePins<CS, SCK, MOSI, MISO>,
        config: SdCarteConfig<'_>,
    ) -> Result<SdCarte<'a>, EspError>
    where
        SPI: SpiAnyPins + 'a,
        CS: OutputPin + 'a,
        SCK: OutputPin + 'a,
        MOSI: OutputPin + 'a,
        MISO: InputPin + 'a,
    {
        SdCarte::new(spi, pins, config)
    }

    pub fn add_sd_carte_default<SPI, CS, SCK, MOSI, MISO>(
        &self,
        spi: SPI,
        cs: CS,
        sck: SCK,
        mosi: MOSI,
        miso: MISO,
    ) -> Result<SdCarte<'a>, EspError>
    where
        SPI: SpiAnyPins + 'a,
        CS: OutputPin + 'a,
        SCK: OutputPin + 'a,
        MOSI: OutputPin + 'a,
        MISO: InputPin + 'a,
    {
        self.add_sd_carte(spi, SdCartePins { cs, sck, mosi, miso }, SdCarteConfig::default())
    }
}
