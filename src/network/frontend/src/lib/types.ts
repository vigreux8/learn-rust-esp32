/** Mode transport aligné sur `architecture.md` (WebSocketServo / HttpServo). */
export type TransportMode = 'ws' | 'http'

/** Cibles attendues par le backend (`POST /api/servo`, WebSocket). */
export type ServoTarget = 'bras' | 'pince'

export type SetStatusFn = (message: string) => void

export type NetworkTransport = {
  start: () => void
  send: (target: ServoTarget, value: string | number, force?: boolean) => void
  stop: () => void
  resume: () => void
}
