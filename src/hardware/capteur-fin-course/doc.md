a savoir : tout comme le hardware servo je dois pouvoir selectionner le GPIO au niveaux du main

## branchement adapter :

### 🔌 Branchement: C + NO

**Schéma de branchement :**

- **C** → **GND** (ESP32)
- **NO** → **GPIO** (en entrée)

---

**Dans ton code :**

- Active le **pull-up interne** (`INPUT_PULLUP`)

---

**Logique de fonctionnement :**

| État du bouton       | Circuit        | Lecture GPIO | Niveau logique |
| -------------------- | -------------- | ------------ | :------------: |
| _Repos (pas appuyé)_ | Ouvert         | HIGH         |      TRUE      |
| _Appuyé_             | Fermé vers GND | LOW          |     FALSE      |

- **Repos** : le pin est tiré vers le +3.3V interne ⇒ **HIGH** (= TRUE)
- **Appuyé** : le circuit ferme vers la masse (GND) ⇒ **LOW** (= FALSE)
