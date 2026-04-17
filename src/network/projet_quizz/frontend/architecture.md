# Architecture — frontend `projet_quizz`

## Technologies

| Couche | Choix |
|--------|--------|
| Framework UI | **Preact** 10 (API React-compatible, bundle léger) |
| Routage | **preact-router** 4 |
| Build | **Vite** 8, preset **@preact/preset-vite** |
| Langage | **TypeScript** 5.9 |
| Styles | **Tailwind CSS** 4 (plugin Vite `@tailwindcss/vite`) |
| Composants UI | **DaisyUI** 5 (thème, formulaires, cartes, onglets) |
| Icônes | **lucide-preact** |
| Classes conditionnelles | **clsx** + **tailwind-merge** (helper `lib/cn.ts`) |

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
        ├── atomes/              # briques visuelles minimales
        ├── molecules/           # blocs réutilisables composés
        └── organismes/          # pages / écrans complets
```

## Analogie avec `reglage_bouton/src`

Le frontend **réglage bouton** (`src/network/frontend/reglage_bouton/src/`) suit le même socle **Vite + Preact + Tailwind + DaisyUI** : `main.tsx` monte l’app, `app.tsx` concentre l’état et les écrans, un module dédié (`calibrationStore.ts`) isole la persistance locale et les calculs.

Ici le pattern est le même, mais **découpé davantage** :

- **`app.tsx`** : routage et enveloppe `DeviceAuthGate` + contexte de chemin.
- **`lib/*`** : équivalent élargi du « store » et des utilitaires (session utilisateur/appareil, résultats de quiz, normalisation JSON d’import, etc.).
- **`composant/*`** : l’UI est structurée en **atomes / molécules / organismes** pour séparer briques, blocs et pages.

## Rôle des dossiers et fichiers

### Racine `src/`

- **`main.tsx`** : point d’entrée ; rend `<App />` dans le document.
- **`app.tsx`** : définition des routes (`/`, `/collections`, `/play/:collectionId`, `/dashboard`, `/database`, etc.) et fournisseurs (`RoutePathContext`, `DeviceAuthGate`).

### `composant/atomes/`

Composants visuels de bas niveau, sans logique métier lourde.

| Fichier | Rôle |
|---------|------|
| `Button.tsx` | Bouton stylé cohérent avec le thème. |
| `Card.tsx` | Conteneur carte (titres, corps). |
| `Badge.tsx` | Pastille / libellé court. |
| `ProgressBar.tsx` | Barre de progression (quiz, chargements). |

### `composant/molecules/`

Blocs réutilisables entre plusieurs pages.

| Fichier | Rôle |
|---------|------|
| `AppHeader.tsx` / `AppFooter.tsx` | En-tête et pied de page communs. |
| `PageMain.tsx` | Mise en page centrale des pages. |
| `CollectionCard.tsx` | Carte d’une collection (aperçu, actions). |
| `PlayModePicker.tsx` | Choix du mode de lecture (ordre des questions). |
| `AnswerOption.tsx` | Affichage / sélection d’une réponse pendant le jeu. |
| `QuestionEditModal.tsx` | Modale d’édition d’une question. |
| `KpiCard.tsx` | Carte indicateur pour le tableau de bord stats. |
| `PopUpInformation.tsx` | Boîte d’information / alerte légère. |
| `QuestionsLlmImport*.tsx` | Panneaux et options pour l’import assisté (prompts, options, JSON). |

### `composant/organismes/`

Pages ou écrans majeurs branchés sur le routeur.

| Fichier | Rôle |
|---------|------|
| `DeviceAuthGate.tsx` | Vérifie / enregistre l’appareil (MAC) avant d’afficher l’app ; bloque ou guide l’utilisateur. |
| `HomeView.tsx` | Accueil et navigation vers collections, jeu, stats. |
| `CollectionsView.tsx` | Liste et gestion des collections. |
| `QuestionsView.tsx` | Liste / édition des questions (filtrage par collection). |
| `QuestionsTable.tsx` | Table détaillée des questions (tri, actions). |
| `QuestionsCollectionContextBar.tsx` | Barre de contexte (collection courante, raccourcis). |
| `QuestionsLlmImportCard.tsx` | Carte dédiée au flux d’import type LLM. |
| `QuizSessionView.tsx` | Déroulé d’une partie (questions, réponses, progression). |
| `QuizResultsView.tsx` | Résumé à la fin d’un quiz. |
| `StatsDashboard.tsx` | Vue d’ensemble des statistiques / KPI. |
| `SessionDetailsView.tsx` | Détail d’une session de jeu. |
| `DatabaseTransferView.tsx` | Écran d’import / export de données (admin côté UI). |

### `lib/`

| Fichier | Rôle |
|---------|------|
| `api.ts` | Fonctions fetch vers le backend (collections, questions, stats, admin, devices). |
| `config.ts` | URL d’API et constantes d’environnement côté client. |
| `cn.ts` | Fusion de classes Tailwind (`clsx` + `tailwind-merge`). |
| `routePathContext.tsx` | Contexte React/Preact exposant le chemin courant (pour liens actifs, etc.). |
| `userSession.tsx` | État et helpers de session utilisateur / appareil côté client. |
| `lastQuizResult.ts` | Persistance locale du dernier résultat de quiz. |
| `playOrder.ts` | Ordre de lecture (aléatoire, séquentiel, etc.). |
| `collectionAppJson.ts` | Format JSON applicatif des collections (import/export côté client). |
| `appCollectionImportNormalize.ts` | Normalisation des données importées au format app. |
| `llmImportPrompts.ts` / `llmImportNormalize.ts` / `questionCreateLlmJson.ts` | Chaîne d’import « LLM » : prompts, normalisation, construction JSON. |
| `questionCategories.ts` | Catégories ou labels pour classifier les questions. |

### `types/`

- **`quizz.ts`** : types des entités quiz (questions, réponses, collections) synchronisés avec les DTO / réponses API.

### `assets/`

Ressources statiques servies par Vite (illustrations, logos).

## Flux typique

1. L’utilisateur ouvre l’app → **`DeviceAuthGate`** s’assure qu’un appareil connu existe (sinon flux d’enregistrement).
2. **`HomeView`** ou les routes métier chargent les données via **`lib/api.ts`**.
3. Un parcours **jouer** : `QuizSessionView` → enregistrement KPI côté API → `QuizResultsView` avec appui sur **`lastQuizResult`** si besoin hors-ligne d’affichage.

Pour la vue **matérielle / réseau globale** du dépôt, voir aussi [`architecture.md`](../../../architecture.md).
