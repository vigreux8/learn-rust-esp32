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

## library important  : 
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
        ├── atomes/              # composants UI sans import d’autre atome du projet (dossier par composant)
        │   ├── AnswerOption/
        │   ├── AppFooter/
        │   ├── AppHeader/
        │   ├── Badge/
        │   ├── Button/
        │   ├── Card/
        │   ├── PageMain/
        │   ├── PlayModePicker/
        │   ├── ProgressBar/
        │   ├── QuestionsCollectionContextBar/
        │   └── QuestionsLlmImportOptionsPanel/
        ├── molecules/           # blocs composés important au moins un atome local (dossier par composant)
        │   ├── ActionExportCollectionJson/
        │   ├── ActionImportLlm/
        │   ├── CollectionCard/
        │   ├── DeviceAuthGate/
        │   ├── KpiCard/
        │   ├── PopUpInformation/
        │   ├── QuestionsLlmImportPanel/
        │   ├── QuestionsLlmImportPromptPanel/
        │   └── QuestionsTable/
        └── organismes/          # pages / écrans complets (dossier par composant)
            ├── CollectionsView/
            ├── DatabaseTransferView/
            ├── HomeView/
            ├── QuestionEditModal/
            ├── QuestionsActionBoutons/
            ├── QuestionsView/
            ├── SousCollectionsView/
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

## Rôle des dossiers et fichiers

### Racine `src/`

- **`main.tsx`** : point d’entrée ; rend `<App />` dans le document.
- **`app.tsx`** : définition des routes (`/`, `/collections`, `/collections/:id/sous-collections`, `/play/:collectionId`, `/dashboard`, `/database`, etc.) et fournisseurs (`RoutePathContext`, `DeviceAuthGate`).

### `composant/atomes/`

Composants UI **sans import** d’un autre dossier `atomes/*` (feuilles de l’arbre local). Peuvent utiliser `lib/`, `types/`, Lucide, etc.

| Dossier                          | Rôle                                                                |
| -------------------------------- | ------------------------------------------------------------------- |
| `Button/` / `Card/` / `Badge/`   | Briques de base (bouton, carte, pastille).                          |
| `ProgressBar/`                   | Barre de progression (quiz, chargements).                           |
| `AppHeader/` / `AppFooter/`      | En-tête et pied de page communs.                                    |
| `PageMain/`                      | Mise en page centrale des pages.                                    |
| `PlayModePicker/`                | Choix du mode de lecture (ordre des questions).                     |
| `AnswerOption/`                  | Affichage / sélection d’une réponse pendant le jeu.                 |
| `QuestionsCollectionContextBar/` | Barre de contexte collection / import LLM sur l’écran questions.  |
| `QuestionsLlmImportOptionsPanel/` | Options de l’import LLM (sans atome projet dans ce dossier).     |

### `composant/molecules/`

Blocs composés qui **importent au moins un** composant sous `atomes/`.

| Dossier                     | Rôle                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| `ActionExportCollectionJson/` | Bouton d’export JSON d’une collection (état chargement / erreur). |
| `ActionImportLlm/`          | Bouton pour ouvrir ou refermer le panneau d’import LLM.              |
| `CollectionCard/`           | Carte d’une collection (aperçu, actions).                           |
| `KpiCard/`                  | Carte indicateur pour le tableau de bord stats.                     |
| `PopUpInformation/`         | Boîte d’information / alerte légère.                                |
| `QuestionsLlmImportPanel/`  | Panneau regroupant options + prompt import LLM.                     |
| `QuestionsLlmImportPromptPanel/` | Zone prompt / JSON pour l’import LLM.                            |
| `DeviceAuthGate/`           | Vérifie / enregistre l’appareil (MAC) avant l’app (`app.tsx`).       |
| `QuestionsTable/`          | Table détaillée des questions (tri, actions).                       |

### `composant/organismes/`

Pages ou écrans majeurs branchés sur le routeur, structurés en dossiers.

| Dossier                          | Rôle                                                          |
| -------------------------------- | ------------------------------------------------------------- |
| `HomeView/`                      | Accueil et navigation vers collections, jeu, stats.           |
| `CollectionsView/`               | Liste et gestion des collections (découpé en sections).       |
| `QuestionEditModal/`             | Modale d’édition ou de création d’une question (QCM).         |
| `QuestionsView/`                 | Liste / édition des questions (filtrage par collection).      |
| `SousCollectionsView/`           | Sous-collections d’une collection : grille, modale création, drag-and-drop des questions (`dnd-kit`). |
| `QuestionsActionBoutons/`        | En-tête Questions : actions export / import LLM + panneau.   |
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

## Règles à respecter Strictement

### dans arborecence

À appliquer à chaque composant sous `composant/` (atomes, molécules, organismes).

- **Un composant = un dossier** nommé comme le composant.
- **`NomComposant.tsx`** : JSX et câblage ; pas de logique métier.
- **`NomComposant.types.ts`** : composantProp et type partager
- **`NomComposant.hook.ts`** : état, effets et handlers, tout la logique de vue.
- **`NomComposant.metier.ts`** : règles / calculs sans dépendance UI.
- **`NomComposant.styles.ts`** : chaînes de classes Tailwind regroupées ici.
- **`NomComposant.utils.ts`** : calcule qui ne contient pas de code métier et indépendant de react
- **`index.ts`** : seul export public du dossier `export * from "./NomComposant"`

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
