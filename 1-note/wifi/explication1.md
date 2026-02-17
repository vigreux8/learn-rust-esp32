# décortiquage du code wifi 
date : 16 Feb 2026 at 20:14


## code 
```rust 
use core::convert::TryInto;

use esp_idf_svc::eventloop::EspSystemEventLoop;
use esp_idf_svc::hal::modem::Modem;
use esp_idf_svc::http::server::EspHttpServer;
use esp_idf_svc::http::Method;
use esp_idf_svc::io::{EspIOError, Write};
use esp_idf_svc::nvs::EspDefaultNvsPartition;
use esp_idf_svc::sys::EspError;
use esp_idf_svc::wifi::{
    AccessPointConfiguration, AuthMethod, BlockingWifi, Configuration, EspWifi,
};

const WIFI_SSID: &str = "cerveau-moteur-esp32";
const WIFI_PASSWORD: &str = "";
const WIFI_CHANNEL: u8 = 1;
const SERVER_STACK_SIZE: usize = 8192;

const INDEX_HTML: &str = include_str!("site/main.html");
const STYLE_CSS: &str = include_str!("site/style.css");
const SCRIPT_JS: &str = include_str!("site/script.js");

pub struct WifiServer {
    _wifi: BlockingWifi<EspWifi<'static>>,
    _server: EspHttpServer<'static>,
}

impl WifiServer {
    pub fn start(
        modem: Modem,
        sys_loop: EspSystemEventLoop,
        nvs: EspDefaultNvsPartition,
    ) -> Result<Self, EspError> {
        let mut wifi =
            BlockingWifi::wrap(EspWifi::new(modem, sys_loop.clone(), Some(nvs))?, sys_loop)?;

        let wifi_configuration = Configuration::AccessPoint(AccessPointConfiguration {
            ssid: WIFI_SSID.try_into().unwrap(),
            ssid_hidden: false,
            auth_method: AuthMethod::None,
            password: WIFI_PASSWORD.try_into().unwrap(),
            channel: WIFI_CHANNEL,
            max_connections: 4,
            ..Default::default()
        });

        wifi.set_configuration(&wifi_configuration)?;
        wifi.start()?;
        wifi.wait_netif_up()?;

        log::info!("AP prêt. SSID: `{}` | Ouvre http://192.168.71.1", WIFI_SSID);

        let mut server = EspHttpServer::new(&esp_idf_svc::http::server::Configuration {
            stack_size: SERVER_STACK_SIZE,
            ..Default::default()
        })
        .map_err(|e| e.0)?;

        register_routes(&mut server)?;

        Ok(Self {
            _wifi: wifi,
            _server: server,
        })
    }
}

```

C'est parti pour une autopsie complète. On va décortiquer chaque mot-clé et chaque concept. C'est dense, mais c'est là que tu vas vraiment passer de "celui qui copie du code" à "celui qui conçoit".

---

## 1. Les fondations : `Modem`, `Loop` et `NVS`

### `modem: Modem`

Le **Modem**, c'est l'objet qui représente physiquement l'antenne radio de ton ESP32.

* **Pourquoi le passer en paramètre ?** En Rust (particulièrement sur l'ESP32), les ressources matérielles sont "possédées". Tu ne peux pas créer deux antennes par magie. En passant le `Modem` à `start`, tu donnes au serveur le droit exclusif d'utiliser la radio.

### `EspSystemEventLoop` (Le standardiste)

C'est un gestionnaire d'événements. Le Wi-Fi est un processus asynchrone : "Je cherche le réseau", "Je suis connecté", "J'ai perdu le signal".

* **Son rôle :** Il reçoit ces signaux du matériel et les transmet à ton code.
* **Pourquoi `.take()` ?** C'est un **Singleton**. Il n'y en a qu'un seul pour tout le système. `.take()` signifie : "S'il est disponible, je le prends. Si quelqu'un d'autre l'a déjà pris, le programme plante (ou renvoie une erreur)".

### `EspDefaultNvsPartition` (La mémoire morte)

**NVS** signifie **Non-Volatile Storage**. C'est une partie de la mémoire Flash qui ne s'efface pas quand on coupe le courant.

* **Pourquoi le Wi-Fi en a besoin ?** L'ESP32 y stocke des données de calibration radio et des paramètres internes. Sans NVS, le Wi-Fi ne peut pas s'initialiser correctement.

---

## 2. Le Wi-Fi : `Wrap`, `Clone` et IP

### Pourquoi `BlockingWifi::wrap(...)` ?

La bibliothèque de base (`EspWifi`) est asynchrone (non-bloquante). Si tu lui dis "Connecte-toi", elle répond "OK, je commence" et passe à la ligne suivante immédiatement, même si tu n'es pas encore connecté.

* **`wrap`** transforme cela en mode "Bloquant". Le code s'arrête à `wifi.start()` jusqu'à ce que ce soit réellement fait. C'est beaucoup plus simple pour débuter.

### Pourquoi `sys_loop.clone()` ?

Le Wi-Fi a besoin d'écouter les événements, et le `BlockingWifi` aussi (pour savoir quand arrêter d'attendre). Comme ils ont tous les deux besoin du gestionnaire d'événements, on le "clone". En Rust `esp-idf`, cloner un `Handle` comme `sys_loop` ne copie pas tout le système, c'est juste comme donner une deuxième télécommande pour la même télévision.

### L'IP `192.168.71.1` et le DNS

* **Pourquoi cette IP ?** C'est l'adresse par défaut choisie par le framework `esp-idf-svc` pour le mode Access Point.
* **Peut-on mettre un nom (DNS) ?** Oui ! Ça s'appelle le **mDNS** (Multicast DNS). Tu pourrais configurer l'ESP32 pour qu'il réponde à `cerveau.local`. Cependant, cela demande une bibliothèque supplémentaire. Attention : sur Android, le `.local` est souvent mal supporté sans configuration.

---

## 3. Le Serveur : `Stack`, `Default` et `Mut`

### `stack_size: SERVER_STACK_SIZE`

Chaque programme (ou "Thread") a une **Stack** (une pile) : c'est un petit espace mémoire ultra-rapide pour les variables locales.

* Le serveur HTTP est gourmand car il manipule des chaînes de caractères (HTML, JSON).
* Si tu mets une valeur trop petite, l'ESP32 va "Crash" violemment (Stack Overflow). `8192` octets (8 Ko) est une valeur sûre pour un petit site.

### `..Default::default()`

C'est du sucre syntaxique Rust. Cela signifie : "Pour tous les autres réglages que je n'ai pas précisés (timeout, port, etc.), utilise les valeurs par défaut prévues par les créateurs de la bibliothèque". Cela évite d'écrire 50 lignes de configuration.

### Pourquoi `mut server` ?

On rend le serveur mutable car la fonction `register_routes` va **modifier** l'objet serveur pour lui ajouter des chemins (`/`, `/style.css`). Une fois que les routes sont enregistrées, le serveur "change d'état".

---

## 4. Architecture : Routes et WebSockets

### Ta structure `router.rs`

C'est une excellente idée. Dans un vrai projet :

* `wifi.rs` gère la connexion.
* `server.rs` initialise le `EspHttpServer`.
* `router.rs` contient une fonction `register_routes(server: &mut EspHttpServer)`.
C'est beaucoup plus propre.

### WebSockets et Routes

Les WebSockets sont différents du HTTP classique.

* **HTTP :** Le client demande, le serveur répond, la connexion se ferme.
* **WebSocket :** Le client demande une "promotion" de la connexion (Upgrade). Le tuyau reste ouvert dans les deux sens.

**Est-ce qu'on réutilise `register_routes` ?**
Non, généralement tu crées une route spécifique (ex: `/ws`) qui, au lieu de renvoyer du HTML, va "transformer" la connexion en WebSocket. Je te conseille effectivement un fichier `websocket_handler.rs` séparé, car la logique de gestion des messages (recevoir des ordres pour les moteurs en temps réel) est très différente de l'envoi d'un fichier CSS.

---

### Un détail technique : `map_err(|e| e.0)`

Tu te demandais peut-être pourquoi cette ligne bizarre ? Le serveur `esp-idf` renvoie parfois des types d'erreurs complexes. `e.0` permet d'extraire le code d'erreur brut pour qu'il soit compatible avec le type `EspError` attendu par ta fonction.

**Souhaites-tu que je te montre à quoi ressemblerait le fichier `router.rs` pour séparer proprement ton code ?**