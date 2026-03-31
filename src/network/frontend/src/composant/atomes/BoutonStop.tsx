import type { JSX } from 'preact'

type BoutonStopProps = {
  onArret: () => void
  libelle?: string
  desactive?: boolean
}

export function BoutonStop({
  onArret,
  libelle = 'STOP',
  desactive = false,
}: BoutonStopProps): JSX.Element {
  return (
    <button type="button" class="stop-button" disabled={desactive} onClick={onArret}>
      {libelle}
    </button>
  )
}
