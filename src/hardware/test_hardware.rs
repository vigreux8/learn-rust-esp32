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
    sd_carte.write_text_file(TEST_FILE_NAME, TEST_FILE_WRITE_CONTENT)?;

    log::info!("Fichier écrit. Étape 3: Retirez la carte");

    loop {
        FreeRtos::delay_ms(1000);

        match sd_carte.read_text_file(TEST_FILE_NAME) {
            Ok(contenu) => {
                let contenu = contenu.trim();
                log::info!("Contenu lu: {contenu}");

                if contenu != TEST_FILE_EXPECTED_CONTENT {
                    log::warn!(
                        "Contenu inattendu: '{contenu}' (attendu: '{TEST_FILE_EXPECTED_CONTENT}')"
                    );
                }

                break;
            }
            Err(err) => {
                log::info!("Carte SD non détectée ou lecture impossible... en attente ({err})");
            }
        }
    }

    Ok(())
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
    test_sd_carte(sd_carte)
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
