use esp_idf_svc::hal::delay::FreeRtos;
use esp_idf_svc::hal::peripherals::Peripherals;
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

    // 2. Point d'accès Wi-Fi + serveur web embarqué
    let _wifi_server = WifiServer::start(peripherals.modem)?;

    // 3. Initialisation du Bus unique (Timer 0)
    let bus = ServoBus::new(peripherals.ledc.timer0)?;

    // 4. Création des servos individuels
    // On donne simplement le channel et la pin GPIO
    let mut servo_bras = bus.add_servo(peripherals.ledc.channel0, peripherals.pins.gpio2)?;
    let mut servo_pince = bus.add_servo(peripherals.ledc.channel1, peripherals.pins.gpio33)?;

    log::info!("Servos prêts !");

    loop {
        // On bouge le bras à 0° et la pince à 180°
        servo_bras.set_speed(10)?;
        servo_pince.set_speed(-10)?;
        FreeRtos::delay_ms(1000);

        // On bouge le bras à 0° et la pince à 180°
        servo_bras.set_speed(-10)?;
        servo_pince.set_speed(10)?;
        FreeRtos::delay_ms(1000);
    }
}
