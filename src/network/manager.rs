use esp_idf_hal::modem::Modem;
use esp_idf_svc::eventloop::EspSystemEventLoop;
use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::mdns::EspMdns;
use esp_idf_svc::nvs::EspDefaultNvsPartition;
use esp_idf_svc::sys::EspError;
use esp_idf_svc::wifi::{BlockingWifi, EspWifi};
use std::sync::{Arc, Mutex};

use crate::hardware::servo::controller_sg_360::ServoController;

use super::{
    handlers, services::dns::DnsService, services::http::HttpServerService,
    services::wifi::WifiService,
};
pub(crate) const WS_MAX_PAYLOAD_LEN: usize = 32;

pub struct NetworkManager<'d> {
    _wifi: BlockingWifi<EspWifi<'d>>,
    _server: EspHttpServer<'static>,
    _mdns: EspMdns,
}

pub(crate) struct MotorControllers {
    moteur_bras: ServoController<'static>,
    moteur_pince: ServoController<'static>,
}

pub(crate) enum MotorTarget {
    Bras,
    Pince,
}

pub(crate) type SharedMotorControllers = Arc<Mutex<MotorControllers>>;

impl MotorControllers {
    pub(crate) fn apply_speed(&mut self, target: MotorTarget, speed: i32) -> Result<(), EspError> {
        let apply = |servo: &mut ServoController<'static>| {
            if speed == 0 {
                servo.stop()
            } else {
                servo.set_speed(speed)
            }
        };

        match target {
            MotorTarget::Bras => apply(&mut self.moteur_bras),
            MotorTarget::Pince => apply(&mut self.moteur_pince),
        }
    }
}

impl<'d> NetworkManager<'d> {
    pub fn start(
        modem: Modem<'d>,
        sys_loop: EspSystemEventLoop,
        nvs: EspDefaultNvsPartition,
        moteur_bras: ServoController<'static>,
        moteur_pince: ServoController<'static>,
    ) -> Result<Self, EspError> {
        let wifi_driver = WifiService::init(modem, sys_loop, nvs)?;
        log::info!(
            "AP prêt. SSID: `{}` | DNS: http://{}.local | IP: http://192.168.71.1",
            WifiService::SSID,
            DnsService::HOSTNAME
        );

        let mdns = DnsService::init()?;
        log::info!(
            "mDNS publié: http://{}.local (fallback IP: http://192.168.71.1)",
            DnsService::HOSTNAME
        );

        let mut server = HttpServerService::init()?;
        let controllers = Self::build_motor_controllers(moteur_bras, moteur_pince);

        Self::register_handlers(&mut server, controllers)?;

        Ok(Self {
            _wifi: wifi_driver,
            _server: server,
            _mdns: mdns,
        })
    }

    fn build_motor_controllers(
        moteur_bras: ServoController<'static>,
        moteur_pince: ServoController<'static>,
    ) -> SharedMotorControllers {
        Arc::new(Mutex::new(MotorControllers {
            moteur_bras,
            moteur_pince,
        }))
    }

    fn register_handlers(
        server: &mut EspHttpServer<'static>,
        controllers: SharedMotorControllers,
    ) -> Result<(), EspError> {
        handlers::register(server, controllers)
    }
}

pub(crate) fn parse_speed_command(payload: &str) -> Option<(MotorTarget, i32)> {
    let payload = payload.trim_matches(|c: char| c.is_ascii_control() || c.is_whitespace());
    let (motor, speed) = payload.split_once(':')?;
    let speed = speed.trim().parse::<i32>().ok()?.clamp(-100, 100);

    let target = match motor.trim().to_ascii_lowercase().as_str() {
        "bras" => MotorTarget::Bras,
        "pince" => MotorTarget::Pince,
        _ => return None,
    };

    Some((target, speed))
}
