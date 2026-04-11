use esp_idf_hal::delay::FreeRtos;
use esp_idf_hal::modem::Modem;
use esp_idf_svc::eventloop::{EspSubscription, EspSystemEventLoop, System};
use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::mdns::EspMdns;
use esp_idf_svc::netif::IpEvent;
use esp_idf_svc::nvs::EspDefaultNvsPartition;
use esp_idf_svc::sys::{EspError, ESP_FAIL};
use esp_idf_svc::wifi::{BlockingWifi, EspWifi, WifiEvent};
use std::collections::HashMap;
use std::net::Ipv4Addr;
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
    _wifi_event_subscription: EspSubscription<'static, System>,
    _ip_event_subscription: EspSubscription<'static, System>,
    _sessions: SharedClientSessions,
}

pub(crate) struct MotorControllers {
    moteur_distributeur: ServoController<'static>,
    moteur_melange: ServoController<'static>,
    distributeur_deadline: Option<Instant>,
    melange_deadline: Option<Instant>,
}

#[derive(Copy, Clone)]
pub(crate) enum MotorTarget {
    Distributeur,
    Melange,
}

pub(crate) type SharedMotorControllers = Arc<Mutex<MotorControllers>>;
pub(crate) type MacAddress = [u8; 6];

#[derive(Copy, Clone)]
pub(crate) struct ClientSession {
    pub mac: MacAddress,
    pub slot: Option<usize>,
}

pub(crate) struct ClientSessions {
    active_macs: Vec<MacAddress>,
    ip_to_mac: HashMap<Ipv4Addr, MacAddress>,
}

pub(crate) type SharedClientSessions = Arc<Mutex<ClientSessions>>;

pub(crate) fn format_mac(mac: &MacAddress) -> String {
    format!(
        "{:02X}:{:02X}:{:02X}:{:02X}:{:02X}:{:02X}",
        mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]
    )
}

impl ClientSessions {
    fn new() -> Self {
        Self {
            active_macs: Vec::new(),
            ip_to_mac: HashMap::new(),
        }
    }

    fn add_active_mac(&mut self, mac: MacAddress) -> usize {
        if let Some(index) = self
            .active_macs
            .iter()
            .position(|existing| *existing == mac)
        {
            return index + 1;
        }

        self.active_macs.push(mac);
        self.active_macs.len()
    }

    fn remove_active_mac(&mut self, mac: MacAddress) {
        self.active_macs.retain(|existing| *existing != mac);
        self.ip_to_mac.retain(|_, value| *value != mac);
    }

    fn bind_ip_to_mac(&mut self, ip: Ipv4Addr, mac: MacAddress) -> Option<usize> {
        self.ip_to_mac.insert(ip, mac);
        self.active_macs
            .iter()
            .position(|existing| *existing == mac)
            .map(|index| index + 1)
    }

    fn active_macs_log_line(&self) -> String {
        if self.active_macs.is_empty() {
            return "aucune".to_string();
        }

        self.active_macs
            .iter()
            .map(format_mac)
            .collect::<Vec<String>>()
            .join(", ")
    }

    pub(crate) fn find_session_by_ip(&self, ip: Ipv4Addr) -> Option<ClientSession> {
        let mac = *self.ip_to_mac.get(&ip)?;
        let slot = self
            .active_macs
            .iter()
            .position(|existing| *existing == mac)
            .map(|index| index + 1);

        Some(ClientSession { mac, slot })
    }
}

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
            MotorTarget::Distributeur => apply(&mut self.moteur_distributeur),
            MotorTarget::Melange => apply(&mut self.moteur_melange),
        }
    }

    fn extend_deadline(&mut self, target: MotorTarget, duration_ms: u32) {
        let now = Instant::now();
        let extra = Duration::from_millis(duration_ms as u64);
        let slot = match target {
            MotorTarget::Distributeur => &mut self.distributeur_deadline,
            MotorTarget::Melange => &mut self.melange_deadline,
        };

        *slot = Some(match *slot {
            Some(deadline) if deadline > now => deadline + extra,
            _ => now + extra,
        });
    }

    fn remaining_duration_ms(&self, target: MotorTarget) -> Option<u32> {
        let deadline = match target {
            MotorTarget::Distributeur => self.distributeur_deadline,
            MotorTarget::Melange => self.melange_deadline,
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
            MotorTarget::Distributeur => self.distributeur_deadline = None,
            MotorTarget::Melange => self.melange_deadline = None,
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
        self.stop_if_deadline_reached(MotorTarget::Distributeur)?;
        self.stop_if_deadline_reached(MotorTarget::Melange)
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
        moteur_distributeur: ServoController<'static>,
        moteur_melange: ServoController<'static>,
    ) -> Result<Self, EspError> {
        let sessions = Self::build_client_sessions();
        let wifi_event_subscription =
            Self::subscribe_wifi_events(&sys_loop, Arc::clone(&sessions))?;
        let ip_event_subscription = Self::subscribe_ip_events(&sys_loop, Arc::clone(&sessions))?;

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
        let controllers = Self::build_motor_controllers(moteur_distributeur, moteur_melange);
        Self::start_motor_scheduler(controllers.clone())?;

        Self::register_handlers(&mut server, controllers, Arc::clone(&sessions))?;

        Ok(Self {
            _wifi: wifi_driver,
            _server: server,
            _mdns: mdns,
            _wifi_event_subscription: wifi_event_subscription,
            _ip_event_subscription: ip_event_subscription,
            _sessions: sessions,
        })
    }

    fn build_motor_controllers(
        moteur_distributeur: ServoController<'static>,
        moteur_melange: ServoController<'static>,
    ) -> SharedMotorControllers {
        Arc::new(Mutex::new(MotorControllers {
            moteur_distributeur,
            moteur_melange,
            distributeur_deadline: None,
            melange_deadline: None,
        }))
    }

    fn register_handlers(
        server: &mut EspHttpServer<'static>,
        controllers: SharedMotorControllers,
        sessions: SharedClientSessions,
    ) -> Result<(), EspError> {
        handlers::register(server, controllers, sessions)
    }

    fn build_client_sessions() -> SharedClientSessions {
        Arc::new(Mutex::new(ClientSessions::new()))
    }

    fn subscribe_wifi_events(
        sys_loop: &EspSystemEventLoop,
        sessions: SharedClientSessions,
    ) -> Result<EspSubscription<'static, System>, EspError> {
        sys_loop.subscribe::<WifiEvent, _>(move |event| match event {
            WifiEvent::ApStaConnected(sta) => {
                let mac = sta.mac();
                let (session_slot, active_macs) = match sessions.lock() {
                    Ok(mut store) => {
                        let slot = store.add_active_mac(mac);
                        let list = store.active_macs_log_line();
                        (slot, list)
                    }
                    Err(_) => {
                        log::error!("Store sessions empoisonne (connect)");
                        return;
                    }
                };

                log::info!(
                    "WIFI_EVENT_AP_STACONNECTED: mac={} session={}",
                    format_mac(&mac),
                    session_slot
                );
                log::info!("Sessions MAC actives: {}", active_macs);

                if session_slot > 3 {
                    log::warn!(
                        "Plus de 3 sessions connectees simultanement (session={})",
                        session_slot
                    );
                }
            }
            WifiEvent::ApStaDisconnected(sta) => {
                let mac = sta.mac();
                let active_macs = match sessions.lock() {
                    Ok(mut store) => {
                        store.remove_active_mac(mac);
                        store.active_macs_log_line()
                    }
                    Err(_) => {
                        log::error!("Store sessions empoisonne (disconnect)");
                        return;
                    }
                };

                log::info!("WIFI_EVENT_AP_STADISCONNECTED: mac={}", format_mac(&mac));
                log::info!("Sessions MAC actives: {}", active_macs);
            }
            _ => {}
        })
    }

    fn subscribe_ip_events(
        sys_loop: &EspSystemEventLoop,
        sessions: SharedClientSessions,
    ) -> Result<EspSubscription<'static, System>, EspError> {
        sys_loop.subscribe::<IpEvent, _>(move |event| {
            if let IpEvent::ApStaIpAssigned(assignment) = event {
                let ip = assignment.ip();
                let mac = assignment.mac();
                let slot = match sessions.lock() {
                    Ok(mut store) => store.bind_ip_to_mac(ip, mac),
                    Err(_) => {
                        log::error!("Store sessions empoisonne (ip-assign)");
                        return;
                    }
                };

                log::info!(
                    "IP_EVENT_AP_STAIPASSIGNED: ip={} mac={} session={}",
                    ip,
                    format_mac(&mac),
                    slot.map(|value| value.to_string())
                        .unwrap_or_else(|| "inconnue".to_string())
                );
            }
        })
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
        "distributeur" | "bras" => MotorTarget::Distributeur,
        "melange" | "pince" => MotorTarget::Melange,
        _ => return None,
    };

    Some((target, speed))
}
