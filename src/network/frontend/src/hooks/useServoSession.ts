import { useEffect, useState } from 'preact/hooks'
import type { TransportMode } from '../lib/types'
import { createNetworkTransport } from '../lib/transport'
import { createServoApi, type ServoApi } from '../lib/servo'

/**
 * Cycle de vie transport + API servo (équivalent au bootstrap `main.js` / `http.js`
 * de la référence, sans manipulation DOM).
 */
export function useServoSession(mode: TransportMode): {
  status: string
  servoApi: ServoApi | null
} {
  const [status, setStatus] = useState(
    mode === 'http' ? 'Canal HTTP prêt.' : 'Connexion WebSocket en cours...',
  )
  const [servoApi, setServoApi] = useState<ServoApi | null>(null)

  useEffect(() => {
    const transport = createNetworkTransport(mode, setStatus)
    const api = createServoApi(transport)
    setServoApi(api)
    transport.start()

    const onBeforeUnload = (): void => {
      transport.stop()
    }
    const onPageHide = (): void => {
      transport.stop()
    }
    const onPageShow = (): void => {
      transport.resume()
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('pageshow', onPageShow)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('pageshow', onPageShow)
      transport.stop()
      setServoApi(null)
    }
  }, [mode])

  return { status, servoApi }
}
