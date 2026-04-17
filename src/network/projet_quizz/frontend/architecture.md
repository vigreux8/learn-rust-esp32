# Architecture — frontend `projet_quizz`

## Technologies

| Couche                  | Choix                                                |
| ----------------------- | ---------------------------------------------------- |
| Framework UI            | **Preact** 10 (API React-compatible, bundle léger)   |
| Routage                 | **preact-router** 4                                  |
| Build                   | **Vite** 8, preset **@preact/preset-vite**           |
| Langage                 | **TypeScript** 5.9                                   |
| Styles                  | **Tailwind CSS** 4 (plugin Vite `@tailwindcss/vite`) |
| Composants UI           | **DaisyUI** 5 (thème, formulaires, cartes, onglets)  |
| Icônes                  | **lucide-preact**                                    |
| Classes conditionnelles | **clsx** + **tailwind-merge** (helper `lib/cn.ts`)   |

Les appels HTTP vers l’API Nest se font depuis `lib/api.ts` (URL de base configurable via `lib/config.ts`).

## Arborescence (`frontend/`)

```text
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── doc/                         # notes produit / wireframes (hors runtime)
│   ├── userstory.md
│   └── wireframe.md
└── src/
    ├── main.tsx                 # montage Preact sur le DOM
    ├── app.tsx                  # Router + garde d’auth appareil
    ├── index.css                # styles globaux + couches Tailwind/DaisyUI
    ├── vite-env.d.ts
    ├── assets/                  # images / svg statiques
    ├── types/
    │   └── quizz.ts             # types TS alignés sur l’API quizz
    ├── lib/                     # logique non-UI (API, session, import LLM, etc.)
    └── composant/
        ├── atomes/              # briques visuelles minimales (dossier par composant)
        │   ├── Badge/
        │   ├── Button/
        │   ├── Card/
        │   └── ProgressBar/
        ├── molecules/           # blocs réutilisables composés (dossier par composant)
        │   ├── AnswerOption/
        │   ├── AppFooter/
        │   ├── AppHeader/
        │   ├── CollectionCard/
        │   ├── KpiCard/
        │   ├── PageMain/
        │   ├── PlayModePicker/
        │   ├── PopUpInformation/
        │   ├── QuestionEditModal/
        │   ├── QuestionsLlmImportOptionsPanel/
        │   ├── QuestionsLlmImportPanel/
        │   └── QuestionsLlmImportPromptPanel/
        └── organismes/          # pages / écrans complets (dossier par composant)
            ├── CollectionsView/
            ├── DatabaseTransferView/
            ├── DeviceAuthGate/
            ├── HomeView/
            ├── QuestionsCollectionContextBar/
            ├── QuestionsLlmImportCard/
            ├── QuestionsTable/
            ├── QuestionsView/
            ├── QuizResultsView/
            ├── QuizSessionView/
            ├── SessionDetailsView/
            └── StatsDashboard/
```

## Analogie avec `reglage_bouton/src`

Le frontend **réglage bouton** (`src/network/frontend/reglage_bouton/src/`) suit le même socle **Vite + Preact + Tailwind + DaisyUI** : `main.tsx` monte l’app, `app.tsx` concentre l’état et les écrans, un module dédié (`calibrationStore.ts`) isole la persistance locale et les calculs.

Ici le pattern est le même, mais **découpé davantage** :

- **`app.tsx`** : routage et enveloppe `DeviceAuthGate` + contexte de chemin.
- **`lib/*`** : équivalent élargi du « store » et des utilitaires (session utilisateur/appareil, résultats de quiz, normalisation JSON d’import, etc.).
- **`composant/*`** : l’UI est structurée en **atomes / molécules / organismes**. Chaque composant possède son propre dossier contenant son code (`.tsx`), ses styles Tailwind (`.styles.ts`), sa logique métier éventuelle (`.metier.ts`) et un point d’entrée (`index.ts`).

## Rôle des dossiers et fichiers

### Racine `src/`

- **`main.tsx`** : point d’entrée ; rend `<App />` dans le document.
- **`app.tsx`** : définition des routes (`/`, `/collections`, `/play/:collectionId`, `/dashboard`, `/database`, etc.) et fournisseurs (`RoutePathContext`, `DeviceAuthGate`).

### `composant/atomes/`

Composants visuels de bas niveau, sans logique métier lourde. Chaque composant est isolé dans son dossier.

| Dossier        | Rôle                                      |
| -------------- | ----------------------------------------- |
| `Button/`      | Bouton stylé cohérent avec le thème.      |
| `Card/`        | Conteneur carte (titres, corps).          |
| `Badge/`       | Pastille / libellé court.                 |
| `ProgressBar/` | Barre de progression (quiz, chargements). |

### `composant/molecules/`

Blocs réutilisables entre plusieurs pages, structurés en dossiers.

| Dossier                     | Rôle                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| `AppHeader/` / `AppFooter/` | En-tête et pied de page communs.                                    |
| `PageMain/`                 | Mise en page centrale des pages.                                    |
| `CollectionCard/`           | Carte d’une collection (aperçu, actions).                           |
| `PlayModePicker/`           | Choix du mode de lecture (ordre des questions).                     |
| `AnswerOption/`             | Affichage / sélection d’une réponse pendant le jeu.                 |
| `QuestionEditModal/`        | Modale d’édition d’une question.                                    |
| `KpiCard/`                  | Carte indicateur pour le tableau de bord stats.                     |
| `PopUpInformation/`         | Boîte d’information / alerte légère.                                |
| `QuestionsLlmImport*/`      | Panneaux et options pour l’import assisté (prompts, options, JSON). |

### `composant/organismes/`

Pages ou écrans majeurs branchés sur le routeur, structurés en dossiers.

| Dossier                          | Rôle                                                          |
| -------------------------------- | ------------------------------------------------------------- |
| `DeviceAuthGate/`                | Vérifie / enregistre l’appareil (MAC) avant d’afficher l’app. |
| `HomeView/`                      | Accueil et navigation vers collections, jeu, stats.           |
| `CollectionsView/`               | Liste et gestion des collections (découpé en sections).       |
| `QuestionsView/`                 | Liste / édition des questions (filtrage par collection).      |
| `QuestionsTable/`                | Table détaillée des questions (tri, actions).                 |
| `QuestionsCollectionContextBar/` | Barre de contexte (collection courante, raccourcis).          |
| `QuestionsLlmImportCard/`        | Carte dédiée au flux d’import type LLM.                       |
| `QuizSessionView/`               | Déroulé d’une partie (questions, réponses, progression).      |
| `QuizResultsView/`               | Résumé à la fin d’un quiz.                                    |
| `StatsDashboard/`                | Vue d’ensemble des statistiques / KPI.                        |
| `SessionDetailsView/`            | Détail d’une session de jeu.                                  |
| `DatabaseTransferView/`          | Écran d’import / export de données (admin côté UI).           |

### `lib/`

| Fichier                                                                      | Rôle                                                                             |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `api.ts`                                                                     | Fonctions fetch vers le backend (collections, questions, stats, admin, devices). |
| `config.ts`                                                                  | URL d’API et constantes d’environnement côté client.                             |
| `cn.ts`                                                                      | Fusion de classes Tailwind (`clsx` + `tailwind-merge`).                          |
| `routePathContext.tsx`                                                       | Contexte React/Preact exposant le chemin courant (pour liens actifs, etc.).      |
| `userSession.tsx`                                                            | État et helpers de session utilisateur / appareil côté client.                   |
| `lastQuizResult.ts`                                                          | Persistance locale du dernier résultat de quiz.                                  |
| `playOrder.ts`                                                               | Ordre de lecture (aléatoire, séquentiel, etc.).                                  |
| `collectionAppJson.ts`                                                       | Format JSON applicatif des collections (import/export côté client).              |
| `appCollectionImportNormalize.ts`                                            | Normalisation des données importées au format app.                               |
| `llmImportPrompts.ts` / `llmImportNormalize.ts` / `questionCreateLlmJson.ts` | Chaîne d’import « LLM » : prompts, normalisation, construction JSON.             |
| `questionCategories.ts`                                                      | Catégories ou labels pour classifier les questions.                              |

### `types/`

- **`quizz.ts`** : types des entités quiz (questions, réponses, collections) synchronisés avec les DTO / réponses API.

### `assets/`

Ressources statiques servies par Vite (illustrations, logos).

## Flux typique

1. L’utilisateur ouvre l’app → **`DeviceAuthGate`** s’assure qu’un appareil connu existe (sinon flux d’enregistrement).
2. **`HomeView`** ou les routes métier chargent les données via **`lib/api.ts`**.
3. Un parcours **jouer** : `QuizSessionView` → enregistrement KPI côté API → `QuizResultsView` avec appui sur **`lastQuizResult`** si besoin hors-ligne d’affichage.

Pour la vue **matérielle / réseau globale** du dépôt, voir aussi [`architecture.md`](../../../architecture.md).
