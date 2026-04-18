# WebSocket : où ça se trouve et flux end-to-end

Ce document décrit **où se trouve** tout ce qui fait fonctionner le WebSocket dans le projet servomoteur, et **comment** les messages circulent du navigateur jusqu’aux moteurs (et retour).

---

## 1. Où se trouve le code WebSocket ?

| Rôle | Fichier | Ce qu’il fait |
|------|---------|----------------|
| **Config firmware** | `sdkconfig.defaults` | Active le support WebSocket du serveur HTTP ESP-IDF (`CONFIG_HTTPD_WS_SUPPORT=y`). Sans ça, le serveur ne gère pas l’upgrade WebSocket. |
| **Serveur (route + logique)** | `src/wifi/serveur.rs` | Déclare la route `/ws`, gère les sessions (nouvelle/fermée), reçoit les messages, parse les commandes, applique la vitesse aux moteurs, renvoie les réponses. |
| **Client (navigateur)** | `src/wifi/site/script.js` | Crée la connexion WebSocket vers `/ws`, envoie les commandes (sliders / STOP), affiche le statut et les messages d’erreur. |
| **UI** | `src/wifi/site/main.html` | Page avec sliders et boutons STOP ; inclut `script.js` qui ouvre le WebSocket. |
| **Style** | `src/wifi/site/style.css` | Classe `.ws-status` pour afficher l’état de la connexion. |
| **Point d’entrée** | `src/main.rs` | Démarre le Wi-Fi et le serveur (donc la route `/ws`) avec les contrôleurs de servos. |

En résumé : **le “moteur” WebSocket côté ESP32 est dans `serveur.rs`** (route `/ws` + handler), **le client est dans `script.js`**, et **le firmware doit avoir WebSocket activé** dans `sdkconfig.defaults`.

---

## 2. Flux end-to-end (du navigateur aux moteurs)

### 2.1 Démarrage

1. **ESP32**  
   - `main.rs` : démarre Wi-Fi (AP) et `WifiServer`.  
   - `serveur.rs` : crée le serveur HTTP, enregistre les routes (dont `ws_handler("/ws", ...)`).  
   - Le serveur écoute sur `http://192.168.71.1` (port 80).

2. **Navigateur**  
   - L’utilisateur ouvre `http://192.168.71.1`.  
   - Le serveur répond avec `main.html` (route `GET /`).  
   - La page charge `script.js` (route `GET /script-v2.js`).  
   - `script.js` exécute `connectWebSocket()`.

3. **Connexion WebSocket**  
   - `script.js` : `new WebSocket("ws://192.168.71.1/ws")`.  
   - Requête HTTP avec `Upgrade: websocket` vers `/ws`.  
   - Le serveur ESP-IDF (configuré avec `CONFIG_HTTPD_WS_SUPPORT=y`) accepte l’upgrade.  
   - Le handler dans `serveur.rs` est appelé avec `ws.is_new() === true`.  
   - Le serveur envoie `"connected"` au client.  
   - Côté client, `ws.onopen` se déclenche, le statut affiche “WebSocket connecté.”.

### 2.2 Envoi d’une commande (slider ou STOP)

1. **Utilisateur**  
   - Bouge un slider (Bras ou Pince) ou clique sur STOP.

2. **Client (`script.js`)**  
   - Slider : `sendSpeed(target, value)` avec `target` = `"bras"` ou `"pince"`, `value` = -100..100.  
   - STOP : `resetSliderToZero(target)` puis `sendSpeed(target, 0)`.  
   - Message envoyé : chaîne `"bras:42"`, `"pince:-50"`, `"bras:0"`, etc.  
   - `ws.send(message)` uniquement si `ws.readyState === WebSocket.OPEN`.

3. **Réseau**  
   - Un frame WebSocket (texte) est envoyé sur la connexion déjà établie vers `/ws`.

4. **Serveur (`serveur.rs`)**  
   - Le `ws_handler` est rappelé pour cette connexion (pas nouvelle, pas fermée).  
   - `ws.recv(&mut [])` : récupère type de frame et longueur.  
   - Si ce n’est pas Text/Binary ou si `len == 0`, sortie sans réponse.  
   - Si `len > WS_MAX_PAYLOAD_LEN` (32), envoie `"payload_too_large"` et sort.  
   - `ws.recv(&mut buffer)` : lit le payload dans `buffer`.  
   - Décodage UTF-8 : si échec, envoie `"invalid_utf8"`.  
   - `parse_speed_command(payload)` : attend `"bras:XX"` ou `"pince:XX"`, vitesse entre -100 et 100.  
   - Si format invalide : envoie `"invalid_command"`.  
   - Sinon : `MotorControllers::apply_speed(target, speed)` → `moteur_bras.set_speed(speed)` ou `moteur_pince.set_speed(speed)`.  
   - Puis envoie `"ok"` au client.

5. **Client**  
   - `ws.onmessage` reçoit la réponse.  
   - Si ce n’est ni `"ok"` ni `"connected"`, affiche `ESP32: <message>` (ex. erreur).

### 2.3 Déconnexion / reconnexion

- **Fermeture** (onglet fermé, réseau coupé, etc.) : `ws.onclose` dans `script.js` → message “WebSocket déconnecté. Reconnexion…” → après 1,5 s, `connectWebSocket()` est rappelé.  
- Côté serveur : au prochain passage dans le handler, `ws.is_closed()` peut être vrai ; un log “Session WebSocket fermée” est émis.

---

## 3. Format des messages (contrat client ↔ serveur)

- **Client → ESP32** : une ligne texte `MOTEUR:VITESSE`.  
  - Moteurs : `bras` ou `pince` (insensible à la casse).  
  - Vitesse : entier entre -100 et 100 (sera clampé côté serveur).  
  - Exemples : `bras:50`, `pince:-100`, `bras:0`.

- **ESP32 → client** :  
  - `connected` : juste après l’ouverture de la session.  
  - `ok` : commande acceptée et appliquée.  
  - `invalid_utf8` : payload non UTF-8.  
  - `invalid_command` : format non reconnu.  
  - `payload_too_large` : message > 32 octets.

---

## 4. Schéma récapitulatif

```mermaid
sequenceDiagram
    participant N as Navigateur
    participant E as ESP32

    N->>E: GET /
    Note right of E: serveur.rs : fn_handler("/")
    E->>N: HTML (main.html)

    N->>E: GET /script-v2.js
    Note right of E: fn_handler("/script-v2.js")
    E->>N: script.js

    N->>E: GET /ws + Upgrade: websocket
    Note right of E: ws_handler("/ws") is_new() → send "connected"
    E->>N: "connected"
    Note over N,E: Connexion WebSocket persistante

    N->>E: "bras:42" (frame WS texte)
    Note right of E: recv → parse_speed_command → apply_speed(Bras, 42)
    E->>N: "ok"
```

---

## 5. Bibliothèques esp-idf-svc : serveur HTTP et WebSocket

Tout le serveur et le WebSocket s'appuient sur la crate **`esp-idf-svc`** (bindings Rust pour ESP-IDF). Ci-dessous : les **types / structs / énumérations** avec leur **import** et leur **rôle**, pour avoir sous la main tout ce qu'il faut pour créer le serveur et le WebSocket.

### En HTTP seulement vs avec WebSocket

| Contexte | Ce qu'il faut toucher |
|----------|------------------------|
| **Serveur HTTP uniquement** (pages, API REST, pas de `/ws`) | **Wi-Fi** + **Serveur HTTP** + **Erreurs** (sections ci-dessous). Aucune config spéciale dans `sdkconfig.defaults`. Les routes se font avec `fn_handler` uniquement. |
| **Avec WebSocket** (route `/ws` en plus) | Tout ce qui précède **plus** : **WebSocket** (imports + `ws_handler`), et la config décrite dans la section **sdkconfig.defaults** ci-dessous. Sans elle, le serveur refusera l'upgrade WebSocket sur `/ws`. |

Donc : en **HTTP seul**, tu n'as rien à activer côté firmware ; la section "WebSocket" et la section "sdkconfig.defaults" ne concernent que lorsque tu ajoutes une route WebSocket.

### sdkconfig.defaults (option WebSocket uniquement)

Cette config se trouve dans le **fichier** `sdkconfig.defaults` à la racine du projet (à côté de `Cargo.toml`). Elle n’est nécessaire **que** si tu utilises une route WebSocket (`ws_handler`).

Ajoute ou vérifie la ligne suivante dans **`sdkconfig.defaults`** :

```
CONFIG_HTTPD_WS_SUPPORT=y
```

Sans cette ligne dans `sdkconfig.defaults`, le serveur HTTP ESP-IDF ne gère pas l’upgrade WebSocket et la route `/ws` ne fonctionnera pas.

### Dépendance Cargo

```toml
[dependencies]
esp-idf-svc = "0.51"
```

### Wi-Fi (point d'accès)

| Nom | Import | À quoi ça sert |
|-----|--------|-----------------|
| **Modem** | `esp_idf_svc::hal::modem::Modem` | Périphérique modem Wi-Fi, passé à `EspWifi::new` pour initialiser le WiFi. |
| **EspSystemEventLoop** | `esp_idf_svc::eventloop::EspSystemEventLoop` | Boucle d'événements système ; utilisée par le WiFi et `BlockingWifi::wrap`. |
| **EspDefaultNvsPartition** | `esp_idf_svc::nvs::EspDefaultNvsPartition` | Partition NVS par défaut ; requise par `EspWifi::new` pour la config WiFi. |
| **EspWifi** | `esp_idf_svc::wifi::EspWifi` | Driver WiFi bas niveau (créé avec `EspWifi::new(modem, sys_loop, nvs)`). |
| **BlockingWifi** | `esp_idf_svc::wifi::BlockingWifi` | Wrapper synchrone autour de `EspWifi` : `start()`, `wait_netif_up()`, etc. |
| **Configuration** | `esp_idf_svc::wifi::Configuration` | Enum de config WiFi ; en AP on utilise `Configuration::AccessPoint(...)`. |
| **AccessPointConfiguration** | `esp_idf_svc::wifi::AccessPointConfiguration` | SSID, mot de passe, canal, auth, max_connections pour l'AP. |
| **AuthMethod** | `esp_idf_svc::wifi::AuthMethod` | Méthode d'authentification (ex. `AuthMethod::None` pour AP ouvert). |

### Serveur HTTP

| Nom | Import | À quoi ça sert |
|-----|--------|-----------------|
| **EspHttpServer** | `esp_idf_svc::http::server::EspHttpServer` | Serveur HTTP ; créé avec `EspHttpServer::new_nonstatic(&Configuration { ... })`, enregistre routes et `ws_handler`. |
| **Configuration** (HTTP) | `esp_idf_svc::http::server::Configuration` | Config du serveur (ex. `stack_size`) ; passé à `EspHttpServer::new_nonstatic`. |
| **Method** | `esp_idf_svc::http::Method` | Méthode HTTP : `Method::Get`, `Method::Post`, etc. |
| **fn_handler** | méthode sur `EspHttpServer` | Enregistre une route HTTP (ex. `server.fn_handler("/", Method::Get, \|req\| { ... })`). |
| **into_response** | sur l'objet requête dans le handler | Construit la réponse HTTP (code, headers) et renvoie un writer pour le corps. |
| **Write** | `esp_idf_svc::io::Write` | Trait pour écrire le corps de la réponse (ex. `.write_all(html.as_bytes())`). |
| **EspIOError** | `esp_idf_svc::io::EspIOError` | Type d'erreur I/O utilisé dans les handlers HTTP (fn_handler). |

### WebSocket

| Nom | Import | À quoi ça sert |
|-----|--------|-----------------|
| **ws_handler** | méthode sur `EspHttpServer` | Enregistre la route WebSocket : `server.ws_handler("/ws", \|ws: &mut EspHttpWsConnection\| { ... })`. |
| **EspHttpWsConnection** | `esp_idf_svc::http::server::ws::EspHttpWsConnection` | Connexion WebSocket côté serveur ; reçu dans le callback : `is_new()`, `is_closed()`, `recv()`, `send()`, `session()`. |
| **FrameType** | `esp_idf_svc::ws::FrameType` | Type de frame WebSocket : `FrameType::Text(false)` pour envoyer du texte ; utilisé dans `ws.recv()` (type reçu) et `ws.send()`. |
| **Read** | `esp_idf_svc::io::Read` | Trait utilisé indirectement par `recv` pour lire les données reçues. |

### Erreurs et bas niveau

| Nom | Import | À quoi ça sert |
|-----|--------|-----------------|
| **EspError** | `esp_idf_svc::sys::EspError` | Erreur ESP-IDF ; type de retour des appels WiFi, HTTP, WebSocket. |
| **ESP_FAIL** | `esp_idf_svc::sys::ESP_FAIL` | Code d'erreur ESP-IDF (ex. pour construire une `EspError` dans un handler). |

### Bloc d'imports type pour serveur + WebSocket

```rust
use esp_idf_svc::eventloop::EspSystemEventLoop;
use esp_idf_svc::hal::modem::Modem;
use esp_idf_svc::http::server::ws::EspHttpWsConnection;
use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::http::Method;
use esp_idf_svc::io::{EspIOError, Write};
use esp_idf_svc::nvs::EspDefaultNvsPartition;
use esp_idf_svc::sys::EspError;
use esp_idf_svc::wifi::{
    AccessPointConfiguration, AuthMethod, BlockingWifi, Configuration, EspWifi,
};
use esp_idf_svc::ws::FrameType;
```

Avec ça, tu disposes de toutes les **library** (types + méthodes) nécessaires pour créer le point d'accès Wi-Fi, le serveur HTTP et la route WebSocket. Pour le WebSocket, n’oublie pas la section **sdkconfig.defaults** ci-dessus.

---

## 6. Résumé des fichiers à garder en tête

- **Activation WebSocket** : `sdkconfig.defaults`  
- **Route et logique serveur** : `src/wifi/serveur.rs` (imports `EspHttpWsConnection`, `FrameType`, `ws_handler`, `parse_speed_command`, `MotorControllers`)  
- **Connexion et envoi côté client** : `src/wifi/site/script.js`  
- **Page qui charge le script** : `src/wifi/site/main.html`  
- **Démarrage du serveur** : `src/main.rs` (appel à `WifiServer::start`)

Tout ce qui fait que “le WebSocket fonctionne” se situe dans ces éléments ; le reste (CSS, autres routes HTTP) sert à l’interface et au chargement de la page.
