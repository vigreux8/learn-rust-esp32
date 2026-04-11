use std::fs::{self, File};
use std::io::Write;

use esp_idf_hal::gpio::{AnyIOPin, InputPin, OutputPin};
use esp_idf_hal::sd::{spi::SdSpiHostDriver, SdCardConfiguration, SdCardDriver};
use esp_idf_hal::spi::{config::DriverConfig, Dma, SpiAnyPins, SpiDriver};
use esp_idf_svc::fs::fatfs::Fatfs;
use esp_idf_svc::io::vfs::MountedFatfs;
use esp_idf_svc::sys::{EspError, ESP_FAIL};

pub struct SdCartePins<CS, SCK, MOSI, MISO> {
    pub cs: CS,
    pub sck: SCK,
    pub mosi: MOSI,
    pub miso: MISO,
}

pub struct SdCarteConfig<'a> {
    pub drive: u8,
    pub mount_point: &'a str,
    pub max_open_files: usize,
    pub dma_transfer_bytes: usize,
}

impl Default for SdCarteConfig<'_> {
    fn default() -> Self {
        Self {
            drive: 0,
            mount_point: "/sdcard",
            max_open_files: 4,
            dma_transfer_bytes: 4096,
        }
    }
}

type SdSpiDriver<'d> = SdCardDriver<SdSpiHostDriver<'d, SpiDriver<'d>>>;

pub struct SdCarte<'d> {
    sd_driver: SdSpiDriver<'d>,
    drive: u8,
    mount_point: String,
    max_open_files: usize,
}

impl<'d> SdCarte<'d> {
    pub fn new<SPI, CS, SCK, MOSI, MISO>(
        spi: SPI,
        pins: SdCartePins<CS, SCK, MOSI, MISO>,
        config: SdCarteConfig<'_>,
    ) -> Result<Self, EspError>
    where
        SPI: SpiAnyPins + 'd,
        CS: OutputPin + 'd,
        SCK: OutputPin + 'd,
        MOSI: OutputPin + 'd,
        MISO: InputPin + 'd,
    {
        let spi_driver = SpiDriver::new(
            spi,
            pins.sck,
            pins.mosi,
            Some(pins.miso),
            &DriverConfig::default().dma(Dma::Auto(config.dma_transfer_bytes)),
        )?;

        let mut sd_config = SdCardConfiguration::new();
        sd_config.speed_khz = 400;
        sd_config.command_timeout_ms = 1000;

        let sd_driver = SdCardDriver::new_spi(
            SdSpiHostDriver::new(
                spi_driver,
                Some(pins.cs),
                AnyIOPin::none(),
                AnyIOPin::none(),
                AnyIOPin::none(),
                None,
            )?,
            &sd_config,
        )?;

        Ok(Self {
            sd_driver,
            drive: config.drive,
            mount_point: config.mount_point.to_owned(),
            max_open_files: config.max_open_files,
        })
    }

    pub fn write_text_file(&mut self, file_name: &str, content: &str) -> Result<(), EspError> {
        let full_path = self.path_for(file_name);

        let mut fatfs = Fatfs::new_sdcard(self.drive, &mut self.sd_driver)?;
        let _mounted_fatfs =
            MountedFatfs::mount(&mut fatfs, &self.mount_point, self.max_open_files)?;

        let mut file =
            File::create(&full_path).map_err(|err| io_error_to_esp("Création fichier SD", err))?;
        file.write_all(content.as_bytes())
            .map_err(|err| io_error_to_esp("Écriture fichier SD", err))?;
        file.sync_all()
            .map_err(|err| io_error_to_esp("Sync fichier SD", err))?;

        Ok(())
    }

    pub fn read_text_file(&mut self, file_name: &str) -> Result<String, EspError> {
        let full_path = self.path_for(file_name);

        let mut fatfs = Fatfs::new_sdcard(self.drive, &mut self.sd_driver)?;
        let _mounted_fatfs =
            MountedFatfs::mount(&mut fatfs, &self.mount_point, self.max_open_files)?;

        fs::read_to_string(full_path).map_err(|err| io_error_to_esp("Lecture fichier SD", err))
    }

    fn path_for(&self, file_name: &str) -> String {
        format!(
            "{}/{}",
            self.mount_point.trim_end_matches('/'),
            file_name.trim_start_matches('/')
        )
    }
}

fn io_error_to_esp(context: &str, err: std::io::Error) -> EspError {
    log::error!("{context}: {err}");
    EspError::from_infallible::<ESP_FAIL>()
}
