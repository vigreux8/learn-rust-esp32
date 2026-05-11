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

## library important :

dnd-kit

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
        └── ui/                    # périmètre UI : atomes, molécules, organismes (imports hors `ui/` : préfixe `composant/ui/...`)
            ├── atomes/            # composants UI sans import d’un autre atome du projet (dossier par composant)
            │   ├── AppFooter/
            │   ├── AppHeader/
            │   ├── Badge/
            │   ├── Button/
            │   ├── Card/
            │   ├── MarkdownViewer/
            │   ├── PageMain/
            │   ├── PlayModePicker/
            │   └── QuestionsLlmImportOptionsPanel/
            ├── molecules/         # blocs composés important au moins un atome local (dossier par composant) — liste exhaustive ci-dessous
            │   ├── ActionImportLlm/
            │   ├── CollectionCard/               # `parts/SearchAssociateBlock/` + `CollectionCard.hook.ts`
            │   ├── CollectionGroupEditModal/
            │   ├── DeviceAuthGate/              # flux appareil : `DeviceAuthGate.hook.ts` + `parts/` (welcome, pseudot, erreur API, chargement)
            │   ├── QuestionsLlmImportPanel/
            │   ├── QuestionsLlmImportPromptPanel/
            │   ├── QuizzDndQuestionPanels/       # uniquement `QuizzDndQuestionPanels.styles.ts` (styles DnD partagés)
            │   └── QuizzQuestionDndRow/
            └── organismes/        # pages / écrans complets (dossier par composant) — ordre = racine réelle du dépôt
                ├── CollectionsView/
                ├── DatabaseTransferView/
                ├── HomeView/
                ├── QuestionEditModal/
                ├── QuestionReflexionView/
                ├── QuestionsActionBoutons/
                ├── QuestionsView/
                ├── QuizResultsView/
                ├── QuizSessionView/
                ├── SessionDetailsView/
                ├── SousCollectionsView/
                └── StatsDashboard/
```

## Analogie avec `reglage_bouton/src`

Le frontend **réglage bouton** (`src/network/frontend/reglage_bouton/src/`) suit le même socle **Vite + Preact + Tailwind + DaisyUI** : `main.tsx` monte l’app, `app.tsx` concentre l’état et les écrans, un module dédié (`calibrationStore.ts`) isole la persistance locale et les calculs.

Ici le pattern est le même, mais **découpé davantage** :

- **`app.tsx`** : routage et enveloppe `DeviceAuthGate` + contexte de chemin.
- **`lib/*`** : équivalent élargi du « store » et des utilitaires (session utilisateur/appareil, résultats de quiz, normalisation JSON d’import, etc.).

## Rôle des dossiers et fichiers

### Racine `src/`

- **`main.tsx`** : point d’entrée ; rend `<App />` dans le document.
- **`app.tsx`** : définition des routes (`/`, `/collections`, `/collections/:id/sous-collections`, `/play/:collectionId`, `/dashboard`, `/database`, etc.) et fournisseurs (`RoutePathContext`, `DeviceAuthGate`).

### `composant/ui/atomes/`

Composants UI **sans import** d’un autre dossier `composant/ui/atomes/*` (feuilles de l’arbre local). Peuvent utiliser `lib/`, `types/`, Lucide, etc.

| Dossier                           | Rôle                                                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button/` / `Card/` / `Badge/`    | Briques de base (bouton, carte, pastille).                                                                                                              |
| `AppHeader/` / `AppFooter/`       | En-tête et pied de page communs.                                                                                                                        |
| `PageMain/`                       | Mise en page centrale des pages.                                                                                                                        |
| `PlayModePicker/`                 | Choix du mode de lecture (filtres, tri, KPI, suites réflexion, inclusion des **collections enfant** `relation_collection` via query `includeChildren`). |
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

Les morceaux **uniquement** utilisés par un organisme vivent sous `composant/ui/organismes/<Nom>/parts/` (ex. `QuestionsActionBoutons/parts/ActionExportCollectionJson`, `StatsDashboard/parts/KpiCard`, `CollectionsView/parts/PopUpInformation`, `QuestionsView/parts/QuestionsTable`, `QuestionsView/parts/QuestionsCollectionContextBar`, widgets réflexion / sous-collections).

### `composant/ui/organismes/`

Pages ou écrans majeurs branchés sur le routeur, structurés en dossiers.

| Dossier                   | Rôle                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HomeView/`               | Accueil et navigation vers collections, jeu, stats.                                                                                                                                                                                                                                                                                   |
| `CollectionsView/`        | Liste et gestion des collections (découpé en sections) ; sous-composants locaux dans `parts/` (ex. modale « nouvelle personnalité »).                                                                                                                                                                                                 |
| `QuestionEditModal/`      | Modale d’édition ou de création d’une question (QCM).                                                                                                                                                                                                                                                                                 |
| `QuestionsView/`          | Liste / édition des questions (filtrage par collection). Sous-composants locaux : `parts/QuestionsTable`, `parts/QuestionsCollectionContextBar`.                                                                                                                                                                                      |
| `SousCollectionsView/`    | Sous-collections (schéma **v4** : collections **enfants** via `relation-collection` + doubles liens `question_collection` parent/enfant) : grille, modale, DnD (`dnd-kit`).                                                                                                                                                           |
| `QuestionsActionBoutons/` | En-tête Questions : actions export / import LLM + panneau.                                                                                                                                                                                                                                                                            |
| `QuizSessionView/`        | Déroulé d’une partie (questions, réponses, progression) ; morceaux réservés au quiz dans `parts/` (réponse cliquable, barre de progression).                                                                                                                                                                                          |
| `QuizResultsView/`        | Résumé à la fin d’un quiz.                                                                                                                                                                                                                                                                                                            |
| `StatsDashboard/`         | Vue d’ensemble des statistiques / KPI.                                                                                                                                                                                                                                                                                                |
| `SessionDetailsView/`     | Détail d’une session de jeu.                                                                                                                                                                                                                                                                                                          |
| `DatabaseTransferView/`   | Écran d’import / export de données (admin côté UI).                                                                                                                                                                                                                                                                                   |
| `QuestionReflexionView/`  | **Suite logique** (`/collections/:id/reflexion`) : chaîne ordonnée `question_reflexion` par `groupe_questions`, deux colonnes DnD (`dnd-kit`), import LLM optionnel, **pastilles couleur** (palette = `COLLECTION_TREE_LEVEL_BORDER_HEX` dans `collectionHierarchyVis.ts`, persistées en JSON `groupe_questions.chain_color_levels`). |

### `lib/`

| Fichier                                                                      | Rôle                                                                                                                                                                 |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.ts`                                                                     | Fonctions fetch vers le backend (collections, questions, stats, admin, devices).                                                                                     |
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

À appliquer à chaque composant sous `composant/ui/` (atomes, molécules, organismes).

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
- **Sens des dépendances** : les sous-composants de `parts/` peuvent importer des `composant/ui/atomes/` et des `composant/ui/molecules/` (souvent via chemins relatifs depuis le fichier courant). Ils n’importent **jamais** un autre organisme et ne sont **pas** importés depuis l’extérieur du dossier parent (le seul export public reste `index.ts` à la racine de l’organisme).

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

Pour la vue **matérielle / réseau globale** du dépôt, voir aussi [`architecture.md`](../../../architecture.md).
