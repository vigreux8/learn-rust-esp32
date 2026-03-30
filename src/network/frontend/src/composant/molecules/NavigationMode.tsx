import type { JSX } from 'preact'
import { LienMode } from '../atomes/LienMode'
import type { TransportMode } from '../../lib/types'

type NavigationModeProps = {
  modeCourant: TransportMode
}

export function NavigationMode({ modeCourant }: NavigationModeProps): JSX.Element {
  return (
    <nav class="mode-nav" aria-label="Modes de contrôle">
      <LienMode href="/" actif={modeCourant === 'ws'}>
        WebSocketServo
      </LienMode>
      <LienMode href="/http" actif={modeCourant === 'http'}>
        HttpServo
      </LienMode>
    </nav>
  )
}
