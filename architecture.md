# Architecture du projet `servomoteur`

## Vue d'ensemble

Ce projet embarqué ESP32 expose une interface web pour piloter deux servomoteurs:

- `moteur_bras`
- `moteur_pince`

Deux modes de pilotage existent côté interface:

- `WebSocketServo` (route cliente `/`)
- `HttpServo` (route cliente `/http`)

L’interface utilisateur est développée en **Preact** (TypeScript, Vite) sous `src/network/frontend/`. Le comportement réseau et les commandes servo reprennent la même logique que l’ancien site vanilla conservé à titre de référence dans `reference/site/` (sans duplication dans le code de l’app Preact : transport et API dans `src/lib/`).

Le backend est en Rust (`esp-idf-svc`) avec:

- point d’accès Wi-Fi (mode AP)
- serveur HTTP
- endpoint WebSocket
- endpoint HTTP POST pour commandes servo

## Structure des modules

```text
src/
├── main.rs
├── hardware/
│   ├── mod.rs
│   ├── manager.rs
│   └── servo/
│       ├── mod.rs
│       ├── bus.rs
│       └── controller_sg_360.rs
└── network/
    ├── mod.rs
    ├── manager.rs
    ├── services/
    │   ├── mod.rs
    │   ├── wifi.rs
    │   ├── dns.rs
    │   └── http.rs
    ├── handlers/
    │   ├── mod.rs
    │   ├── http.rs
    │   └── ws.rs
    └── frontend/                   # Application Preact (source + build)
        ├── package.json
        ├── vite.config.ts
        ├── index.html
        ├── dist/                   # Sortie `npm run build` (bundle déployable)
        └── src/
            ├── main.tsx
            ├── app.tsx             # Router `/` et `/http`
            ├── index.css
            ├── lib/                # Logique réseau / servo (équivalent api/*.js)
            │   ├── types.ts
            │   ├── transport.ts
            │   └── servo.ts
            ├── hooks/
            │   └── useServoSession.ts
            └── composant/
                ├── atomes/
                │   ├── TitrePrincipal.tsx
                │   ├── LienMode.tsx
                │   ├── TexteStatut.tsx
                │   ├── BoutonStop.tsx
                │   └── CurseurVitesse.tsx
                ├── molecules/
                │   ├── NavigationMode.tsx
                │   └── CarteMoteur.tsx
                └── organismes/
                    └── PanneauControleServo.tsx
```

## Rôles des composants

- `src/main.rs`
  - initialise ESP-IDF
  - instancie `HardwareManager` (bus PWM)
  - crée `moteur_bras` et `moteur_pince`
  - démarre `NetworkManager`

- `src/hardware/manager.rs`
  - stocke le bus hardware (`ServoBus`)
  - expose `servo_bus()` pour créer les contrôleurs moteurs

- `src/hardware/servo/bus.rs`
  - configure LEDC (50 Hz)
  - crée des `ServoController` par channel/pin

- `src/hardware/servo/controller_sg_360.rs`
  - convertit une vitesse `[-100..100]` en duty PWM
  - API: `set_speed(speed)` et `stop()`

- `src/network/manager.rs`
  - orchestre le démarrage réseau
  - `start()` ne contient que des appels à des fonctions privées:
    - `start_wifi(...)`
    - `start_dns()`
    - `start_http_server()`
    - `build_motor_controllers(...)`
    - `register_handlers(...)`
  - contient aussi `parse_speed_command(...)`

- `src/network/services/wifi.rs`
  - configuration AP (SSID, canal, auth)
  - démarrage AP via `start_access_point(...)`

- `src/network/services/dns.rs`
  - configuration et publication mDNS (`servo.local`)

- `src/network/services/http.rs`
  - configuration serveur HTTP (`stack_size`, `max_open_sockets`, `lru_purge_enable`)
  - création via `setup_http_server()`

- `src/network/handlers/http.rs`
  - sert les fichiers statiques embarqués .. a mettre a jour
  - endpoint `POST /api/servo`

- `src/network/handlers/ws.rs`
  - endpoint `GET /ws` WebSocket

### Frontend Preact (`src/network/frontend/src/`)

- `lib/transport.ts` : WebSocket (reconnexion, file d’attente) et HTTP POST `/api/servo`.
- `lib/servo.ts` : équivalent de `servo.js` — `move` / `stop` au-dessus du transport.
- `hooks/useServoSession.ts` : cycle de vie du transport (démarrage, `beforeunload` / `pagehide` / `pageshow`).
- `composant/` : UI découpée type atomique — **atomes** (contrôles de base), **molécules** (carte moteur, navigation), **organismes** (`PanneauControleServo`).
- `app.tsx` : `preact-router`, routes `/` (mode WS) et `/http` (mode HTTP).

## Routes exposées (firmware)

- a mettre a jour

## Flux d'exécution

```mermaid
flowchart TD
    A[main.rs] --> B[HardwareManager::new]
    B --> C[Création moteur_bras + moteur_pince]
    C --> D[NetworkManager::start]
    D --> E[start_wifi]
    D --> F[start_dns]
    D --> G[start_http_server]
    D --> H[register_handlers]
```

## Points techniques importants

- WebSocket activé via `sdkconfig.defaults`:
  - `CONFIG_HTTPD_WS_SUPPORT=y`
- `EspHttpServer::new(...)` avec:
  - `stack_size: 8192`
  - `max_open_sockets: 3`
- mDNS publie l’ESP32 sous `http://servo.local` (fallback IP: `http://192.168.71.1`)
- taille max de payload bornée (`WS_MAX_PAYLOAD_LEN = 32`)
- partage des contrôleurs via `Arc<Mutex<MotorControllers>>`
- gestion des erreurs: UTF-8, taille payload, format commande
