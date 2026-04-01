import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

import { CalibrationStore, type CalibrationJson } from './calibrationStore'

type MotorTarget = 'bras' | 'pince'
type Menu = 'calibration' | 'api'

function clampSpeedWithinBounds(speed: number, minSpeed: number, maxSpeed: number): number {
  if (speed === 0) {
    return minSpeed
  }

  const sign = speed < 0 ? -1 : 1
  const absSpeed = Math.abs(Math.trunc(speed))
  const clamped = Math.min(Math.max(absSpeed, minSpeed), maxSpeed)
  return sign * clamped
}

export function App() {
  const [status, setStatus] = useState<string>('pret')
  const [activeMenu, setActiveMenu] = useState<Menu>('calibration')

  const [targetCalibration, setTargetCalibration] = useState<MotorTarget>('bras')
  const [speedCalibration, setSpeedCalibration] = useState<number>(60)
  const [minSpeedCalibration, setMinSpeedCalibration] = useState<number>(
    CalibrationStore.defaults.vitesse_min,
  )
  const [maxSpeedCalibration, setMaxSpeedCalibration] = useState<number>(
    CalibrationStore.defaults.vitesse_max,
  )
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false)
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState<number>(0)

  const [savedCalibration, setSavedCalibration] = useState<CalibrationJson>(
    CalibrationStore.defaults,
  )
  const [jsonInput, setJsonInput] = useState<string>(
    CalibrationStore.toText(CalibrationStore.defaults),
  )
  const [apiSpeed, setApiSpeed] = useState<number>(60)

  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    const loaded = CalibrationStore.load()
    const baseSpeed = loaded.vitesse_moteur === 0 ? loaded.vitesse_min : loaded.vitesse_moteur

    setSavedCalibration(loaded)
    setJsonInput(CalibrationStore.toText(loaded))
    setMinSpeedCalibration(loaded.vitesse_min)
    setMaxSpeedCalibration(loaded.vitesse_max)
    setSpeedCalibration(
      clampSpeedWithinBounds(baseSpeed, loaded.vitesse_min, loaded.vitesse_max),
    )
    setApiSpeed(clampSpeedWithinBounds(baseSpeed, loaded.vitesse_min, loaded.vitesse_max))
  }, [])

  useEffect(() => {
    if (isCalibrating) {
      return
    }
    setSpeedCalibration((prev) => {
      const seed = prev === 0 ? minSpeedCalibration : prev
      return clampSpeedWithinBounds(seed, minSpeedCalibration, maxSpeedCalibration)
    })
  }, [minSpeedCalibration, maxSpeedCalibration, isCalibrating])

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [])

  const theoreticalDurationMs = useMemo(
    () => CalibrationStore.theoreticalDurationMs(savedCalibration, apiSpeed, 1),
    [savedCalibration, apiSpeed],
  )

  const theoreticalDurationText = useMemo(() => {
    if (!theoreticalDurationMs) {
      return `indefini (|vitesse| doit etre >= ${savedCalibration.vitesse_min})`
    }
    return `${theoreticalDurationMs}ms`
  }, [theoreticalDurationMs, savedCalibration.vitesse_min])

  async function envoyerCommandeServo(payload: string): Promise<boolean> {
    try {
      const response = await fetch('/api/servo', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: payload,
      })
      const text = await response.text()
      if (!response.ok) {
        setStatus(`erreur servo ${response.status}: ${text}`)
        return false
      }
      setStatus(`servo ok: ${payload}`)
      return true
    } catch (error) {
      setStatus(`erreur reseau servo: ${String(error)}`)
      return false
    }
  }

  function saveCalibration(calibration: CalibrationJson): void {
    const baseSpeed =
      calibration.vitesse_moteur === 0 ? calibration.vitesse_min : calibration.vitesse_moteur

    setSavedCalibration(calibration)
    setJsonInput(CalibrationStore.toText(calibration))
    setMinSpeedCalibration(calibration.vitesse_min)
    setMaxSpeedCalibration(calibration.vitesse_max)
    setSpeedCalibration(
      clampSpeedWithinBounds(baseSpeed, calibration.vitesse_min, calibration.vitesse_max),
    )
    setApiSpeed((prev) => {
      const seed = prev === 0 ? baseSpeed : prev
      return clampSpeedWithinBounds(seed, calibration.vitesse_min, calibration.vitesse_max)
    })

    CalibrationStore.save(calibration)
  }

  async function startCalibration(): Promise<void> {
    if (isCalibrating) {
      return
    }

    const absSpeed = Math.abs(speedCalibration)
    if (absSpeed < minSpeedCalibration) {
      setStatus(
        `vitesse trop faible: |vitesse| doit etre >= ${minSpeedCalibration} pour sortir de la zone morte`,
      )
      return
    }
    if (absSpeed > maxSpeedCalibration) {
      setStatus(`vitesse trop elevee: |vitesse| doit etre <= ${maxSpeedCalibration}`)
      return
    }

    const ok = await envoyerCommandeServo(`${targetCalibration}:${speedCalibration}`)
    if (!ok) {
      return
    }

    const start = Date.now()
    setStartTimestamp(start)
    setElapsedMs(0)
    setIsCalibrating(true)

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
    }
    intervalRef.current = window.setInterval(() => {
      setElapsedMs(Date.now() - start)
    }, 50)

    setStatus(
      `calibration en cours sur ${targetCalibration} a vitesse ${speedCalibration} (min=${minSpeedCalibration}, max=${maxSpeedCalibration})`,
    )
  }

  async function stopCalibration(): Promise<void> {
    if (!isCalibrating || startTimestamp === null) {
      return
    }

    const totalMs = Date.now() - startTimestamp
    setElapsedMs(totalMs)
    setIsCalibrating(false)
    setStartTimestamp(null)

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    await envoyerCommandeServo(`${targetCalibration}:0`)

    const calibration: CalibrationJson = {
      vitesse_moteur: Math.trunc(speedCalibration),
      temp_360: Math.max(1, totalMs),
      vitesse_min: minSpeedCalibration,
      vitesse_max: maxSpeedCalibration,
    }
    saveCalibration(calibration)
    setStatus(
      `calibration sauvegardee: vitesse=${calibration.vitesse_moteur}, temp_360=${calibration.temp_360}ms, min=${calibration.vitesse_min}, max=${calibration.vitesse_max}`,
    )
  }

  async function sendCalibrationJson(): Promise<void> {
    const calibration = CalibrationStore.parseText(jsonInput)
    if (!calibration) {
      setStatus(
        'json invalide: attendu { "vitesse_moteur": int, "temp_360": int_ms, "vitesse_min": int, "vitesse_max": int }',
      )
      return
    }

    try {
      const response = await fetch('/api/calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(calibration),
      })
      const text = await response.text()
      if (!response.ok) {
        setStatus(`erreur calibration ${response.status}: ${text}`)
        return
      }

      saveCalibration(calibration)
      setStatus(`json envoye: ${text}`)
    } catch (error) {
      setStatus(`erreur reseau calibration: ${String(error)}`)
    }
  }

  async function sendOneTurn(target: MotorTarget): Promise<void> {
    const durationMs = CalibrationStore.theoreticalDurationMs(savedCalibration, apiSpeed, 1)
    if (!durationMs) {
      setStatus(
        `impossible de calculer: |vitesse| doit etre >= ${savedCalibration.vitesse_min} (zone morte)`,
      )
      return
    }

    const payload = `${target}:${apiSpeed}:${durationMs}`
    await envoyerCommandeServo(payload)
    setStatus(
      `commande envoyee (${target}) -> vitesse=${apiSpeed}, temp_360_theorique=${durationMs}ms`,
    )
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <div role="tablist" className="tabs tabs-box">
          <button
            role="tab"
            className={`tab ${activeMenu === 'calibration' ? 'tab-active' : ''}`}
            onClick={() => setActiveMenu('calibration')}
          >
            Calibration
          </button>
          <button
            role="tab"
            className={`tab ${activeMenu === 'api' ? 'tab-active' : ''}`}
            onClick={() => setActiveMenu('api')}
          >
            API cumulee
          </button>
        </div>

        {activeMenu === 'calibration' && (
          <section className="card bg-base-100 shadow-xl">
            <div className="card-body gap-4">
              <h1 className="card-title">Calibration Moteur</h1>

              <label className="form-control gap-2">
                <span className="label-text">Moteur cible</span>
                <select
                  className="select select-bordered"
                  value={targetCalibration}
                  onChange={(event) =>
                    setTargetCalibration((event.target as HTMLSelectElement).value as MotorTarget)
                  }
                  disabled={isCalibrating}
                >
                  <option value="bras">bras</option>
                  <option value="pince">pince</option>
                </select>
              </label>

              <label className="form-control gap-2">
                <span className="label-text">
                  Vitesse min (debut de mouvement): {minSpeedCalibration}
                </span>
                <input
                  type="range"
                  min={0}
                  max={99}
                  step={1}
                  value={minSpeedCalibration}
                  className="range range-warning"
                  onInput={(event) => {
                    const nextMin = Math.max(
                      0,
                      Math.min(99, Number((event.target as HTMLInputElement).value)),
                    )
                    setMinSpeedCalibration(nextMin)
                    if (nextMin >= maxSpeedCalibration) {
                      setMaxSpeedCalibration(Math.min(100, nextMin + 1))
                    }
                  }}
                  disabled={isCalibrating}
                />
              </label>

              <label className="form-control gap-2">
                <span className="label-text">Vitesse max utile: {maxSpeedCalibration}</span>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={maxSpeedCalibration}
                  className="range range-info"
                  onInput={(event) => {
                    const nextMax = Math.max(
                      1,
                      Math.min(100, Number((event.target as HTMLInputElement).value)),
                    )
                    setMaxSpeedCalibration(nextMax)
                    if (nextMax <= minSpeedCalibration) {
                      setMinSpeedCalibration(Math.max(0, nextMax - 1))
                    }
                  }}
                  disabled={isCalibrating}
                />
              </label>

              <label className="form-control gap-2">
                <span className="label-text">Vitesse calibration: {speedCalibration}</span>
                <input
                  type="range"
                  min={-maxSpeedCalibration}
                  max={maxSpeedCalibration}
                  step={1}
                  value={speedCalibration}
                  className="range range-primary"
                  onInput={(event) =>
                    setSpeedCalibration(Number((event.target as HTMLInputElement).value))
                  }
                  disabled={isCalibrating}
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  className="btn btn-primary"
                  onClick={() => void startCalibration()}
                  disabled={isCalibrating}
                >
                  start-calibration
                </button>
                <button
                  className="btn btn-error"
                  onClick={() => void stopCalibration()}
                  disabled={!isCalibrating}
                >
                  stop-calibration
                </button>
              </div>

              <div className="rounded-lg border border-base-300 bg-base-200 p-3 text-sm">
                <p>Temps ecoule: {elapsedMs}ms</p>
                <p>
                  Derniere calibration:
                  {` vitesse=${savedCalibration.vitesse_moteur}, temp_360=${savedCalibration.temp_360}ms, min=${savedCalibration.vitesse_min}, max=${savedCalibration.vitesse_max}`}
                </p>
              </div>

              <h2 className="card-title text-lg">JSON Calibration</h2>
              <textarea
                className="textarea textarea-bordered h-56 font-mono text-sm"
                value={jsonInput}
                onInput={(event) => setJsonInput((event.target as HTMLTextAreaElement).value)}
              />
              <div className="flex gap-3">
                <button className="btn btn-secondary" onClick={() => void sendCalibrationJson()}>
                  send json
                </button>
              </div>
              <p className="text-sm opacity-80">
                Format attendu:
                {' {vitesse_moteur : int, temp_360 : int_ms, vitesse_min : int, vitesse_max : int}'}
              </p>
            </div>
          </section>
        )}

        {activeMenu === 'api' && (
          <section className="card bg-base-100 shadow-xl">
            <div className="card-body gap-4">
              <h1 className="card-title">API Cumulee (1 tour)</h1>

              <label className="form-control gap-2">
                <span className="label-text">Vitesse cible pour le calcul: {apiSpeed}</span>
                <input
                  type="range"
                  min={-savedCalibration.vitesse_max}
                  max={savedCalibration.vitesse_max}
                  step={1}
                  value={apiSpeed}
                  className="range range-accent"
                  onInput={(event) => setApiSpeed(Number((event.target as HTMLInputElement).value))}
                />
              </label>

              <div className="rounded-lg border border-base-300 bg-base-200 p-3 text-sm space-y-1">
                <p>v_effective(v) = clamp(|v|, v_min, v_max) - v_min + 1</p>
                <p>temps_theorique_360_ms = temp_360_calibre_ms * v_effective(calib) / v_effective(cible)</p>
                <p>
                  Calibration courante: vitesse={savedCalibration.vitesse_moteur}, temp_360=
                  {savedCalibration.temp_360}ms, min={savedCalibration.vitesse_min}, max=
                  {savedCalibration.vitesse_max}
                </p>
                <p>Temps theorique pour 1 tour: {theoreticalDurationText}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="btn btn-primary" onClick={() => void sendOneTurn('bras')}>
                  tours moteur 1
                </button>
                <button className="btn btn-secondary" onClick={() => void sendOneTurn('pince')}>
                  tours moteur 2
                </button>
              </div>
              <p className="text-sm opacity-80">
                Chaque clic envoie `moteur:vitesse:temp_ms`. Si tu cliques plusieurs fois, la duree
                s&apos;additionne cote API.
              </p>
            </div>
          </section>
        )}

        <p className="text-sm opacity-70">Statut: {status}</p>
      </div>
    </div>
  )
}
