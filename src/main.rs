use esp_idf_hal::delay::FreeRtos;
use esp_idf_hal::peripherals::Peripherals;
use esp_idf_svc::eventloop::EspSystemEventLoop;
use esp_idf_svc::nvs::EspDefaultNvsPartition;
use esp_idf_svc::sys::EspError;

mod hardware;
mod network;

use crate::hardware::capteur_fin_course::CapteurFinCourse;
use crate::hardware::manager::HardwareManager;
use crate::hardware::sd_carte::SdCarte;
use crate::hardware::servo::controller_sg_360::ServoController;
use crate::network::NetworkManager;

fn test_hardware<'a>(
    moteurs: &mut [&mut ServoController<'a>],
    capteurs: &[&CapteurFinCourse<'a>],
    capteur_validation_sd_index: usize,
    sd_carte: &mut SdCarte<'a>,
) -> Result<(), EspError> {
    crate::hardware::test_hardware::test_hardware_end_to_end(
        moteurs,
        capteurs,
        capteur_validation_sd_index,
        sd_carte,
    )
}

fn main() -> Result<(), EspError> {
    esp_idf_svc::sys::link_patches();
    esp_idf_svc::log::EspLogger::initialize_default();

    // 1. Récupération des périphériques
    let peripherals = Peripherals::take()?;
    let sys_loop = EspSystemEventLoop::take()?;
    let nvs = EspDefaultNvsPartition::take()?;

    let ledc = peripherals.ledc;
    let spi3 = peripherals.spi3;
    let modem = peripherals.modem;
    let pins = peripherals.pins;

    // 2. Initialisation du manager hardware (bus PWM)
    let hardware = HardwareManager::new(ledc.timer0)?;

    // 3. Création des servos individuels
    let mut moteur_distributeur = hardware.servo_bus().add_servo(ledc.channel0, pins.gpio2)?;
    crate::hardware::test_hardware::test_moteur(&mut moteur_distributeur)?;

    let mut moteur_melange = hardware.servo_bus().add_servo(ledc.channel1, pins.gpio33)?;
    crate::hardware::test_hardware::test_moteur(&mut moteur_melange)?;

    // Capteurs fin de course (GPIO adaptés, pull-up interne)
    let capteur_distributeur = hardware.add_capteur_fin_course(pins.gpio27)?;
    crate::hardware::test_hardware::test_capteur_fin_course(&capteur_distributeur);

    // 3.bis) Initialisation SD + capteurs via HardwareManager
    // SD (doc): CS=5, SCK=18, MOSI=23, MISO=19
    let mut sd_carte =
        hardware.add_sd_carte_default(spi3, pins.gpio5, pins.gpio18, pins.gpio23, pins.gpio19)?;
    crate::hardware::test_hardware::test_sd_carte(&mut sd_carte)?;

    // Test hardware: passage uniquement par références (aucune consommation des objets)
    {
        // 1 seul capteur de fin de course pour le moteur distributeur
        let mut moteurs = [&mut moteur_distributeur];
        let capteurs = [&capteur_distributeur];
        test_hardware(&mut moteurs, &capteurs, 0, &mut sd_carte)?;
    }

    // 4. Point d'accès Wi-Fi + serveur web (HTTP + WebSocket)
    let _network_manager =
        NetworkManager::start(modem, sys_loop, nvs, moteur_distributeur, moteur_melange)?;

    log::info!("Interface WebSocket prête pour le pilotage des servos.");

    loop {
        FreeRtos::delay_ms(1000);
    }
}
