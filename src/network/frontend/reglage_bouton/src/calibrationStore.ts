export type CalibrationJson = {
  vitesse_moteur: number
  temp_360: number
  vitesse_min: number
  vitesse_max: number
}

export class CalibrationStore {
  static readonly storageKey = 'servo_calibration_frontend_v1'

  static readonly defaults: CalibrationJson = {
    vitesse_moteur: 13,
    temp_360: 2180,
    vitesse_min: 8,
    vitesse_max: 70,
  }

  static normalize(value: unknown): CalibrationJson | null {
    if (!value || typeof value !== 'object') {
      return null
    }

    const record = value as Record<string, unknown>
    const vitesse = Number(record.vitesse_moteur)
    const temp360 = Number(record.temp_360)
    const rawMin = Number(record.vitesse_min ?? CalibrationStore.defaults.vitesse_min)
    const rawMax = Number(record.vitesse_max ?? CalibrationStore.defaults.vitesse_max)

    if (
      !Number.isFinite(vitesse) ||
      !Number.isFinite(temp360) ||
      !Number.isFinite(rawMin) ||
      !Number.isFinite(rawMax)
    ) {
      return null
    }

    const vitesseInt = Math.trunc(vitesse)
    let tempInt = Math.max(1, Math.trunc(temp360))
    let minInt = Math.max(0, Math.min(99, Math.trunc(rawMin)))
    let maxInt = Math.max(1, Math.min(100, Math.trunc(rawMax)))

    if (vitesseInt < -100 || vitesseInt > 100) {
      return null
    }

    if (maxInt <= minInt) {
      if (minInt >= 99) {
        minInt = 98
        maxInt = 99
      } else {
        maxInt = minInt + 1
      }
    }

    // Compat retroactive: anciennes valeurs en secondes (ex: 2, 3, 4).
    if (tempInt <= 30) {
      tempInt *= 1000
    }

    return {
      vitesse_moteur: vitesseInt,
      temp_360: tempInt,
      vitesse_min: minInt,
      vitesse_max: maxInt,
    }
  }

  static load(): CalibrationJson {
    try {
      const raw = localStorage.getItem(CalibrationStore.storageKey)
      if (!raw) {
        return CalibrationStore.defaults
      }
      const parsed = JSON.parse(raw) as unknown
      return CalibrationStore.normalize(parsed) ?? CalibrationStore.defaults
    } catch {
      return CalibrationStore.defaults
    }
  }

  static save(calibration: CalibrationJson): void {
    localStorage.setItem(CalibrationStore.storageKey, JSON.stringify(calibration))
  }

  static parseText(text: string): CalibrationJson | null {
    try {
      const parsed = JSON.parse(text) as unknown
      return CalibrationStore.normalize(parsed)
    } catch {
      return null
    }
  }

  static toText(calibration: CalibrationJson): string {
    return JSON.stringify(calibration, null, 2)
  }

  static theoreticalDurationMs(
    calibration: CalibrationJson,
    targetSpeed: number,
    turns = 1,
  ): number | null {
    const absTarget = Math.abs(Math.trunc(targetSpeed))
    const absRef = Math.abs(Math.trunc(calibration.vitesse_moteur))
    const turnsInt = Math.max(1, Math.trunc(turns))

    const effTarget = CalibrationStore.effectiveSpeedLevel(
      absTarget,
      calibration.vitesse_min,
      calibration.vitesse_max,
    )
    const effRef = CalibrationStore.effectiveSpeedLevel(
      absRef,
      calibration.vitesse_min,
      calibration.vitesse_max,
    )

    if (effTarget === null || effRef === null) {
      return null
    }

    const oneTurnMs = (calibration.temp_360 * effRef) / effTarget
    return Math.max(1, Math.round(oneTurnMs * turnsInt))
  }

  private static effectiveSpeedLevel(
    speedAbs: number,
    minSpeed: number,
    maxSpeed: number,
  ): number | null {
    if (speedAbs < minSpeed) {
      return null
    }

    const clamped = Math.min(Math.max(speedAbs, minSpeed), maxSpeed)
    // Niveau 1 a la vitesse min pour eviter la division par zero.
    return clamped - minSpeed + 1
  }
}
