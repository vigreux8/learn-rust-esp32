# Architecture — frontend `projet_quizz`

## Technologies

| Couche                  | Choix                                                                        |
| ----------------------- | ---------------------------------------------------------------------------- |
| Framework UI            | **Preact** 10 (API React-compatible, bundle léger)                           |
| Routage                 | **preact-router** 4                                                          |
| Build                   | **Vite** 8, preset **@preact/preset-vite**                                   |
| Langage                 | **TypeScript** 5.9                                                           |
| Styles                  | **Tailwind CSS** 4 (plugin Vite `@tailwindcss/vite`)                         |
| Composants UI           | **DaisyUI** 5 (thème, formulaires, cartes, onglets)                          |
| Icônes                  | **lucide-preact**                                                            |
| Classes conditionnelles | **clsx** + **tailwind-merge** (helper `lib/cn.ts`)                           |
| Graphes (vue `/node`)   | **@xyflow/react** (React Flow 12) ; styles globaux importés dans `index.css` |

## Bibliothèques clés

- **@dnd-kit** (`@dnd-kit/react`, …) : listes et zones DnD (questions, sous-collections, réflexion).
- **@xyflow/react** : canvas graphe ; nœuds / arêtes / registry sous `composant/node/` ; montage du `<ReactFlow />` dans **`composant/page/NodeView/`** uniquement (pas dans `ui/`).

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
├── architecture.md              # ce document (racine frontend `projet_quizz/frontend/`)
└── src/
    ├── main.tsx                   # montage Preact sur le DOM
    ├── app.tsx                    # Router + garde d’auth appareil
    ├── index.css                  # styles globaux + couches Tailwind/DaisyUI + XYFlow
    ├── vite-env.d.ts
    ├── assets/                    # images / svg statiques
    ├── types/
    │   └── quizz.ts               # types TS alignés sur l’API quizz
    ├── lib/                       # logique non-UI — tableau détaillé § « lib/ »
    │   ├── api.ts
    │   ├── config.ts
    │   ├── cn.ts
    │   ├── routePathContext.tsx
    │   ├── userSession.tsx
    │   ├── lastQuizResult.ts
    │   ├── playOrder.ts
    │   ├── playSessionReflexionMix.ts
    │   ├── nodeViewGraphSession.ts              # session `sessionStorage` graphe `/node` + bloc `playUi` (options jeu)
    │   ├── useGraphSessionSyncedPlayOptions.ts  # hook : playMode / qtype / infini (et panneau si besoin) alignés sur `playUi`
    │   ├── useClosePanelOnDocumentClickOutside.ts
    │   ├── nodeViewGraphActionsContext.tsx
    │   ├── reactFlowDnD.ts
    │   ├── collectionHierarchyVis.ts
    │   ├── reflexionChainColors.ts
    │   ├── collectionAppJson.ts
    │   ├── appCollectionImportNormalize.ts
    │   ├── llmImportPrompts.ts
    │   ├── llmImportNormalize.ts
    │   ├── questionCreateLlmJson.ts
    │   └── questionCategories.ts
    └── composant/
        ├── node/                  # XYFlow (hors `ui/`) — registry, types, nœuds / arêtes / handles (`regle-implementation.md`)
        │   ├── regle-implementation.md
        │   ├── config/
        │   │   ├── flow.registry.ts        # `flowNodeTypes`, `flowEdgeTypes`
        │   │   └── flow.types.ts           # `AppNode`, `AppEdge`
        │   ├── costumeNode/
        │   │   ├── CollectionNode/         # drop sidebar, lien parent→enfant, `parts/` CollectionPanel · CreatorPanel
        │   │   ├── QuestionNode/           # nœud question (poignée drag vers collection)
        │   │   └── PersonalityNode/
        │   ├── costumeEdge/
        │   └── costumeHandle/
        ├── page/                  # écrans routés (`app.tsx`) — conventions `.tsx` / `.hook.ts` / `parts/` / `hooks/`
        │   ├── HomeView/
        │   │   └── hooks/useHomeDiscoveryPlayForm/
        │   ├── CollectionsView/
        │   │   ├── hooks/                 # useCollectionsBootstrap, useCollectionsListingUi, useCollectionsMutations, useCollectionsJsonImport
        │   │   └── parts/                 # ex. PopUpInformation, CreatePersonnaliteModal
        │   ├── QuestionsView/             # (+ `parts/`)
        │   ├── SousCollectionsView/         # (+ `hooks/`, `parts/`)
        │   ├── QuestionReflexionView/         # (+ `hooks/`, `parts/`)
        │   ├── QuizSessionView/           # (+ `hooks/`, `parts/`)
        │   ├── QuizResultsView/
        │   ├── StatsDashboard/            # (+ `hooks/`, `parts/`)
        │   ├── SessionDetailsView/
        │   ├── DatabaseTransferView/      # (+ `hooks/`)
        │   └── NodeView/                  # graphe XYFlow + sidebar ; session graphe + mode jeu
        │       ├── hooks/useNodeViewPlayMode/
        │       └── parts/
        │           ├── NodeViewPlayModePanel/
        │           ├── NodeViewLlmImportModal/
        │           └── GraphCreateNormaleCollectionModal/
        └── ui/
            ├── atomes/
            │   ├── AppFooter/
            │   ├── AppHeader/
            │   ├── Badge/
            │   ├── Button/
            │   ├── Card/
            │   ├── MarkdownViewer/
            │   ├── PageMain/
            │   ├── PlayModePicker/
            │   └── QuestionsLlmImportOptionsPanel/
            ├── molecules/
            │   ├── ActionImportLlm/
            │   ├── CollectionCard/              # `parts/SearchAssociateBlock/`
            │   ├── CollectionGroupEditModal/
            │   ├── DeviceAuthGate/              # `DeviceAuthGate.hook.ts`, `parts/` (welcome, pseudot, erreur, chargement)
            │   ├── QuestionsLlmImportPanel/
            │   ├── QuestionsLlmImportPromptPanel/
            │   ├── QuizzDndQuestionPanels/      # styles DnD partagés uniquement (`*.styles.ts`)
            │   └── QuizzQuestionDndRow/
            └── organismes/
                ├── FlowSidebarOverlay/       # vue `/node` : rail latéral + panneaux (collections, sous-arbre, questions, persos, création)
                │   └── parts/
                │       ├── SidebarRail/
                │       ├── CollectionFilterPanel/
                │       ├── QuestionListPanel/
                │       ├── PersonalityFilterPanel/
                │       └── CreationShortcutsPanel/
                ├── QuestionEditModal/
                └── QuestionsActionBoutons/
                    └── parts/                 # ex. `ActionExportCollectionJson/`
```

## Analogie avec `reglage_bouton/src`

Le frontend **réglage bouton** (`src/network/frontend/reglage_bouton/src/`) suit le même socle **Vite + Preact + Tailwind + DaisyUI** : `main.tsx` monte l’app, `app.tsx` concentre l’état et les écrans, un module dédié (`calibrationStore.ts`) isole la persistance locale et les calculs.

Ici le pattern est le même, mais **découpé davantage** :

- **`app.tsx`** : routage et enveloppe `DeviceAuthGate` + contexte de chemin.
- **`lib/*`** : équivalent élargi du « store » et des utilitaires (session utilisateur/appareil, résultats de quiz, **session graphe `/node` + options jeu `playUi`**, normalisation JSON d’import, etc.).
- **`composant/node/*`** : briques **XYFlow** (registre, types de nœuds/arêtes) ; **`composant/page/NodeView/`** assemble le canvas plein écran et **`composant/ui/organismes/FlowSidebarOverlay/`** (sans importer `node` depuis `ui/`).
- **`lib/nodeViewGraphActionsContext.tsx`** : contexte Preact utilisé depuis les nœuds (ex. drop question → déplacement entre collections) tout en gardant les appels API dans la page **`NodeView`**.

## Rôle des dossiers et fichiers

### Racine `src/`

- **`main.tsx`** : point d’entrée ; rend `<App />` dans le document.
- **`app.tsx`** : définition des routes (`/`, `/collections`, `/collections/:id/sous-collections`, `/node`, `/play/:collectionId`, `/dashboard`, `/database`, etc.) et fournisseurs (`RoutePathContext`, `DeviceAuthGate`).

### `composant/ui/atomes/`

Composants UI **sans import** d’un autre dossier `composant/ui/atomes/*` (feuilles de l’arbre local). Peuvent utiliser `lib/`, `types/`, Lucide, etc.

| Dossier                           | Rôle                                                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button/` / `Card/` / `Badge/`    | Briques de base (bouton, carte, pastille).                                                                                                              |
| `AppHeader/` / `AppFooter/`       | En-tête et pied de page communs.                                                                                                                        |
| `PageMain/`                       | Mise en page centrale des pages.                                                                                                                        |
| `PlayModePicker/`                 | Choix du mode de lecture (filtres, tri, KPI, suites réflexion, inclusion des **collections enfant** `relation_collection` via query `includeChildren`). État synchronisé côté pages via **`lib/useGraphSessionSyncedPlayOptions`** + **`nodeViewGraphSession`**. |
| `MarkdownViewer/`                 | Rendu Markdown léger pour intitulés de questions, réponses, sessions (tables, quiz, modales).                                                           |
| `QuestionsLlmImportOptionsPanel/` | Options de l’import LLM (sans atome projet dans ce dossier).                                                                                            |

### `composant/ui/molecules/`

Blocs composés qui **importent au moins un** composant sous `composant/ui/atomes/`.

| Dossier                          | Rôle                                                                                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `ActionImportLlm/`               | Bouton pour ouvrir ou refermer le panneau d’import LLM (partagé par plusieurs écrans / widgets LLM).                                    |
| `CollectionCard/`                | Carte d’une collection (aperçu, actions) ; `parts/SearchAssociateBlock/` pour le couple recherche + tag réservé à cette carte.          |
| `QuestionsLlmImportPanel/`       | Panneau regroupant options + prompt import LLM.                                                                                         |
| `QuestionsLlmImportPromptPanel/` | Zone prompt / JSON pour l’import LLM (partagée : panel import, modale question, widgets réflexion / sous-collections).                  |
| `CollectionGroupEditModal/`      | Formulaire titre / métadonnées d’un groupe de questions (liste groupes sous-collections, liste groupes réflexion).                      |
| `QuizzQuestionDndRow/`           | Ligne sortable ou draggable (`dnd-kit`) pour une question affichée en liste DnD ; logique dans `QuizzQuestionDndRow.hook.ts`.           |
| `QuizzDndQuestionPanels/`        | Pas de JSX public : fichier `QuizzDndQuestionPanels.styles.ts` commun aux zones DnD (réflexion, sous-collections).                      |
| `DeviceAuthGate/`                | Vérifie / enregistre l’appareil (MAC) avant l’app (`app.tsx`). Orchestration dans `DeviceAuthGate.hook.ts` ; sous-écrans dans `parts/`. |

Les morceaux **uniquement** utilisés par une page vivent sous `composant/page/<Nom>/parts/` (ex. `CollectionsView/parts/PopUpInformation`, `QuestionsView/parts/QuestionsTable`, `StatsDashboard/parts/KpiCard`, widgets réflexion / sous-collections). Les `parts/` des deux organismes restants suivent la même règle sous `composant/ui/organismes/<Nom>/parts/`.

### `composant/page/`

Écrans passés en `component={…}` sur une `Route` dans `app.tsx` : même conventions de fichiers que sous `ui/` (`.tsx`, `.types.ts`, `.hook.ts`, `parts/`, etc.). Importent `composant/ui/atomes|molecules|organismes` et `lib/`, **pas** l’inverse.

| Dossier                  | Rôle                                                                                                                                                                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HomeView/`              | Accueil et navigation ; formulaire « lancer une session » (`hooks/useHomeDiscoveryPlayForm/`) — options **`PlayModePicker`** alignées sur **`lib/useGraphSessionSyncedPlayOptions`** (même `playUi` que le graphe). |
| `CollectionsView/`       | Liste et gestion des collections (`CollectionsView.sections.tsx`, `parts/`) ; listing UI (`hooks/useCollectionsListingUi/`) partage les mêmes options jeu via **`lib/useGraphSessionSyncedPlayOptions`**. |
| `QuestionsView/`         | Liste / édition des questions (filtrage par collection). Sous-composants locaux : `parts/QuestionsTable`, `parts/QuestionsCollectionContextBar`.                                                                                                           |
| `SousCollectionsView/`   | Sous-collections (schéma **v4**) : grille, modale, DnD (`dnd-kit`).                                                                                                                                                                                        |
| `QuizSessionView/`       | Déroulé d’une partie (questions, réponses, progression) ; `parts/` (réponse cliquable, barre de progression).                                                                                                                                              |
| `QuizResultsView/`       | Résumé à la fin d’un quiz.                                                                                                                                                                                                                                 |
| `StatsDashboard/`        | Vue d’ensemble des statistiques / KPI.                                                                                                                                                                                                                     |
| `SessionDetailsView/`    | Détail d’une session de jeu.                                                                                                                                                                                                                               |
| `DatabaseTransferView/`  | Écran d’import / export de données (admin côté UI).                                                                                                                                                                                                        |
| `QuestionReflexionView/` | **Suite logique** (`/collections/:id/reflexion`) : chaîne ordonnée `question_reflexion`, DnD, import LLM, pastilles couleur (`COLLECTION_TREE_LEVEL_BORDER_HEX`, `groupe_questions.chain_color_levels`).                                                   |
| `NodeView/`              | Route **`/node`** : canvas **XYFlow** + **`FlowSidebarOverlay`** ; état dans `NodeView.hook.ts` ; **`hooks/useNodeViewPlayMode/`** + **`parts/NodeViewPlayModePanel/`** ; persistance **`lib/nodeViewGraphSession.ts`** (`playUi` + nœuds / viewport). |

### `composant/node/`

Couche **graphe** : tout ce qui concerne `@xyflow/react` **sans** vivre dans `composant/ui/`. Règles détaillées : **`composant/node/regle-implementation.md`**.

| Emplacement                      | Rôle                                                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `config/flow.registry.ts`        | Objet **`flowNodeTypes`** (ex. `collectionNode` → `CollectionNode`) et **`flowEdgeTypes`** (arêtes customs ; vide tant qu’aucune clé).                 |
| `config/flow.types.ts`           | Alias **`AppNode`**, **`AppEdge`** alignés sur les données des nœuds enregistrés.                                                                      |
| `costumeNode/<Nom>/`             | Composant de nœud custom (même discipline que le reste du frontend : `.tsx`, `.types.ts`, `.hook.ts`, `.styles.ts`, `.metier.ts`, `parts/` si besoin). |
| `costumeNode/CollectionNode/`    | Nœud collection : étiquettes / influenceurs (`parts/` CollectionPanel · CreatorPanel), lien parent ↔ enfant, drop sidebar (dont déplacement question). |
| `costumeNode/QuestionNode/`      | Carte courte question ; poignée **drag** (même payload MIME que la sidebar) vers un **CollectionNode**.                                                |
| `costumeNode/PersonalityNode/`   | Pastille influenceur pour le graphe `/node`.                                                                                                           |
| `costumeEdge/`, `costumeHandle/` | Réservés aux arêtes et handles réutilisables (peu peuplés tant que pas d’arête custom persistée hors hiérarchie).                                      |

### `composant/ui/organismes/`

Gros blocs **sans** route dédiée : modales et barres d’actions réutilisées par plusieurs pages.

| Dossier                   | Rôle                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FlowSidebarOverlay/`     | Overlay `/node` : rail (`SidebarRail`) + panneaux **collections** (`CollectionFilterPanel`), **branche sous-arbre**, **Questions par collection** (`QuestionListPanel`), **personnalités** (`PersonalityFilterPanel`), **création** (`CreationShortcutsPanel`). `FlowSidebarOverlay.hook.ts`, `parts/`. |
| `QuestionEditModal/`      | Modale d’édition ou de création d’une question (QCM).                                                                                                                                                                                                                                                   |
| `QuestionsActionBoutons/` | En-tête Questions : import / export JSON, LLM (`parts/` ex. `ActionExportCollectionJson/`).                                                                                                                                                                                                             |

### `lib/`

| Fichier                                                                      | Rôle                                                                                                                                                                 |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.ts`                                                                     | Fonctions fetch vers le backend (collections, questions, stats, admin, devices, déplacement question entre collections `/node`).                                     |
| `nodeViewGraphSession.ts`                                                    | Lecture / écriture **`sessionStorage`** du graphe `/node` (nœuds, arêtes, viewport, périmètre questions) et bloc **`playUi`** (mode de jeu, type de questions, infini, panneau). |
| `useGraphSessionSyncedPlayOptions.ts`                                        | Hook partagé : état **`playMode` / `playQtype` / `playInfinite`** (et panneau si `syncPanelExpanded`) persisté via `nodeViewGraphSession` — utilisé par accueil, collections, **`useNodeViewPlayMode`**. |
| `useClosePanelOnDocumentClickOutside.ts`                                     | Fermeture au clic extérieur (sidebar `/node`, panneau mode jeu).                                                                                                      |
| `reactFlowDnD.ts`                                                            | MIME `application/reactflow`, parsing charge utile HTML5 (**sidebar** ↔ **canvas** ↔ **drop sur nœud**).                                                             |
| `nodeViewGraphActionsContext.tsx`                                            | Contexte **Preact** : callbacks exposés par **`NodeView`** pour les **`costumeNode/`** sans coupler `page` ↔ `node` en imports circulaires.                          |
| `collectionHierarchyVis.ts`                                                  | Profondeur d’arbre collections, **palette hex** des bords de carte (`COLLECTION_TREE_LEVEL_BORDER_HEX`), réutilisée dans la vue réflexion pour taguer les vignettes. |
| `reflexionChainColors.ts`                                                    | Identifiants DnD des cibles « déposer une couleur sur une vignette » (`reflexion-color-target-{questionId}`).                                                        |
| `config.ts`                                                                  | URL d’API et constantes d’environnement côté client.                                                                                                                 |
| `cn.ts`                                                                      | Fusion de classes Tailwind (`clsx` + `tailwind-merge`).                                                                                                              |
| `routePathContext.tsx`                                                       | Contexte React/Preact exposant le chemin courant (pour liens actifs, etc.).                                                                                          |
| `userSession.tsx`                                                            | État et helpers de session utilisateur / appareil côté client.                                                                                                       |
| `lastQuizResult.ts`                                                          | Persistance locale du dernier résultat de quiz.                                                                                                                      |
| `playOrder.ts`                                                               | Ordre de lecture (aléatoire, séquentiel, etc.).                                                                                                                      |
| `playSessionReflexionMix.ts`                                                 | Mélange playlist session quand réflexion + questions classiques (`buildReflexionMixedPlaylist`).                                                                     |
| `collectionAppJson.ts`                                                       | Format JSON applicatif des collections (import/export côté client).                                                                                                  |
| `appCollectionImportNormalize.ts`                                            | Normalisation des données importées au format app.                                                                                                                   |
| `llmImportPrompts.ts` / `llmImportNormalize.ts` / `questionCreateLlmJson.ts` | Chaîne d’import « LLM » : prompts, normalisation, construction JSON.                                                                                                 |
| `questionCategories.ts`                                                      | Catégories ou labels pour classifier les questions.                                                                                                                  |

### `types/`

- **`quizz.ts`** : types des entités quiz (questions, réponses, collections) synchronisés avec les DTO / réponses API.

### `assets/`

Ressources statiques **importées** depuis le code sous `src/` (illustrations, logos). Le dossier peut rester vide (fichier `.gitkeep`) jusqu’à ajout d’assets réels.

## Règles à respecter Strictement

### dans arborecence

À appliquer à chaque composant sous `composant/ui/` (atomes, molécules, organismes) et sous `composant/page/` (écrans routés).

- **Un composant = un dossier** nommé comme le composant.
- **`NomComposant.tsx`** : JSX et câblage ; pas de logique métier.
- **`NomComposant.types.ts`** : composantProp et type partager
- **`NomComposant.hook.ts`** : état, effets et handlers, tout la logique de vue.
- **`NomComposant.metier.ts`** : règles / calculs sans dépendance UI.
- **`NomComposant.styles.ts`** : chaînes de classes Tailwind regroupées ici.
- **`NomComposant.utils.ts`** : calcule qui ne contient pas de code métier et indépendant de react
- **`index.ts`** : seul export public du dossier `export * from "./NomComposant"`

#### Sous-composants locaux : dossier `parts/`

- **Critère de placement** : un sous-composant est mis dans `NomComposant/parts/` **si et seulement si** il est utilisé **uniquement** par `NomComposant` (couplage exclusif aux types / au hook du parent, libellés ou props non réutilisables ailleurs).
- **À l’inverse** : si le sous-composant peut servir à un autre écran, il doit être placé dans `composant/ui/atomes/` ou `composant/ui/molecules/` selon la règle « importe-t-il un atome ? » (cf. sections plus haut), pas dans `parts/`.
- **Structure interne** : chaque entrée de `parts/` reste **un composant = un dossier** avec les mêmes fichiers (`.tsx`, `.types.ts`, `.hook.ts` si besoin, `.styles.ts`, `index.ts`).
- **Sens des dépendances** : les sous-composants de `parts/` peuvent importer des `composant/ui/atomes/` et des `composant/ui/molecules/` (souvent via chemins relatifs depuis le fichier courant). Ils n’importent **jamais** un autre organisme **ni** une autre page complète et ne sont **pas** importés depuis l’extérieur du dossier parent (le seul export public reste `index.ts` à la racine du composant).

```text
NomComposant/
├── index.ts
├── NomComposant.tsx
├── NomComposant.types.ts
├── NomComposant.hook.ts
├── NomComposant.metier.ts
├── NomComposant.styles.ts
└── parts/
    ├── NomComposantHeader/
    │   ├── index.ts
    │   ├── NomComposantHeader.tsx
    │   └── NomComposantHeader.types.ts
    └── NomComposantQuestionCard/
        ├── index.ts
        ├── NomComposantQuestionCard.tsx
        ├── NomComposantQuestionCard.types.ts
        └── NomComposantQuestionCard.styles.ts
```

### dans le placement du code dans les fichiers

#### tout les fichier

- **Lecture d’un fichier technique** :
  - **placement des functions :**
    - en haut les public (API du module),
    - en bas les fonctions internes privé
  - **placement des import :**
    - plus l'import et en bas plus il est spécifique au composant plus il est haut plus il est global

#### spécifique :

##### `NomComposant.types.ts`, `NomComposant.hook.ts`, `NomComposant.tsx`

- **Contrat de données (`.types.ts`)** :
  - Interdiction de créer des props "plates"
  - Centraliser les entrées dans une interface unique découpée en **sous-objets thématiques** (ex: `settings` pour la config, `data` pour le brut, `actions` pour les callbacks).
  - Cette structure sert de "contrat stable" entre le parent et l'enfant, facilitant la maintenance et la lecture.

- **Logique de vue (`.hook.ts`)** :
  - Extraire toute la complexité (états, effets, calculs) dans un hook dédié qui reçoit les props du composant.
  - **Organisation du retour** : Ne pas renvoyer une liste plate de variables. Regrouper les données et fonctions par **blocs fonctionnels** (ex: `formulaire`, `navigation`, `filtres`) correspondant aux sections logiques de l'interface.
  - **Hook orchestrateur** : quand le hook couvre plusieurs responsabilités distinctes (chargement, brouillons, modale, parcours…), il **doit** être découpé en plusieurs **sous-hooks dédiés**, chacun avec une responsabilité claire. Le `.hook.ts` racine devient alors un **orchestrateur** : il instancie les sous-hooks, leur passe ce dont ils ont besoin, et se contente d’assembler les **blocs fonctionnels** retournés au `.tsx`. Aucune logique métier ou d’effet ne reste dans l’orchestrateur lui-même.
  - **Emplacement des sous-hooks** : ils vivent dans un sous-dossier `NomComposant/hooks/`, **un sous-hook = un dossier** avec ses propres `.ts`, `.types.ts` et `.metier.ts` si besoin (mêmes règles que pour un composant). Ils sont **internes** au dossier parent et ne sont pas exportés vers l’extérieur via l’`index.ts` racine.
    exemple :

```text
NomComposant/
├── index.ts
├── NomComposant.tsx
├── NomComposant.types.ts
├── NomComposant.hook.ts          # orchestrateur : compose les sous-hooks et assemble les blocs renvoyés au .tsx
├── NomComposant.metier.ts
├── NomComposant.styles.ts
└── hooks/
    ├── useNomComposantLoad/
    │   ├── index.ts
    │   ├── useNomComposantLoad.ts
    │   ├── useNomComposantLoad.types.ts
    │   └── useNomComposantLoad.metier.ts
    └── useNomComposantEditModal/
        ├── index.ts
        ├── useNomComposantEditModal.ts
        ├── useNomComposantEditModal.types.ts
        └── useNomComposantEditModal.metier.ts
```

- **Rendu et Assemblage (`.tsx`)** :
  - Le fichier doit rester **purement déclaratif**.
  - Il se contente de déstructurer les blocs fournis par le hook et de les "brancher" sur le JSX. (**interdiction de faire une destructuration imbriqué**)
  - Aucun calcul complexe ou gestion d'état ne doit apparaître ici : si le JSX devient difficile à lire, c'est que la logique doit être mieux découpée dans le hook ou le métier.

#### Exemple de structure type (Ex: `UserProfile`)

**`UserProfile.types.ts`**

```ts
export type UserProfileProps = {
  settings: { theme: "dark" | "light"; editable: boolean };
  data: { user: User | null };
  actions: { onUpdate: (data: UserUpdate) => void };
  status: { loading: boolean; error: string | null };
};
```

**`UserProfile.hook.ts`**

```ts
export function useUserProfile(props: UserProfileProps) {
  const { data, actions } = props; // 1. Déstructuration des entrées
  // 2. interdiction d'une déstruction imbriqué !
  // ... logique, états internes ...

  return {
    // 2. Regroupement par blocs fonctionnels
    header: { name: data.user?.name, avatar: data.user?.img },
    form: { onSubmit: actions.onUpdate, isDirty },
  };
}
```

**`UserProfile.tsx`**

```ts
export function UserProfile(props: UserProfileProps) {
  const { settings, status } = props;
  const { header, form } = useUserProfile(props);

  if (status.loading) return <Loader />;
  return (
    <div class={settings.theme}>
      <HeaderSection data={header} />
      <FormSection logic={form} />
    </div>
  );
}
```

## Flux typique

1. L’utilisateur ouvre l’app → **`DeviceAuthGate`** s’assure qu’un appareil connu existe (sinon flux d’enregistrement).
2. **`HomeView`** ou les routes métier chargent les données via **`lib/api.ts`**.
3. Un parcours **jouer** : `QuizSessionView` → enregistrement KPI côté API → `QuizResultsView` avec appui sur **`lastQuizResult`** si besoin hors-ligne d’affichage.
4. Option **graphe** : route **`/node`** → **`NodeView`** + **`FlowSidebarOverlay`** ; nœuds / arêtes via **`composant/node/config/`** et **`costumeNode/`** ; actions partagées (ex. déplacer une question vers une collection) via **`lib/nodeViewGraphActionsContext.tsx`** depuis les nœuds vers le hook **`NodeView`** ; état graphe + **`playUi`** dans **`lib/nodeViewGraphSession.ts`**.
5. Options **mode de jeu** (filtres / tri, type de questions, infini) : **`lib/useGraphSessionSyncedPlayOptions`** les aligne entre **`HomeView`**, **`CollectionsView`** et le panneau **`NodeViewPlayModePanel`** (`/node`), via la même entrée **`sessionStorage`** que le graphe.

Pour la vue **matérielle / réseau globale** du dépôt, voir aussi [`architecture.md`](../../../architecture.md).
