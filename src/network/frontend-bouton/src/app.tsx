import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

type MotorTarget = 'bras' | 'pince'

type CalibrationJson = {
  vitesse_moteur: number
  temp_360: number
}

const STORAGE_KEY = 'servo_calibration_frontend_v1'

function normalizeCalibration(value: unknown): CalibrationJson | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  const vitesse = Number(record.vitesse_moteur)
  const temp360 = Number(record.temp_360)

  if (!Number.isFinite(vitesse) || !Number.isFinite(temp360)) {
    return null
  }

  return {
    vitesse_moteur: Math.trunc(vitesse),
    temp_360: Math.max(1, Math.trunc(temp360)),
  }
}

export function App() {
  const [status, setStatus] = useState<string>('pret')
  const [target, setTarget] = useState<MotorTarget>('bras')
  const [speed, setSpeed] = useState<number>(60)
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false)
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState<number>(0)
  const [savedCalibration, setSavedCalibration] = useState<CalibrationJson | null>(null)
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify({ vitesse_moteur: 60, temp_360: 2 }, null, 2),
  )
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return
    }
    try {
      const parsed = JSON.parse(raw) as unknown
      const calibration = normalizeCalibration(parsed)
      if (!calibration) {
        return
      }
      setSavedCalibration(calibration)
      setJsonInput(JSON.stringify(calibration, null, 2))
    } catch {
      // Ignore localStorage invalide
    }
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [])

  const elapsedSecondsText = useMemo(() => (elapsedMs / 1000).toFixed(2), [elapsedMs])

  async function envoyerCommande(payload: string): Promise<boolean> {
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
    setSavedCalibration(calibration)
    setJsonInput(JSON.stringify(calibration, null, 2))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calibration))
  }

  async function startCalibration(): Promise<void> {
    if (isCalibrating) {
      return
    }
    if (speed === 0) {
      setStatus('vitesse 0 interdite pour la calibration')
      return
    }

    const ok = await envoyerCommande(`${target}:${speed}`)
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

    setStatus(`calibration en cours sur ${target} a vitesse ${speed}`)
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

    await envoyerCommande(`${target}:0`)

    const calibration: CalibrationJson = {
      vitesse_moteur: Math.trunc(speed),
      temp_360: Math.max(1, Math.round(totalMs / 1000)),
    }
    saveCalibration(calibration)
    setStatus(
      `calibration sauvegardee: vitesse=${calibration.vitesse_moteur}, temp_360=${calibration.temp_360}s`,
    )
  }

  async function sendJson(): Promise<void> {
    let calibration: CalibrationJson | null = null
    try {
      calibration = normalizeCalibration(JSON.parse(jsonInput) as unknown)
    } catch {
      calibration = null
    }

    if (!calibration) {
      setStatus('json invalide: attendu { "vitesse_moteur": int, "temp_360": int }')
      return
    }

    try {
      const body = JSON.stringify(calibration)
      const response = await fetch('/api/calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
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

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
        <section className="card bg-base-100 shadow-xl">
          <div className="card-body gap-4">
            <h1 className="card-title">Calibration Moteur</h1>

            <label className="form-control gap-2">
              <span className="label-text">Moteur cible</span>
              <select
                className="select select-bordered"
                value={target}
                onChange={(event) => setTarget((event.target as HTMLSelectElement).value as MotorTarget)}
                disabled={isCalibrating}
              >
                <option value="bras">bras</option>
                <option value="pince">pince</option>
              </select>
            </label>

            <label className="form-control gap-2">
              <span className="label-text">Vitesse moteur: {speed}</span>
              <input
                type="range"
                min={-100}
                max={100}
                step={1}
                value={speed}
                className="range range-primary"
                onInput={(event) =>
                  setSpeed(Number((event.target as HTMLInputElement).value))
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
              <p>Temps ecoule: {elapsedSecondsText}s</p>
              <p>
                Derniere calibration:
                {savedCalibration
                  ? ` vitesse=${savedCalibration.vitesse_moteur}, temp_360=${savedCalibration.temp_360}s`
                  : ' aucune'}
              </p>
            </div>
          </div>
        </section>

        <section className="card bg-base-100 shadow-xl">
          <div className="card-body gap-4">
            <h2 className="card-title">JSON Calibration</h2>
            <textarea
              className="textarea textarea-bordered h-64 font-mono text-sm"
              value={jsonInput}
              onInput={(event) => setJsonInput((event.target as HTMLTextAreaElement).value)}
            />
            <div className="flex gap-3">
              <button className="btn btn-secondary" onClick={() => void sendJson()}>
                send json
              </button>
            </div>
            <p className="text-sm opacity-80">
              Format attendu: {'{vitesse_moteur : int , temp_360 : int}'}
            </p>
          </div>
        </section>
      </div>

      <p className="mx-auto mt-4 max-w-6xl text-sm opacity-70">Statut: {status}</p>
    </div>
  )
}
