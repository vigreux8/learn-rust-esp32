# Date: 2026-02-17 16:48:47 CET

## Pourquoi j'ai ajoute ces lignes dans `build.rs`

Code ajoute:

```rust
fn main() {
    println!("cargo::rustc-check-cfg=cfg(esp_idf_comp_mdns_enabled)");
    println!("cargo::rustc-check-cfg=cfg(esp_idf_comp_espressif__mdns_enabled)");
    embuild::espidf::sysenv::output();
}
```

Objectif:
- Dire a `rustc` que ces noms de `cfg` sont attendus et valides.
- Supprimer les warnings `unexpected cfg condition name`.

Contexte:
- Le code mDNS utilise des `#[cfg(...)]` specifiques ESP-IDF.
- Rust (check-cfg) n'en connait pas la liste par defaut.
- Sans declaration explicite, Rust compile quand meme mais emet des warnings.

## Ce que chaque ligne veut dire

- `println!("cargo::rustc-check-cfg=cfg(...)")`
  - Envoie une directive a Cargo/rustc pendant la build.
  - Enregistre un nom de `cfg` comme autorise.

- `embuild::espidf::sysenv::output();`
  - Conserve la logique deja necessaire pour preparer l'environnement ESP-IDF.
  - Ne pas retirer dans ce projet.

## Intuition: comment savoir quand faire ca

Tu peux utiliser ce reflexe:

1. Tu vois un warning `unexpected cfg condition name`.
2. Le `cfg` vient d'un ecosysteme externe (ici ESP-IDF), pas d'un `feature` Cargo local.
3. Le code est volontairement conditionnel (pour compiler avec ou sans composant).
4. Action propre:
   - ajouter `cargo::rustc-check-cfg=cfg(...)` dans `build.rs`,
   - garder le `#[cfg(...)]` en place.

## Regle pratique rapide

- Si warning = `unexpected cfg ...`:
  - `feature = "..."` -> gere dans `Cargo.toml`.
  - `cfg(...)` externe/outillage -> declare via `build.rs` avec `rustc-check-cfg`.

## Bonus: pourquoi c'est mieux que supprimer les `cfg`

- Supprimer les `cfg` casserait la compatibilite selon les builds ESP-IDF.
- Les garder + declarer check-cfg donne:
  - code portable entre variantes de build,
  - logs propres sans bruit inutile.
