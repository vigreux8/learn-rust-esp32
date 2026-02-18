
# Notion : Modem, jetons et *trait* en Rust

---

Quand tu utilises la méthode `split()`, tu **divises réellement** l'accès au matériel, au niveau du compilateur. C'est littéralement le Graal de la sécurité matérielle en Rust.

---

### Pourquoi `split()` est-il la solution parfaite ?

Le matériel **Modem** est comme une grosse boîte noire. En appelant `.split()`, tu obtiens **deux jetons** (handles) distincts :

- **WifiModem** : Accès uniquement aux registres WiFi  
- **BluetoothModem** : Accès uniquement aux registres Bluetooth

> ⬆️ C’est ainsi que tu satisfais le **vérificateur d’emprunt** ("Borrow Checker") de Rust, tout en gardant deux fichiers/services séparés.

<small><i>Date : 18 février 2026 — 12:34</i></small>

```rust
use esp_idf_hal::modem::Modem;
use esp_idf_svc::wifi::EspWifi;
// use esp_idf_svc::bt::EspBle; // Selon ta version de crate

pub enum RadioMode {
    WifiOnly,
    BleOnly,
    WifiAndBle,
}

pub fn init(
    mode: RadioMode,
    modem: Modem,
    sys_loop: EspSystemEventLoop,
    nvs: Option<EspDefaultNvsPartition>,
) -> Result<(Option<EspWifi<'static>>, Option<EspBle<'static>>), EspError> {
    // On split systématiquement pour préparer le terrain
    let (wifi_modem, bt_modem) = modem.split();

    match mode {
        RadioMode::WifiOnly => {
            // On délègue à services/wifi.rs en passant le jeton spécifique
            let wifi = wifi::create_driver(wifi_modem, sys_loop, nvs)?;
            Ok((Some(wifi), None))
        }
        RadioMode::BleOnly => {
            // On délègue à services/ble.rs
            let ble = ble::create_driver(bt_modem)?;
            Ok((None, Some(ble)))
        }
        RadioMode::WifiAndBle => {
            let wifi = wifi::create_driver(wifi_modem, sys_loop, nvs)?;
            let ble = ble::create_driver(bt_modem)?;
            Ok((Some(wifi), Some(ble)))
        }
    }
}
```

---

## Pourquoi est-ce une bonne solution ?

- **Type-safe** : Le compilateur Rust t’empêchera d’écrire `EspBle::new(modem)` dans le cas WifiAndBle, car le modem aura déjà été déplacé dans le EspWifi.
- **Abstraction** : Ton `NetworkManager` appelle juste `radio::init`. Peu importe si le BLE a besoin du modem ou non.
- **Flexibilité** : Si tu veux désactiver le Wi-Fi pour économiser la batterie et ne garder que le BLE, tu changes juste une ligne dans ton `main` : **tout le reste du code s’adapte automatiquement**.

---

## À savoir

⚠️ **L’ESP32 n’a qu’une seule antenne** !  
Si tu utilises le Wi-Fi et le Bluetooth en même temps, ils vont se "partager" le temps d’antenne très rapidement (**coexistence**).

**Utiliser `split()`** est la meilleure façon d’aider l’ESP32 à gérer proprement ce partage, côté logiciel.

---

## Comment ça marche ?

1. **Que fait `modem.split()` exactement ?**

> Le `Modem` est un **jeton global** qui prouve : "j’ai le droit d’utiliser la radio de la puce".

Quand tu fais :

```rust
let (wifi_modem, bt_modem) = modem.split();
```

Tu obtiens **2 jetons spécialisés** :

- **WifiModem** : droit d’initialiser / piloter le WiFi
- **BluetoothModem** : droit d’initialiser / piloter le Bluetooth

> Après `split()`, le modem original est _consommé_ (il n’existe plus), car il a été découpé en deux "enfants".

2. **Donner le modem à `EspWifi::new(modem, ...)` "tue" le BLE ?**

> Non : rien n’est "tué" matériellement, c’est juste Rust.
>
> - Si tu donnes le Modem global au Wi-Fi, il est déplacé (moved) → tu ne peux plus l’utiliser pour BLE.
> - Donc tu ne peux plus créer ensuite un BLE qui demanderait aussi le Modem global.
>
> C’est _ça_ que tu vois comme "il tue le jeton BLE" : en réalité tu n’as jamais créé `bt_modem`, donc pas de jeton BLE à disposition.

---

## Quand utiliser ce pattern "split token" ?

- Quand tu as **une ressource unique**
- Quand tu veux **empêcher l’utilisation simultanée**
- Quand tu veux que le **compilateur garantisse l’ordre d’initialisation**

Typique :
- Périphériques hardware
- Accès exclusif
- Transition d’état (NonInit → Init)

---

## Si je fournis le modem, comment sait-il qu’il doit utiliser les fonctions *wifi* ?

Parce que `EspWifi::new()` ne prend pas forcément un `WifiModem` : il prend un **type générique** qui “fait l’affaire”.

En gros, l’API fonctionne comme ça :

- Si tu lui donnes un `Modem`, il sait extraire la partie WiFi (grâce aux **traits** requis)
- Si tu lui donnes un `WifiModem`, ça marche aussi
- Si tu lui donnes un `BluetoothModem`, **ça ne compile pas**

Le mécanisme Rust derrière tout ça : **traits** + **generics**.

Conceptuellement, la signature ressemble à :

```rust
fn new<M: WifiModemPeripheral>(modem: M, ...) -> EspWifi
```

---

## Le concept de *trait* en Rust

Pour vraiment comprendre ce qui se passe avec `Modem`, `WifiModem`, ou `EspWifi::new(...)`, il faut saisir les **traits** en Rust.

---

### Un *trait*, c’est quoi ?

Un trait en Rust, c’est **un contrat**.  
Il dit :

> “Tout type qui implémente ce trait doit fournir ces fonctions.”

**Exemple :**

```rust
trait Animal {
    fn speak(&self);
}
```

Ça ne crée rien, ça **définit juste une règle**.

#### Implémenter un trait

```rust
struct Dog;

impl Animal for Dog {
    fn speak(&self) {
        println!("Woof");
    }
}
```

Maintenant `Dog` **respecte le contrat** `Animal`.

---

### Pourquoi c’est important ?

Parce que tu peux écrire une fonction générique :

```rust
fn make_it_speak<T: Animal>(animal: T) {
    animal.speak();
}
```

Ça veut dire :  
> “Peu importe le type précis, tant qu’il implémente `Animal`.”

---

### Retour à notre modem

Imaginons la signature réelle :

```rust
fn new<M: WifiModemPeripheral>(modem: M, ...) -> EspWifi
```

Ça veut dire :

- "Je prends n’importe quel type M, tant qu’il implémente le trait WifiModemPeripheral."

Donc :

- `Modem` implémente `WifiModemPeripheral`
- `WifiModem` implémente aussi `WifiModemPeripheral`
- **Mais** : `BluetoothModem` ne l’implémente PAS ⇒ refusé à la compilation

---

### Ce qu’apportent les traits ici

- D’accepter **plusieurs types** différents
- Sans héritage
- Sans classe parente
- Sans casting
- **Et surtout** : tout est vérifié à la compilation !
