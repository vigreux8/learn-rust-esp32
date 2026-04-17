date : 17 Feb 2026 at 10:00

---

# Support de Cours : Architecture Modulaire ESP32 (Wi-Fi, BLE & Servos)

## 1. Philosophie de l'Architecture

L'objectif est de séparer la **gestion du matériel** (les ressources physiques comme le `Modem` ou le `Timer`) de la **logique applicative** (les serveurs ou les contrôleurs).

* **Le Dossier `servo/` :** Gère le `LedcTimer` (matériel) dans `bus.rs` et le mouvement dans `controller.rs`.
* **Le Dossier `network/` :** Gère le `Modem` (matériel) dans `stack_modem.rs` et les routes HTTP dans `http.rs`.

---

## 2. Structure des Fichiers

```text
src/
├── main.rs
├── servo/
│   ├── mod.rs
│   ├── bus.rs        # Initialise le Timer
│   └── controller.rs # Définit set_speed(), stop(), etc.
└── network/
    ├── mod.rs        # Ré-exporte Stack, HttpServer et BleServer
    ├── stack_modem.rs # Initialise le Modem pour Wi-Fi + BLE
    ├── http.rs       # Gère les routes (Anciennement wifi.rs/server.rs)
    └── ble.rs        # Gère les caractéristiques et services Bluetooth

```

---

| Caractéristique | Wi-Fi / HTTP | Bluetooth LE (GATT) |
| --- | --- | --- |
| **Transport** | TCP/IP | ATT / L2CAP |
| **Structure** | URL et Méthodes (GET/POST) | UUID et Caractéristiques |
| **Usage type** | Pages web, gros transferts | Capteurs, télécommandes, basse conso |

## 3. Implémentation du Module `network`

### A. `network/mod.rs` (La Façade)

Ce fichier sert d'index et simplifie les imports pour le `main.rs`. Il expose les nouvelles structures définies dans tes fichiers.

```rust
pub mod stack_modem;
pub mod http;
pub mod ble;

// On ré-exporte pour simplifier l'appel dans le main
pub use stack_modem::NetworkStack;
pub use http::HttpServer;
pub use ble::BleServer;

```

### B. `network/stack_modem.rs` (Gestion du Hardware)

C'est ici que l'objet `Modem` est consommé. Puisque ce fichier gère maintenant l'initialisation pour le Wi-Fi **et** le BLE, c'est ici que se fera la séparation (split) du modem.

```rust
pub struct NetworkStack {
    pub wifi: BlockingWifi<EspWifi<'static>>,
    // Plus tard, on pourra ajouter ici le champ pour le BLE
}

impl NetworkStack {
    pub fn new(modem: Modem, sys_loop: EspSystemEventLoop, nvs: EspDefaultNvsPartition) -> Result<Self, EspError> {
        // C'est ici que l'on pourrait séparer le modem en (wifi_modem, ble_modem)
        let wifi = EspWifi::new(modem, sys_loop.clone(), Some(nvs))?;
        
        let mut blocking_wifi = BlockingWifi::wrap(wifi, sys_loop)?;

        // Configuration du Point d'Accès
        let config = Configuration::AccessPoint(AccessPointConfiguration {
            ssid: "cerveau-moteur-esp32".try_into().unwrap(),
            auth_method: AuthMethod::None,
            ..Default::default()
        });

        blocking_wifi.set_configuration(&config)?;
        blocking_wifi.start()?;
        blocking_wifi.wait_netif_up()?;

        Ok(Self { wifi: blocking_wifi })
    }
}

```

### C. `network/http.rs` (Logique Logicielle Web)

Ce fichier remplace l'ancien `server.rs`. Il se concentre uniquement sur le serveur HTTP. Nous renommons la structure `WifiServer` en `HttpServer` pour plus de cohérence.

```rust
pub struct HttpServer {
    _server: EspHttpServer<'static>,
}

impl HttpServer {
    pub fn start() -> Result<Self, EspError> {
        let mut server = EspHttpServer::new(&Configuration {
            stack_size: 8192,
            ..Default::default()
        }).map_err(|e| e.0)?;

        // register_routes(&mut server)?; // Configuration des routes (/, /hello, etc.)

        Ok(Self { _server: server })
    }
}

```

---

## 4. Orchestration dans `main.rs`

Le `main.rs` reste un simple distributeur de ressources, mais utilise désormais les nouveaux noms de modules.

```rust
fn main() -> anyhow::Result<()> {
    let peripherals = Peripherals::take()?;
    let sys_loop = EspSystemEventLoop::take()?;
    let nvs = EspDefaultNvsPartition::take()?;

    // 1. Initialisation des "Bus" (Hardware)
    // Consomme le Modem via stack_modem.rs
    let network = NetworkStack::new(peripherals.modem, sys_loop.clone(), nvs.clone())?; 
    
    // Consomme le Timer via servo/bus.rs
    let servo_bus = ServoBus::new(peripherals.ledc.timer0)?; 

    // 2. Lancement des Services (Software)
    let _http_server = HttpServer::start()?;  // Via network/http.rs
    // let _ble_server = BleServer::start()?; // Futur service BLE via network/ble.rs

    let mut motor = servo_bus.add_servo(peripherals.ledc.channel0, peripherals.pins.gpio18)?;

    loop {
        // Logique principale
    }
}

```

---

## 5. Comment intégrer le BLE plus tard ?

Grâce à la nouvelle structure, l'ajout du Bluetooth suit une logique claire :

1. **Dans `network/stack_modem.rs` :** Tu modifies `NetworkStack::new` pour utiliser `EspWifi::new` ET `EspBle::new` (en partageant ou divisant le `Modem`).
2. **Dans `network/ble.rs` :** Tu implémentes ta structure `BleServer` avec la logique des services et caractéristiques GATT.
3. **Dans `network/mod.rs` :** Le module est déjà déclaré, il suffira de décommenter ou d'ajuster les exports si nécessaire.

Cette méthode garantit que ton code reste propre : `http.rs` ne se soucie pas du Bluetooth, et `stack_modem.rs` centralise toute la complexité de l'initialisation radio.