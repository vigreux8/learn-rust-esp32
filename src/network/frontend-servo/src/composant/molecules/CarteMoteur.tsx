import type { JSX } from 'preact'
import type { ServoApi } from '../../lib/servo'
import type { ServoTarget, TransportMode } from '../../lib/types'
import { BoutonStop } from '../atomes/BoutonStop'
import { CurseurVitesse } from '../atomes/CurseurVitesse'

type CarteMoteurProps = {
  titre: string
  cible: ServoTarget
  mode: TransportMode
  vitesse: number
  desactive: boolean
  servoApi: ServoApi | null
  onVitesseChange: (cible: ServoTarget, vitesse: number) => void
  onArret: (cible: ServoTarget) => void
}

export function CarteMoteur({
  titre,
  cible,
  mode,
  vitesse,
  desactive,
  servoApi,
  onVitesseChange,
  onArret,
}: CarteMoteurProps): JSX.Element {
  const envoyerSiPret = (v: number): void => {
    if (servoApi) {
      servoApi.move(cible, v)
    }
  }

  return (
    <section class="motor-card">
      <div class="motor-header">
        <h2>{titre}</h2>
        <BoutonStop desactive={desactive} onArret={() => onArret(cible)} />
      </div>
      <CurseurVitesse
        valeur={vitesse}
        desactive={desactive}
        onValeurChange={(v) => {
          onVitesseChange(cible, v)
          if (mode === 'ws') {
            envoyerSiPret(v)
          }
        }}
        onValiderEnvoi={mode === 'http' ? (v) => envoyerSiPret(v) : undefined}
      />
    </section>
  )
}
