# servomoteur

Firmware ESP32 (Rust + esp-idf-svc) pour piloter des servomoteurs via Wi‑Fi (AP), WebSocket et HTTP.

## Avant de compiler le firmware

Le binaire Rust embarque le front Vite via `include_str!` sur `src/network/site_compiled/`. Regénère ce dossier après chaque modification du front :

```bash
cd src/network/frontend && npm install && npm run build
```

Puis compile depuis la racine du dépôt.

## Compiler

```bash
cargo build --release
```

## Flasher la carte et ouvrir le moniteur série

La cible est déjà configurée dans [`.cargo/config.toml`](.cargo/config.toml) (`runner = "espflash flash --monitor"`). La méthode la plus simple :

```bash
ESPFLASH_BAUD=921600 cargo run --release
```

(Le binaire est construit puis envoyé sur l’ESP ; le moniteur série reste ouvert après le flash.)

Sans passer par `cargo run`, après un `cargo build --release` :

```bash
espflash flash target/xtensa-esp32-espidf/release/servomoteur --monitor
```

### Port série

Si plusieurs périphériques USB sont branchés, précise le port :

```bash
espflash flash target/xtensa-esp32-espidf/release/servomoteur --port /dev/tty.usbserial-* --monitor
```

Sous Windows, utilise par exemple `COM3` à la place de `/dev/tty...`.

### Vitesse de flash

Tu peux augmenter le débit (ex. `921600`) pour accélérer le flash, ou le laisser par défaut si la connexion est instable :

```bash
espflash flash target/xtensa-esp32-espidf/release/servomoteur --baud 921600 --monitor
```

## Raccourci utile

| Objectif               | Commande (depuis la racine du repo)                                             |
| ---------------------- | ------------------------------------------------------------------------------- |
| Build front + firmware | `cd src/network/frontend && npm run build && cd ../.. && cargo build --release` |
| Flasher + moniteur     | `cargo run --release`                                                           |

Plus de détail sur l’architecture : voir [`architecture.md`](architecture.md).
