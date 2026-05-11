# Audit : `composant/page/` vs `composant/ui/organismes/`

**État** : migration effectuée — les écrans routés vivent sous `composant/page/` ; seuls `QuestionEditModal` et `QuestionsActionBoutons` restent dans `composant/ui/organismes/`. Route `/node` + page `NodeView/` pour le futur canvas XYFlow.

Le dossier `composant/page/` **sépare** une **entrée de route** (`app.tsx` → `<Route component={…} />`) des **organismes embarqués** (modale, bandeau d’actions).

Référence routage actuel : `src/app.tsx`.

---

## Critères de classement

| Critère | Aller dans **`page/`** | Rester dans **`organismes/`** |
|--------|-------------------------|--------------------------------|
| Lien avec l’URL | Monté **directement** par le routeur comme `component` d’une `Route` | **Jamais** passé à `Route` ; importé par une page ou un autre organisme |
| Rôle | Écran racine d’un parcours (layout + données + sections) | Bloc métier **réutilisable** ou **couplé** à un écran parent (toolbar, modale) |
| Imports typiques depuis | `app.tsx` (et tests du parcours) | `page/*`, d’autres `organismes/*`, parfois `molecules/*` |

Les **atomes / molécules** ne bougent pas : `page/` ne remplace pas `ui/`, il **pointe** vers des écrans qui composent souvent des organismes.

---

## Inventaire des dossiers sous `organismes/`

| Dossier | Utilisé comme `Route` dans `app.tsx` ? | Consommation | Recommandation |
|---------|----------------------------------------|----------------|----------------|
| `HomeView` | Oui (`/`) | — | **`page/`** |
| `CollectionsView` | Oui (`/collections`) | — | **`page/`** |
| `SousCollectionsView` | Oui (`/collections/:id/sous-collections`) | — | **`page/`** |
| `QuestionReflexionView` | Oui (`/collections/:id/reflexion`) | — | **`page/`** |
| `QuestionsView` | Oui (`/questions`, `/questions/:collectionId`) | — | **`page/`** |
| `DatabaseTransferView` | Oui (`/database`) | — | **`page/`** |
| `StatsDashboard` | Oui (`/dashboard`) | — | **`page/`** |
| `SessionDetailsView` | Oui (`/dashboard/session/:sessionId`) | — | **`page/`** |
| `QuizSessionView` | Oui (`/play/:collectionId`) | — | **`page/`** |
| `QuizResultsView` | Oui (`/results`) | — | **`page/`** |
| `QuestionsActionBoutons` | Non | `QuestionsView` uniquement | **`organismes/`** (barre d’actions locale à l’écran Questions) |
| `QuestionEditModal` | Non | `QuestionsView`, `QuizSessionView`, `QuestionReflexionView` | **`organismes/`** (modale partagée multi-parcours) |

**Synthèse** : **10** composants sont de vraies **pages** au sens routeur ; **2** sont des organismes **sans route dédiée**.

---

## Arborescence cible suggérée pour `page/`

Même discipline de fichiers que dans [`architecture.md`](../../architecture.md) (`.tsx`, `.types.ts`, `.hook.ts`, `parts/`, etc.) :

```text
src/composant/page/
├── audit-pages-vs-organismes.md   # ce document
├── HomePage/                      # ex- HomeView — nom « Page » optionnel mais explicite
├── CollectionsPage/
├── ...
└── index.ts                       # optionnel : réexport des pages pour app.tsx
```

Tu peux soit **renommer** `*View` → `*Page` pour clarifier le rôle, soit **déplacer** le dossier en gardant le nom `HomeView` sous `page/HomeView/` : l’important est la **limite** routeur vs embarqué, pas le suffixe du nom.

---

## Imports après migration (schéma)

- `app.tsx` : `import { HomeView } from "./composant/page/HomeView"` (ou `HomePage`).
- `QuestionsView` (sous `page/`) : continue d’importer `QuestionsActionBoutons` et `QuestionEditModal` depuis `composant/ui/organismes/...`.

Aucun cycle obligatoire : `page/` → `ui/organismes/` → `ui/molecules/` → `ui/atomes/` reste un graphe descendant propre.

---

## Ce qu’on ne met **pas** dans `page/`

- **Canvas XYFlow** ou graphe : plutôt `composant/node/` + une **page** qui assemble le `<ReactFlow />` (voir `composant/node/regle-implementation.md`).
- **DeviceAuthGate**, headers : restent molécules / layout selon ton `architecture.md`.
- **Petits organismes** utilisés uniquement comme section d’une seule page : peuvent rester dans `organismes/<GrandePage>/parts/` si tu préfères le couplage fort (déjà le cas pour plusieurs `parts/` existants).

---

## Charge de migration

Déplacement mécanique + mise à jour des imports relatifs internes à chaque vue (chemins vers `organismes`, `lib`, `types`). Aucun changement de comportement si tu ne renommes que les dossiers parents et les imports externes.

Date de l’audit : alignée sur l’état du dépôt au moment de la rédaction (routes et grep sous `src/`).
