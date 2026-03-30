use esp_idf_hal::delay::FreeRtos;
use esp_idf_hal::peripherals::Peripherals;
use esp_idf_svc::eventloop::EspSystemEventLoop;
use esp_idf_svc::nvs::EspDefaultNvsPartition;
use esp_idf_svc::sys::EspError;

mod hardware;
mod network;

use crate::hardware::manager::HardwareManager;
use crate::network::NetworkManager;

fn main() -> Result<(), EspError> {
    /* test */
    esp_idf_svc::sys::link_patches();
    esp_idf_svc::log::EspLogger::initialize_default();

    // 1. Récupération des périphériques
    let peripherals = Peripherals::take()?;
    let sys_loop = EspSystemEventLoop::take()?;
    let nvs = EspDefaultNvsPartition::take()?;

    // 2. Initialisation du manager hardware (bus PWM)
    let hardware = HardwareManager::new(peripherals.ledc.timer0)?;

    // 3. Création des servos individuels
    let moteur_bras = hardware
        .servo_bus()
        .add_servo(peripherals.ledc.channel0, peripherals.pins.gpio2)?;
    let moteur_pince = hardware
        .servo_bus()
        .add_servo(peripherals.ledc.channel1, peripherals.pins.gpio33)?;

    // 4. Point d'accès Wi-Fi + serveur web (HTTP + WebSocket)
    let _network_manager =
        NetworkManager::start(peripherals.modem, sys_loop, nvs, moteur_bras, moteur_pince)?;

    log::info!("Interface WebSocket prête pour le pilotage des servos.");

    loop {
        FreeRtos::delay_ms(1000);
    }
}
