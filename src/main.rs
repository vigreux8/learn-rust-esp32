use esp_idf_svc::eventloop::EspSystemEventLoop;
use esp_idf_svc::hal::delay::FreeRtos;
use esp_idf_svc::hal::peripherals::Peripherals;
use esp_idf_svc::nvs::EspDefaultNvsPartition;
use esp_idf_svc::sys::EspError;

// 1. DIS À RUST QUE LE DOSSIER  EXISTE
mod servo;
mod wifi;

// 2. IMPORTE TES STRUCTURES DEPUIS CE MODULE
use crate::servo::ServoBus;
use crate::wifi::WifiServer;

fn main() -> Result<(), EspError> {
    esp_idf_svc::sys::link_patches();
    esp_idf_svc::log::EspLogger::initialize_default();

    // 1. Récupération des périphériques
    let peripherals = Peripherals::take()?;
    let sys_loop = EspSystemEventLoop::take()?;
    let nvs = EspDefaultNvsPartition::take()?;

    // 2. Initialisation du Bus unique (Timer 0)
    let bus = ServoBus::new(peripherals.ledc.timer0)?;

    // 3. Création des servos individuels
    // On donne simplement le channel et la pin GPIO
    let moteur_bras = bus.add_servo(peripherals.ledc.channel0, peripherals.pins.gpio2)?;
    let moteur_pince = bus.add_servo(peripherals.ledc.channel1, peripherals.pins.gpio33)?;

    // 4. Point d'accès Wi-Fi + serveur web (HTTP + WebSocket)
    let _wifi_server =
        WifiServer::start(peripherals.modem, sys_loop, nvs, moteur_bras, moteur_pince)?;

    log::info!("Interface WebSocket prête pour le pilotage des servos.");

    loop {
        FreeRtos::delay_ms(1000);
    }
}
