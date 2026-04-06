use esp_idf_hal::delay::FreeRtos;
use esp_idf_hal::modem::Modem;
use esp_idf_svc::eventloop::EspSystemEventLoop;
use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::mdns::EspMdns;
use esp_idf_svc::nvs::EspDefaultNvsPartition;
use esp_idf_svc::sys::{EspError, ESP_FAIL};
use esp_idf_svc::wifi::{BlockingWifi, EspWifi};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use crate::hardware::servo::controller_sg_360::ServoController;

use super::{
    handlers, services::dns::DnsService, services::http::HttpServerService,
    services::wifi::WifiService,
};
pub(crate) const WS_MAX_PAYLOAD_LEN: usize = 128;
pub const DEFAULT_APPLY_SPEED_DURATION_MS: u32 = 1_000;

pub struct NetworkManager<'d> {
    _wifi: BlockingWifi<EspWifi<'d>>,
    _server: EspHttpServer<'static>,
    _mdns: EspMdns,
}

pub(crate) struct MotorControllers {
    moteur_bras: ServoController<'static>,
    moteur_pince: ServoController<'static>,
    bras_deadline: Option<Instant>,
    pince_deadline: Option<Instant>,
}

#[derive(Copy, Clone)]
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

    fn extend_deadline(&mut self, target: MotorTarget, duration_ms: u32) {
        let now = Instant::now();
        let extra = Duration::from_millis(duration_ms as u64);
        let slot = match target {
            MotorTarget::Bras => &mut self.bras_deadline,
            MotorTarget::Pince => &mut self.pince_deadline,
        };

        *slot = Some(match *slot {
            Some(deadline) if deadline > now => deadline + extra,
            _ => now + extra,
        });
    }

    fn remaining_duration_ms(&self, target: MotorTarget) -> Option<u32> {
        let deadline = match target {
            MotorTarget::Bras => self.bras_deadline,
            MotorTarget::Pince => self.pince_deadline,
        }?;

        let now = Instant::now();
        if now >= deadline {
            return Some(0);
        }

        let remaining = (deadline - now).as_millis();
        let bounded = remaining.min(u32::MAX as u128);
        Some(bounded as u32)
    }

    fn clear_deadline(&mut self, target: MotorTarget) {
        match target {
            MotorTarget::Bras => self.bras_deadline = None,
            MotorTarget::Pince => self.pince_deadline = None,
        }
    }

    pub(crate) fn apply_speed_with_duration(
        &mut self,
        target: MotorTarget,
        speed: i32,
        duration_ms: Option<u32>,
    ) -> Result<(), EspError> {
        let duration_ms = duration_ms.unwrap_or(DEFAULT_APPLY_SPEED_DURATION_MS);
        self.extend_deadline(target, duration_ms);
        self.apply_speed(target, speed)
    }

    pub(crate) fn clear_duration_for_target(&mut self, target: MotorTarget) {
        self.clear_deadline(target);
    }

    fn stop_if_deadline_reached(&mut self, target: MotorTarget) -> Result<(), EspError> {
        if matches!(self.remaining_duration_ms(target), Some(0)) {
            self.clear_deadline(target);
            self.apply_speed(target, 0)?;
        }

        Ok(())
    }

    fn stop_expired_motors(&mut self) -> Result<(), EspError> {
        self.stop_if_deadline_reached(MotorTarget::Bras)?;
        self.stop_if_deadline_reached(MotorTarget::Pince)
    }
}

#[allow(dead_code)]
pub async fn apply_speed_with_duration(
    controllers: &SharedMotorControllers,
    target: MotorTarget,
    speed: i32,
    duration_ms: Option<u32>,
) -> Result<(), EspError> {
    apply_speed_with_duration_sync(controllers, target, speed, duration_ms)
}

pub fn apply_speed_with_duration_sync(
    controllers: &SharedMotorControllers,
    target: MotorTarget,
    speed: i32,
    duration_ms: Option<u32>,
) -> Result<(), EspError> {
    let mut motors = controllers
        .lock()
        .map_err(|_| EspError::from_infallible::<ESP_FAIL>())?;
    motors.apply_speed_with_duration(target, speed, duration_ms)
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
        Self::start_motor_scheduler(controllers.clone())?;

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
            bras_deadline: None,
            pince_deadline: None,
        }))
    }

    fn register_handlers(
        server: &mut EspHttpServer<'static>,
        controllers: SharedMotorControllers,
    ) -> Result<(), EspError> {
        handlers::register(server, controllers)
    }

    fn start_motor_scheduler(controllers: SharedMotorControllers) -> Result<(), EspError> {
        std::thread::Builder::new()
            .name("servo-scheduler".to_owned())
            .stack_size(4096)
            .spawn(move || loop {
                let result = {
                    let mut motors = match controllers.lock() {
                        Ok(motors) => motors,
                        Err(_) => {
                            log::error!("Mutex moteurs empoisonne, arret du scheduler servo");
                            break;
                        }
                    };
                    motors.stop_expired_motors()
                };

                if let Err(err) = result {
                    log::error!("Erreur scheduler servo: {:?}", err);
                }

                FreeRtos::delay_ms(20);
            })
            .map_err(|_| EspError::from_infallible::<ESP_FAIL>())?;

        Ok(())
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
