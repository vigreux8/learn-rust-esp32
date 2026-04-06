import type { JSX } from 'preact'

type TitrePrincipalProps = {
  children: string
}

export function TitrePrincipal({ children }: TitrePrincipalProps): JSX.Element {
  return <h1>{children}</h1>
}
