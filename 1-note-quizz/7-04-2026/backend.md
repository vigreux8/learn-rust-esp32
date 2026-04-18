# Architecture en couches (Layered Architecture)

| Composant      | Préoccupation principale (Concern)      | Métaphore           |
| -------------- | --------------------------------------- | ------------------- |
| **DTO**        | La forme des données (le contrat)       | L’interface         |
| **Controller** | Les routes et les requêtes              | L’aiguilleur        |
| **Service**    | La logique métier et la base de données | Le cerveau          |
| **Module**     | L’organisation et les dépendances       | Le chef d’orchestre |

**Explications :**

- Le **DTO** (Data Transfer Object) permet de définir quelles données sont échangées à travers l’API (et donc d’éviter d’exposer toutes les colonnes de ta table). C’est l’équivalent d’une interface d’objet.
- Le **Module** regroupe les différents composants d’une même fonctionnalité/domain (service, contrôleur, DTO, etc.) et gère les dépendances entre eux.
- Le **Controller** reçoit les requêtes entrantes, appelle le bon service et retourne les réponses.

---

## Structure des dossiers dans `src` de ton backend

### 1. Le nom des dossiers : Modules (ou Resources)

Le dossier qui organise ton architecture s’appelle généralement une **Resource** ou un **Module**.

**Règle d’or 📦:**  
_Un dossier = Une entité métier_

- Si ton front-end a une page "Quiz", tu auras un dossier `quizz` dans `src`.
- Si tu as une page "Utilisateurs", tu auras un dossier `users`.

---

### 2. Le nommage des fichiers : le _kebab-case_

NestJS suit la convention stricte du **dot-notation** en kebab-case, c’est-à-dire :  
`nom-du-domaine.role.ts`

| Type de fichier | Convention            | Exemple pour un Quiz |
| --------------- | --------------------- | -------------------- |
| Module          | domaine.module.ts     | quizz.module.ts      |
| Controller      | domaine.controller.ts | quizz.controller.ts  |
| Service         | domaine.service.ts    | quizz.service.ts     |
| DTO             | nom-action.dto.ts     | create-quizz.dto.ts  |

---

### 3. Est-ce lié au nom des pages côté Frontend ?

- **Oui**, car ton API doit être intuitive.  
  _Ex : Si le front affiche des "Articles", le dossier backend doit s’appeler `articles` pour s’y retrouver._

- **Non**, car le backend gère les **données**, pas les vues.  
  _Ex : Une seule page “Tableau de Bord” (Dashboard) côté front peut faire appel à `users.service.ts`, `stats.service.ts` et `orders.service.ts` côté backend._

---

### 💡 Astuce pro

Pour t’aider dans le nommage et l’architecture, utilise la CLI Nest :

```bash
nest generate resource quizz
```

Cela créera le dossier et tous les fichiers nécessaires (`.module`, `.controller`, `.service`, `.dto`) avec les bons noms automagiquement !
