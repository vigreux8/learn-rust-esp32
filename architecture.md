# Architecture du projet `servomoteur`

## Vue d'ensemble
Ce projet embarqué ESP32 expose une interface web pour piloter deux servomoteurs:
- `moteur_bras`
- `moteur_pince`

Deux modes de pilotage existent côté front:
- `WebSocketServo` (`/`)
- `HttpServo` (`/http`)

Le backend est en Rust (`esp-idf-svc`) avec:
- point d'accès Wi-Fi (mode AP)
- serveur HTTP
- endpoint WebSocket
- endpoint HTTP POST pour commandes servo

## Structure des modules
```text
src/
  main.rs
  servo/
    mod.rs
    bus.rs
    controller.rs
  wifi/
    mod.rs
    serveur.rs
    site/
      main.html
      http.html
      style.css
      script.js
      script-http.js
```

## Rôles des composants
- `src/main.rs`
  - initialise ESP-IDF
  - crée le bus PWM (`ServoBus`)
  - instancie les deux contrôleurs servo
  - démarre `WifiServer` en lui injectant les moteurs

- `src/servo/bus.rs`
  - configure LEDC (50 Hz)
  - crée des `ServoController` par channel/pin

- `src/servo/controller.rs`
  - convertit une vitesse `[-100..100]` en duty PWM
  - API: `set_speed(speed)` et `stop()`

- `src/wifi/serveur.rs`
  - démarre AP Wi-Fi
  - enregistre routes statiques (HTML/CSS/JS)
  - route WebSocket `/ws` (commande temps réel)
  - route HTTP `/api/servo` (commande via POST)
  - parse des messages `bras:<speed>` / `pince:<speed>`

## Routes exposées
- `GET /` -> UI WebSocket
- `GET /http` -> UI HTTP
- `GET /style-v2.css`
- `GET /script-v2.js`
- `GET /script-http-v1.js`
- `GET /style.css` et `GET /script.js` (compat)
- `GET /ws` (upgrade WebSocket)
- `POST /api/servo` (body texte: `bras:25` ou `pince:-40`)

## Flux d'exécution
```mermaid
flowchart TD
    A[main.rs] --> B[Init peripherals + Wi-Fi AP]
    B --> C[ServoBus 50Hz]
    C --> D[moteur_bras + moteur_pince]
    D --> E[WifiServer::start]
    E --> F[Routes HTTP + WS actives]
```

## Flux commande WebSocket
```mermaid
sequenceDiagram
    participant UI as Browser (/)
    participant WS as /ws handler
    participant CTRL as MotorControllers
    participant SERVO as ServoController

    UI->>WS: "bras:30"
    WS->>CTRL: parse_speed_command
    CTRL->>SERVO: moteur_bras.set_speed(30)
    WS-->>UI: "ok"
```

## Flux commande HTTP
```mermaid
sequenceDiagram
    participant UI as Browser (/http)
    participant API as POST /api/servo
    participant CTRL as MotorControllers
    participant SERVO as ServoController

    UI->>API: body "pince:-20"
    API->>CTRL: parse_speed_command
    CTRL->>SERVO: moteur_pince.set_speed(-20)
    API-->>UI: 200 "ok"
```

## Points techniques importants
- WebSocket activé via `sdkconfig.defaults`:
  - `CONFIG_HTTPD_WS_SUPPORT=y`
- handlers HTTP safe avec durée de vie `'static`:
  - `EspHttpServer::new(...)`
  - `fn_handler(...)` pour la route HTTP commande
- mDNS publie l'ESP32 sous `http://servo.local` (fallback IP: `http://192.168.71.1`)
- taille max de payload bornée (`WS_MAX_PAYLOAD_LEN`) pour robustesse
- cache navigateur limité via `Cache-Control: no-store` sur assets

## Extension future recommandée
- endpoint de télémétrie (`/api/state`) pour remonter la vitesse courante
- route favicon/icône pour nettoyer les logs 404
- abstraction `CommandTransport` si on ajoute MQTT/BLE plus tard
