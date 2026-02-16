# résumer  de se que j'ai appris :
date : 16 Feb 2026 at 17:21
Voici ton **Guide de Survie Rust sur ESP32**. Ce document récapitule nos échanges, tes découvertes et les pièges que nous avons désamorcés ensemble.

---

## I. Le Matériel : Fréquence, Bits et PWM

Une confusion courante au début est de mélanger la "vitesse" du signal et le "mode" de la puce.

### 1. High Speed vs Low Speed

* **L'erreur :** Croire que "50 Hz" (lent) impose le mode "Low Speed".
* **La réalité :** Ces modes désignent la manière dont l'ESP32 gère le matériel.
* **High Speed :** Le matériel gère la synchronisation (précis, pas de CPU).
* **Low Speed :** Le logiciel déclenche les changements (plus universel sur tous les modèles ESP32).


* **Le choix :** C'est le **Timer** que tu choisis qui impose le mode.

### 2. C'est quoi le "Duty" ?

Imagine un cycle de **20 ms** (notre 50 Hz). Le "Duty", c'est le temps où le courant est **ON** à l'intérieur de ces 20 ms.

* **1 ms ON (5%) :** Vitesse max sens A.
* **1.5 ms ON (7.5%) :** Arrêt (Point mort).
* **2 ms ON (10%) :** Vitesse max sens B.

### 3. Pourquoi 14 bits (16 384 parts) ?

C'est ta "résolution". Pour l'ESP32, 20 ms ne sont pas du temps, mais une règle graduée.

* **Bits14** =  graduations.
* Si tu veux 1 ms ON, tu calcules : . C'est la valeur que tu envoies au "Duty".

---

## II. Le "Bâtiment" Peripherals et les Badges (Traits)

C'est la partie la plus abstraite du langage. Voici comment visualiser l'accès au matériel.

### 1. L'analogie du Coffre-Fort

* **`Peripherals::take()` :** Tu ouvres le bâtiment ESP32. Tu possèdes maintenant toutes les clés.
* **Le Trait `Peripheral` :** C'est un **badge d'accès**. Pour utiliser un Timer ou une Pin, Rust ne veut pas juste le nom de l'objet, il veut que tu lui présentes le badge officiel qui prouve que tu es le seul propriétaire de ce morceau de métal.

### 2. Décoder `impl Peripheral<P = T> + 'a`

* **`impl Peripheral` :** "Je veux un badge d'accès matériel."
* **`<P = T>` :** "Ce badge doit ouvrir la salle **P** qui correspond au type **T** (ex: Timer0) que j'ai choisi."
* **`+ 'a` :** "Ce badge ne doit pas expirer tant que j'utilise l'objet."

### 3. Pourquoi `P = T` et pas juste `T` ?

Parce que `T` est le nom que **tu** as choisi (externe), et `P` est l'étiquette gravée par les créateurs de la bibliothèque (interne). Le signe `=` fait le pont entre les deux.

---

## III. La Syntaxe Rust : Le "Passe-Plat" et les Tiroirs

Tu as eu des difficultés avec les fonctions génériques. Voici la règle d'or :

### 1. Le lien entre les types

* **L'erreur :** Écrire `channel: impl Peripheral<P = impl LedcChannel>`. Cela crée deux types différents sans lien.
* **La solution :** Écrire `channel: impl Peripheral<P = C>` avec une clause `where C: LedcChannel`. Cela force Rust à vérifier que l'argument que tu donnes est **exactement** le même type que celui défini dans tes règles.

### 2. Les accolades `{ timer }`

C'est le rangement dans les "tiroirs" de ta structure (`struct`).

* Si ta variable s'appelle `timer` et que ton champ dans la structure s'appelle aussi `timer`, tu peux écrire `Self { timer }` au lieu de `Self { timer: timer }`. C'est un raccourci de rangement.

---

## IV. La Gestion d'Erreurs : Le "Siège Éjectable"

Pourquoi `Result` et pas `Option` ?

* **`Option` (Some/None) :** On l'utilise si quelque chose est "absent" (ex: un utilisateur introuvable).
* **`Result` (Ok/Err) :** On l'utilise quand ça "casse" (ex: Timer déjà utilisé).
* **Le `?` (Point d'interrogation) :** C'est le siège éjectable. Si la fonction appelée renvoie une erreur, le `?` arrête tout et renvoie l'erreur au chef (le `main`).
* **`EspError` :** C'est le dictionnaire des erreurs de l'ESP32. Il explique **pourquoi** ça a raté (ex: `ESP_ERR_INVALID_STATE`).

---

## V. Le cas particulier : Servo 360° (Rotation Continue)

* **Le problème :** Ton servo tourne à l'infini ou "dérive" (ne revient jamais au même endroit).
* **L'explication :** Contrairement au servo 180°, le 360° ne connaît pas sa position. Le PWM contrôle sa **vitesse**.
* **Le "Drift" :** À cause des frottements et de l'électronique imprécise, le "point mort" n'est jamais parfaitement à 1.5 ms. Il faut souvent calibrer manuellement (ex: 1.48 ms au lieu de 1.50 ms) pour qu'il s'arrête vraiment.

---

### Memento des réflexes à avoir :

1. **Où trouver le type ?** Si tu ne sais pas quel trait utiliser (ex: `LedcTimer`), regarde ce que demande la fonction `new` du Driver que tu veux utiliser.
2. **L'IDE souligne en rouge ?** C'est souvent que tu as passé un "badge" (`Peripheral`) pour une salle (GPIO) alors que la fonction attendait une autre salle (Timer).
3. **Le moteur grogne ?** Tes valeurs de Duty (min/max) sont trop extrêmes. Rapproche-toi du point mort (1.5 ms) pour tester.

---

**Souhaites-tu que je transforme une partie de ce résumé en un exemple de code commenté qui utilise toutes ces notions à la fois ?** Concrètement, on pourrait coder cette fameuse fonction de calibration du point mort !