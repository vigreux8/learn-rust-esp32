import type { JSX } from 'preact'
import Router, { Route } from 'preact-router'
import { PanneauControleServo } from './composant/organismes/PanneauControleServo'

function RouteWebSocket(): JSX.Element {
  return (
    <PanneauControleServo mode="ws" titreDocument="ESP32 - Contrôle Servomoteurs" />
  )
}

function RouteHttp(): JSX.Element {
  return (
    <PanneauControleServo
      mode="http"
      titreDocument="ESP32 - Contrôle Servomoteurs (HTTP)"
    />
  )
}

export function App(): JSX.Element {
  return (
    <Router>
      <Route path="/" component={RouteWebSocket} />
      <Route path="/http" component={RouteHttp} />
      <Route default component={RouteWebSocket} />
    </Router>
  )
}
