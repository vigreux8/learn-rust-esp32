
# notion import module avec crate / super 

1. Pourquoi crate:: est effectivement plus "robuste"
Comme tu l'as noté, crate:: est une adresse statique.

Si tu déplaces le dossier servo dans hardware/servo, tous les use crate::servo::... à l'intérieur de tes fichiers resteront valides.

C'est très utile quand ton projet commence à avoir beaucoup de niveaux (des dossiers dans des dossiers).

2. Pourquoi super:: reste utile
On utilise généralement super:: ou le chemin relatif quand deux fichiers sont indissociables.

bus.rs et controller.rs sont comme les deux faces d'une même pièce. Il est très rare que tu déplaces bus.rs sans déplacer controller.rs juste à côté.

Dans ce cas, super:: montre que le lien est "intime".

3. La règle d'or pour ton organisation
Tu peux utiliser les deux, mais voici le conseil pour ne pas s'y perdre :

Utilise crate:: pour appeler des modules qui sont des "piliers" du projet (ex: un module de configuration, de logs, ou un module wifi) car ils ne bougeront probablement jamais de la racine.

Utilise super:: (ou le chemin relatif) pour les fichiers qui sont dans le même dossier que toi. Ça évite de réécrire tout le chemin GPS pour parler à ton voisin de palier.

# fichier mod.rs 

```rust
// On déclare les sous-modules
pub mod bus;
pub mod controller;

// On "ré-exporte" les types pour que l'utilisateur
// puisse faire `use crate::servo::ServoBus` ou `use super::servo::ServoBus`
pub use bus::ServoBus;

```
