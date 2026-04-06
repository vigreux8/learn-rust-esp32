import type { JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import type { ServoTarget, TransportMode } from '../../lib/types'
import { useServoSession } from '../../hooks/useServoSession'
import { TitrePrincipal } from '../atomes/TitrePrincipal'
import { TexteStatut } from '../atomes/TexteStatut'
import { NavigationMode } from '../molecules/NavigationMode'
import { CarteMoteur } from '../molecules/CarteMoteur'

type PanneauControleServoProps = {
  mode: TransportMode
  titreDocument: string
}

const VITESSE_INITIALE: Record<ServoTarget, number> = {
  bras: 0,
  pince: 0,
}

export function PanneauControleServo({
  mode,
  titreDocument,
}: PanneauControleServoProps): JSX.Element {
  const { status, servoApi } = useServoSession(mode)
  const [vitesses, setVitesses] = useState<Record<ServoTarget, number>>(VITESSE_INITIALE)

  useEffect(() => {
    document.title = titreDocument
  }, [titreDocument])

  const desactive = servoApi === null

  const majVitesse = (cible: ServoTarget, v: number): void => {
    setVitesses((s) => ({ ...s, [cible]: v }))
  }

  const arret = (cible: ServoTarget): void => {
    majVitesse(cible, 0)
    servoApi?.stop(cible)
  }

  return (
    <>
      <TitrePrincipal>Contrôle Temps Réel</TitrePrincipal>
      <NavigationMode modeCourant={mode} />
      <main class="motors-grid">
        <CarteMoteur
          titre="Moteur Bras"
          cible="bras"
          mode={mode}
          vitesse={vitesses.bras}
          desactive={desactive}
          servoApi={servoApi}
          onVitesseChange={majVitesse}
          onArret={arret}
        />
        <CarteMoteur
          titre="Moteur Pince"
          cible="pince"
          mode={mode}
          vitesse={vitesses.pince}
          desactive={desactive}
          servoApi={servoApi}
          onVitesseChange={majVitesse}
          onArret={arret}
        />
      </main>
      <TexteStatut message={status} />
    </>
  )
}
