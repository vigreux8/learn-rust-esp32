use esp_idf_svc::hal::delay::FreeRtos;
use esp_idf_svc::hal::ledc::config::{Resolution, TimerConfig};
use esp_idf_svc::hal::ledc::{LedcDriver, LedcTimerDriver};
use esp_idf_svc::hal::peripherals::Peripherals;
use esp_idf_svc::hal::prelude::*;
use esp_idf_svc::sys::EspError;

fn interpolate(angle: u32, min: u32, max: u32) -> u32 {
    let clamped = angle.min(180);
    clamped * (max - min) / 180 + min
}

pub fn run_servo_test() -> Result<(), EspError> {
    let peripherals = Peripherals::take()?;

    let timer = LedcTimerDriver::new(
        peripherals.ledc.timer1,
        &TimerConfig::new()
            .frequency(50.Hz().into())
            .resolution(Resolution::Bits14),
    )?;

    // Test on another pin than GPIO33 (same pattern as the working code you sent)
    let pin_servo = peripherals.pins.gpio2;
    let mut pwm = LedcDriver::new(peripherals.ledc.channel3, &timer, pin_servo)?;
    let max_duty = pwm.get_max_duty();
    let min = max_duty / 40;
    let max = max_duty / 8;

    log::info!("Test servo: 0 -> 90 -> 180 (500 ms), pin GPIO2");
    pwm.set_duty(interpolate(90, min, max))?;
    FreeRtos::delay_ms(1000);

    loop {
        pwm.set_duty(interpolate(0, min, max))?;
        FreeRtos::delay_ms(1000);

        pwm.set_duty(interpolate(5, min, max))?;
        FreeRtos::delay_ms(1000);

        pwm.set_duty(interpolate(10, min, max))?;
        FreeRtos::delay_ms(1000);
    }
}
