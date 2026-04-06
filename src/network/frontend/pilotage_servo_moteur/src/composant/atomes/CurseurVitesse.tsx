import type { JSX } from 'preact'

type CurseurVitesseProps = {
  valeur: number
  desactive?: boolean
  /** À chaque `input` : met à jour l’affichage ; le parent y joint l’envoi WS si besoin. */
  onValeurChange: (valeur: number) => void
  /** HTTP : envoi sur `change` / relâchement (voir `reference/site/script/ui.js`). */
  onValiderEnvoi?: (valeur: number) => void
}

export function CurseurVitesse({
  valeur,
  desactive = false,
  onValeurChange,
  onValiderEnvoi,
}: CurseurVitesseProps): JSX.Element {
  return (
    <input
      class="speed-slider"
      type="range"
      min={-100}
      max={100}
      step={1}
      value={valeur}
      disabled={desactive}
      onInput={(e) => {
        const v = Number((e.currentTarget as HTMLInputElement).value)
        onValeurChange(v)
      }}
      onChange={(e) => {
        const v = Number((e.currentTarget as HTMLInputElement).value)
        onValiderEnvoi?.(v)
      }}
      onPointerUp={(e) => {
        const v = Number((e.currentTarget as HTMLInputElement).value)
        onValiderEnvoi?.(v)
      }}
      onTouchEnd={(e) => {
        const v = Number((e.currentTarget as HTMLInputElement).value)
        onValiderEnvoi?.(v)
      }}
    />
  )
}
