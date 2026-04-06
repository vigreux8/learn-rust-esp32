import type { JSX } from 'preact'

type TexteStatutProps = {
  message: string
}

export function TexteStatut({ message }: TexteStatutProps): JSX.Element {
  return (
    <p class="ws-status" id="transport-status">
      {message}
    </p>
  )
}
