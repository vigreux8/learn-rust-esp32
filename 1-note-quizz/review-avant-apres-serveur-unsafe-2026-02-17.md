# Date: 2026-02-17 12:37:02 CET

## Objectif
Supprimer les usages `unsafe` dans `src/wifi/serveur.rs` sans changer le comportement fonctionnel (routes HTTP/WS, parsing des commandes, pilotage servo).

## Avant (etat initial)
- `WifiServer` et `MotorControllers` utilisaient des lifetimes generiques (`'a`).
- Le serveur HTTP etait cree avec `EspHttpServer::new_nonstatic(...)`.
- La route `POST /api/servo` etait enregistree avec `fn_handler_nonstatic(...)`.
- Deux blocs `unsafe` existaient dans `src/wifi/serveur.rs`.
- La declaration et la documentation etaient coherentes avec un mode non-`'static`.

## Apres (etat actuel)
- `WifiServer` est maintenant `EspHttpServer<'static>`.
- Les controles moteurs transportes dans les handlers sont `ServoController<'static>`.
- Le serveur HTTP est cree avec `EspHttpServer::new(...)` (safe).
- La route `POST /api/servo` utilise `fn_handler(...)` (safe).
- Tous les `unsafe` ont ete retires de `src/`.
- Les routes statiques ont ete factorisees dans une boucle pour reduire la duplication.
- `architecture.md` a ete mis a jour pour decrire le mode safe actuel.

## Raisons techniques des changements
- `new_nonstatic`/`fn_handler_nonstatic` demandent `unsafe` car la validite des captures de closure ne peut pas etre prouvee par le compilateur sur la duree de vie du serveur C.
- En passant le serveur et les donnees capturees en `'static`, on donne une garantie claire: les donnees vivent au moins aussi longtemps que le serveur.
- `Arc<Mutex<...>>` reste le bon choix pour partager les moteurs entre handlers HTTP/WS de facon thread-safe.
- La factorisation des routes diminue le risque d'erreur de copier-coller et simplifie la maintenance.

## Erreur de compilation rencontree et correction
- Erreur: `E0283 type annotations needed` sur le handler `/api/servo`.
- Cause: inference incomplete du type d'erreur du `Result` dans la closure.
- Correction: ajout de la signature explicite:
  - `move |mut req| -> Result<(), EspIOError> { ... }`

## Fichiers modifies
- `src/wifi/serveur.rs`
- `architecture.md`

## Tips pour avoir le meme reflexe
1. Cherche d'abord les points rouges: `unsafe`, `*_nonstatic`, `transmute`, `raw pointers`.
2. Demande-toi: "est-ce que cet objet doit vraiment vivre tout le programme ?"
3. Si oui, privilegie `'static` + possession claire (move, Arc) plutot que contourner le compilateur.
4. Traite d'abord la securite memoire, ensuite seulement la refacto de style.
5. Apres chaque modif de signature de closure, anticipe une erreur d'inference et annote le `Result` explicitement.
6. Garde la doc d'architecture synchronisee avec le code pour eviter les faux diagnostics plus tard.

## Checklist rapide reutilisable
- [ ] Ai-je encore un `unsafe` evitable ?
- [ ] Les donnees capturees par les handlers vivent-elles assez longtemps ?
- [ ] Les partages inter-threads passent-ils par `Arc<Mutex<_>>` (ou equivalent adapte) ?
- [ ] Les types de retour des closures critiques sont-ils explicites si besoin ?
- [ ] La doc projet decrit-elle bien l'etat reel du code ?
