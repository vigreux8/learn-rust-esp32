# Usure de la Flash de l'ESP32

_Date : 18 Fév 2026, 17:17_

---

## 1. La distinction fondamentale

Il est **crucial** de ne pas confondre les deux types de mémoire car leur comportement face à l'usure est totalement opposé :

<div style="display: flex; gap: 2rem; flex-wrap: wrap;">
  
<div style="min-width:260px">
  
**🧠 RAM (SRAM)**  
- **Rôle :** Mémoire de travail “nerveuse”
- **Usure :** **Aucune**  
  Tu peux écrire dedans des milliards de fois par seconde.
- **Persistance :**  
  ➔ Tout s’efface quand tu coupes le courant.

</div>

<div style="min-width:260px">

**💾 Flash (Mémoire interne)**

- **Rôle :** Stockage “physique”
- **Usure :** **Réelle**  
  Environ **100 000 cycles d’écriture**.  
  Une boucle d’écriture répétée peut la tuer **en quelques heures**.
- **Persistance :**
  ➔ Les données restent même sans courant.

</div>
</div>

> **Un cycle = avoir parcouru toute la mémoire**  
> Exemple sur l’ESP32 : 1 cycle = 4 Mo  
> Exemple carte SD 8 Go : 1 cycle = 8 000 Mo

---

## 2. Le rôle de la Carte SD

En ajoutant une **carte SD** à ton projet Rust, tu transformes la gestion mémoire de ton ESP32 :

- **Protection**  
  → Tu déplaces l’usure de la Flash interne vers la carte SD. Si la SD meurt, tu la changes pour 5 €.
- **Utilisation de la Flash**  
  → Elle ne sert plus qu’à stocker ton programme (le binaire).  
  Elle ne s’use que lorsque tu “flash” le code depuis ton PC.

---

## 3. Pourquoi SQLite sur SD est le choix idéal ?

Pour ton projet de Quizz, utiliser **SQLite** sur ta carte SD est la solution la plus robuste :

- **Moins d’usure** : SQLite écrit intelligemment, limite le nombre de cycles.
- **Sécurité des données** : En cas de coupure d’alimentation, SQLite protège tes fichiers contre la corruption (contrairement au JSON classique).
- **Performance** :  
  Tu **n’as pas besoin de charger tout ton Quizz en RAM** ; SQLite ne va lire sur la SD **que la question nécessaire**.

---

## 4. Ta stratégie “Zéro Risque”

Voici le **plan validé** pour tes paramètres (Lumières, Scores…) :

1. **Au démarrage :**  
   L’ESP32 lit la config sur la **carte SD** et la copie dans une variable en **RAM**.
2. **Pendant le jeu :**  
   Tes variables (ex : `score +=1`) ne vivent qu’en **RAM** → **Aucune usure**.
3. **Sauvegarde :**  
   Tu n’écris sur la **carte SD** (base SQLite) que lors d’évènements-clés (fin de partie, clic sur “enregistrer”…)
4. **Résultat :**  
   Ton ESP32 **reste comme neuf pendant des décennies**.

---

## 🔑 En résumé

> **La RAM ne s’use JAMAIS.**  
> Le seul danger vient de l’écriture répétitive sur la Flash.  
> Grâce à la **carte SD + SQLite** et à la gestion des états en **RAM**, tu obtiens un système indestructible et pro.

💬 **Veux-tu que je t’aide à configurer la partie Rust pour que ton programme puisse lire ce premier fichier SQLite sur ta carte SD ?**

---

---

# L’avantage de SQLite et comment ne pas saturer la RAM de l’ESP32 🧩

La beauté de **SQLite** : il a été inventé pour **justement éviter la saturation de RAM** sur les petits systèmes.

- **Si tu utilisais un gros fichier JSON** :  
  Lecture difficile, chaque question demande de charger, parser des kilo-octets → la RAM se remplit vite.
- **Avec SQLite** :  
  Tu as plusieurs protections contre la surcharge :

---

### 1️⃣ Le “Lazy Loading” (Chargement à la demande)

- Contrairement à une liste Rust `Vec<Question>` (en RAM), SQLite **laisse les données sur la SD**.
- Quand tu fais une requête `SELECT`, SQLite ouvre une mini “fenêtre” sur le fichier.
  - Il **ne sort de la SD que la ligne spécifique** demandée.
  - Une fois la question affichée, la RAM est libérée aussitôt.

---

### 2️⃣ Le contrôle du cache

- En Rust (avec la crate `rusqlite`), tu peux régler la taille du cache.
- Sur ESP32, on le met **très bas** →  
  SQLite n’utilise qu’une poignée de ko, même si la base sur la SD pèse plusieurs Mo.

---

### 3️⃣ La consommation fixe

En pratique, l’occupation de la RAM ressemble à :

| Usage                           | Taille typique          |
| ------------------------------- | ----------------------- |
| Stack/Heap de base (Rust+Wi-Fi) | 50–100 Ko               |
| Moteur SQLite                   | 20–40 Ko                |
| Une question de Quizz           | ~1 Ko (négligeable)     |
| **Total RAM utilisée**          | **≈ 150 Ko sur 520 Ko** |
| Reste disponible                | **> 300 Ko libres**     |

> ✅ **Marge de sécurité énorme** pour WebSockets & autres fonctions.

---

### ⚠️ Le seul vrai risque de surcharge : les “jointures” géantes

- Risque = faire une requête qui sort 5 000 lignes d’un coup (« SELECT \* FROM toutes_les_reponses_de_tous_les_utilisateurs »).
- **En Rust :**  
  On évite de tout charger dans un `Vec`. **On utilise un itérateur** :
  - Lire la ligne 1 → Traiter → Effacer de la RAM.
  - Lire la ligne 2 → Traiter → Etc.

---

### 🟢 En résumé

Non, tu **ne satureras pas la RAM** si tu laisses SQLite travailler normalement.  
C’est justement pour ces situations que SQLite est plus pertinent que le JSON.

💡 **Veux-tu que je t’explique comment configurer SQLite en Rust en mode “Low Memory” ?**

---

# Les vrais risques en utilisant une carte SD

## 3. Les vrais “tueurs” de cartes SD

Une carte SD sur ESP32 **meurt rarement d’usure**. Les vrais dangers sont :

- **Coupures d’alimentation** :  
  Si l’ESP32 s’éteint pendant un transfert, le contrôleur interne peut rendre la carte illisible.
- **Cartes de mauvaise qualité (contrefaçons)** :  
  Les SD à 3 € n’ont pas de vrai contrôleur de nivellement d’usure.
- **Humidité/Oxydation** :  
  Sur les contacts en cuivre.

---

## 4. Comment la faire durer “éternellement” ?

- Achète **une carte de marque** (Sandisk, Samsung, Kingston…)
- Prends une **High Endurance** (celles prévues pour Dashcam)
- Utilise **SQLite en mode WAL** (“Write-Ahead Logging” : cela réduit le nombre d’écritures physiques)
- **Ne retire jamais la carte SD si l’ESP32 est allumé !**

---

# Piste à creuser :

**Commandes SQLite (PRAGMA), c’est quoi ?**
