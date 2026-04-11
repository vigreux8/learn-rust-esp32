use esp_idf_hal::delay::FreeRtos;
use esp_idf_svc::sys::{EspError, ESP_FAIL};

use crate::hardware::capteur_fin_course::CapteurFinCourse;
use crate::hardware::sd_carte::SdCarte;
use crate::hardware::servo::controller_sg_360::ServoController;

const TEST_FILE_NAME: &str = "test.txt";
const TEST_FILE_WRITE_CONTENT: &str = "hello-world";
const TEST_FILE_EXPECTED_CONTENT: &str = "coucou";
const CAPTEUR_TIMEOUT_MS: u32 = 3_000;
const CAPTEUR_POLL_MS: u32 = 20;
const SD_READ_TIMEOUT_MS: u32 = 15_000;
const SD_READ_POLL_MS: u32 = 1_000;

pub fn test_moteur(moteur: &mut ServoController<'_>) -> Result<(), EspError> {
    moteur.set_speed(100)?;
    FreeRtos::delay_ms(1_000);
    moteur.stop()
}

pub fn test_capteur_fin_course(capteur: &CapteurFinCourse<'_>) -> bool {
    let mut elapsed_ms = 0;

    while capteur.is_repos() && elapsed_ms < CAPTEUR_TIMEOUT_MS {
        FreeRtos::delay_ms(CAPTEUR_POLL_MS);
        elapsed_ms += CAPTEUR_POLL_MS;
    }

    if capteur.is_repos() {
        log::error!("Capteur fin de course non actionné en 3 secondes: test sauté");
        return false;
    }

    // anti-rebond + attente relâchement
    FreeRtos::delay_ms(30);
    while capteur.is_enclenche() {
        FreeRtos::delay_ms(CAPTEUR_POLL_MS);
    }

    log::info!("Capteur fin de course: appuyé");
    true
}

pub fn test_sd_carte(sd_carte: &mut SdCarte<'_>) -> Result<(), EspError> {
    log::info!("Test SD: écriture de '{TEST_FILE_NAME}'");
    sd_carte.write_text_file(TEST_FILE_NAME, TEST_FILE_WRITE_CONTENT)?;

    log::info!("Test SD: fichier écrit. Retirez la carte, modifiez en 'coucou', puis réinsérez-la");

    let mut elapsed_ms = 0;
    loop {
        FreeRtos::delay_ms(SD_READ_POLL_MS);
        elapsed_ms += SD_READ_POLL_MS;

        match sd_carte.read_text_file(TEST_FILE_NAME) {
            Ok(contenu) => {
                let contenu = contenu.trim();
                log::info!("Test SD: contenu lu: {contenu}");

                if contenu != TEST_FILE_EXPECTED_CONTENT {
                    log::warn!(
                        "Contenu inattendu: '{contenu}' (attendu: '{TEST_FILE_EXPECTED_CONTENT}')"
                    );
                }

                return Ok(());
            }
            Err(err) => {
                log::warn!("Test SD: lecture impossible... ({err})");
            }
        }

        if elapsed_ms >= SD_READ_TIMEOUT_MS {
            log::error!(
                "Test SD: timeout après {} ms (test SD sauté, application continue)",
                SD_READ_TIMEOUT_MS
            );
            return Err(EspError::from_infallible::<ESP_FAIL>());
        } else {
            log::info!(
                "Test SD: nouvelle tentative dans {} ms (elapsed={} ms)",
                SD_READ_POLL_MS,
                elapsed_ms
            );
        }
    }
}

pub fn test_hardware_end_to_end<'a>(
    moteurs: &mut [&mut ServoController<'a>],
    capteurs: &[&CapteurFinCourse<'a>],
    capteur_validation_sd_index: usize,
    sd_carte: &mut SdCarte<'a>,
) -> Result<(), EspError> {
    validate_inputs(moteurs, capteurs, capteur_validation_sd_index)?;

    log::info!("Étape 1: Test individuel des moteurs");
    for (index, moteur) in moteurs.iter_mut().enumerate() {
        log::info!("Test moteur({index}) pendant 1 seconde");
        test_moteur(*moteur)?;
    }

    log::info!("Étape 2: Test individuel des capteurs fin de course");
    for (index, capteur) in capteurs.iter().enumerate() {
        log::info!("Attente appui capteur({index})");
        let _ = test_capteur_fin_course(capteur);
    }

    log::info!("Étape 3: Test carte SD");
    let _ = test_capteur_fin_course(capteurs[capteur_validation_sd_index]);
    if let Err(err) = test_sd_carte(sd_carte) {
        log::error!("Étape SD échouée: {err}. Le test global continue sans arrêter l'application");
    }

    Ok(())
}

fn validate_inputs(
    moteurs: &[&mut ServoController<'_>],
    capteurs: &[&CapteurFinCourse<'_>],
    capteur_validation_sd_index: usize,
) -> Result<(), EspError> {
    if moteurs.is_empty() {
        log::error!("Aucun moteur fourni à test_hardware");
        return Err(EspError::from_infallible::<ESP_FAIL>());
    }

    if capteurs.is_empty() {
        log::error!("Aucun capteur fourni à test_hardware");
        return Err(EspError::from_infallible::<ESP_FAIL>());
    }

    if capteur_validation_sd_index >= capteurs.len() {
        log::error!(
            "Index capteur de validation SD invalide: {} (capteurs={})",
            capteur_validation_sd_index,
            capteurs.len()
        );
        return Err(EspError::from_infallible::<ESP_FAIL>());
    }

    Ok(())
}
