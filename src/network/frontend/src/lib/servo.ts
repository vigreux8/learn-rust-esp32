import type { NetworkTransport, ServoTarget } from './types'

export type ServoApi = {
  move: (target: ServoTarget, speed: string | number) => void
  stop: (target: ServoTarget) => void
}

/** API métier servo — reprend la logique de `reference/site/script/api/servo.js`. */
export function createServoApi(transport: NetworkTransport): ServoApi {
  return {
    move(target: ServoTarget, speed: string | number) {
      transport.send(target, speed, false)
    },

    stop(target: ServoTarget) {
      transport.send(target, 0, true)
    },
  }
}
