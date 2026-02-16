# notion  bare-metal vs pas bare-meta : 
date : 16 Feb 2026 at 13:25
C'est une excellente question de "connaisseur". Tu touches à la grande division du monde Rust sur ESP32. Pour te répondre directement : **Non, `esp-hal` contient aussi les périphériques**, mais la philosophie est différente.

Voici le comparatif pour bien comprendre ce que tu appelles la "library métal".

### 1. `esp-idf-hal` (Ce que tu utilises actuellement)

C'est la couche **"Standard"** (avec `std`).

* **Fondation :** Elle repose sur le SDK C de d'Espressif (ESP-IDF).
* **Fonctionnement :** Quand tu appelles `LedcDriver`, en réalité, Rust appelle une fonction en langage C cachée derrière.
* **Peripherals :** Tu les récupères via `esp_idf_svc::hal::peripherals::Peripherals::take()`.

### 2. `esp-hal` (Le vrai "Bare Metal")

C'est la couche **"No-STD"**. On l'appelle souvent "Bare Metal" car il n'y a plus de C, plus de FreeRTOS (par défaut), juste du Rust pur qui parle directement aux registres du processeur.

* **Fondation :** Rien. C'est du Rust pur.
* **Peripherals :** Ils sont bien là ! Tu les récupères aussi avec un `Peripherals::take()`, mais ils viennent du module `esp_hal`.

---

### Pourquoi la confusion ?

Dans **`esp-hal`** (Bare Metal), on sépare très fortement :

1. **PAC (Peripheral Access Crate) :** C'est la couche "Métal" brute. Elle contient les adresses mémoires de chaque registre. C'est très dur à lire.
2. **HAL (Hardware Abstraction Layer) :** C'est `esp-hal`. Elle utilise le PAC pour te donner des objets sympas comme `Pwm`, `I2c`, etc.

### Comparaison des "Peripherals" :

| Caractéristique | `esp-idf-hal` (Ton code) | `esp-hal` (Bare Metal) |
| --- | --- | --- |
| **Philosophie** | "Je veux utiliser les services de l'ESP32" | "Je veux contrôler le silicium directement" |
| **Prise des périph** | `Peripherals::take()` | `peripherals::Peripherals::take()` |
| **OS** | FreeRTOS est obligatoire en dessous | Pas d'OS (tu es le seul maître à bord) |
| **Vitesse** | Très rapide | Encore plus rapide (zéro surcoût) |

---

### Alors, est-ce que `esp-hal` n'est qu'un "plan" ?

Non, c'est bien plus qu'un plan. C'est la bibliothèque qui **implémente** les drivers en Rust.

* **Si tu veux faire du Wi-Fi facilement, de l'affichage complexe et utiliser des bibliothèques Rust standards** : Reste sur **`esp-idf-hal`** (ce qu'on a fait pour tes servos).
* **Si tu veux faire un système ultra-critique, qui consomme le moins d'énergie possible, ou si tu n'as pas besoin de l'écosystème C d'Espressif** : Tu passes sur **`esp-hal`**.

**Attention :** Si tu décides de passer sur `esp-hal` (Bare Metal), ton code pour les servos va changer. On ne parle plus de `LedcDriver` de la même façon, car les structures de données ne sont pas les mêmes.

> **En résumé :** `esp-hal` n'est pas juste un plan, c'est l'outil ET le matériel, mais sans "l'assistant C" (ESP-IDF) pour t'aider.

**Est-ce que tu envisages de passer ton projet en "Bare Metal" (no_std) ou tu préfères rester sur la version confortable avec ESP-IDF ?**