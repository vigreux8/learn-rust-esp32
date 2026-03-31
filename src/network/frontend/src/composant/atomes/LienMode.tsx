import type { JSX } from 'preact'
import { route } from 'preact-router'

type LienModeProps = {
  href: string
  actif: boolean
  children: string
}

export function LienMode({ href, actif, children }: LienModeProps): JSX.Element {
  return (
    <a
      href={href}
      class={actif ? 'mode-button active' : 'mode-button'}
      onClick={(e) => {
        if (route(href)) {
          e.preventDefault()
        }
      }}
    >
      {children}
    </a>
  )
}
