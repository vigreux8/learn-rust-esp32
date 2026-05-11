# Conventions du module `src/composant/node` (XYFlow / React Flow)

Ce document décrit l’arborescence réelle du dossier `composant/node`, son rôle dans le **frontend `projet_quizz`** (voir [`architecture.md`](../../../architecture.md) : Preact, Vite, **Tailwind CSS 4**, DaisyUI), et les règles pour ajouter un **nœud**, une **arête** ou un **handle** personnalisés. Il sert de référence pour les humains et les assistants IA.

## Stack graphe et styles

| Élément                      | Choix                                                                                                                                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Bibliothèque graphe          | **`@xyflow/react`** (React Flow v12, package npm officiel XYFlow)                                                                                                                                                                                                        |
| Runtime UI du projet         | **Preact** 10 ; le preset **`@preact/preset-vite`** assure en général la résolution de `react` / `react-dom` vers **`preact/compat`**, ce dont dépend `@xyflow/react`.                                                                                                   |
| Styles globaux XYFlow        | **`@import "@xyflow/react/dist/style.css"`** dans `src/index.css` (handles, minimap, contrôles).                                                                                                                                                                         |
| Styles des composants custom | **Tailwind** (comme le reste du frontend) : classes dans le JSX ou, de préférence, chaînes regroupées dans un fichier **`*.styles.ts`** ; utiliser au besoin **`lib/cn.ts`** (`clsx` + `tailwind-merge`). Éviter les duplications avec le design system `composant/ui/`. |

**Tailwind** n’est pas réinstallé dans ce dossier : il est déjà configuré au niveau du frontend (`@tailwindcss/vite`, `index.css`).

---

## Rôle du module dans le projet

Le frontend `projet_quizz` structure l’UI principalement sous `composant/ui/` (atomes, molécules, organismes). Le dossier **`composant/node`** regroupe tout ce qui concerne un **canvas graphe** (types de nœuds/arêtes, registry, handles réutilisables). Le montage de `<ReactFlow />` (état `nodes` / `edges`, panneau, etc.) vit **en dehors** de `node/`, typiquement dans un **organisme** sous `composant/ui/organismes/`, qui importe le registry depuis `composant/node/config/`.

---

## 1. Arborescence (réelle)

Les dossiers suivants existent à la racine de `src/composant/node/` :

```text
src/composant/node/
├── config/                 # Registres et types TypeScript du graphe
│   ├── flow.registry.ts    # Map nodeTypes / edgeTypes → composants
│   └── flow.types.ts       # Types dérivés du registry (+ types natifs XYFlow)
├── costumeNode/            # Un dossier par type de nœud custom (voir § 4)
├── costumeEdge/            # Un dossier par type d’arête custom
├── costumeHandle/          # Handles réutilisables entre plusieurs nœuds
└── regle-implementation.md
```

**Convention de nommage des dossiers** : les préfixes **`costumeNode`**, **`costumeEdge`**, **`costumeHandle`** sont volontairement homogènes sur ce périmètre (orthographe historique du projet). **Ne pas renommer** sans décision d’équipe : les imports et la doc s’y réfèrent.

Chaque entrée sous `costumeNode/<NomNode>/`, `costumeEdge/<NomEdge>/`, `costumeHandle/<NomHandle>/` suit les mêmes principes que `composant/ui/` (indiquer dans architecture.md)

Les sous-éléments **exclusivement** utilisés par un nœud peuvent vivre dans **`parts/`** (même logique que dans `architecture.md`).

---

## 2. Principes globaux

1. **`type` du nœud (string)**  
   La propriété `type` d’un objet `Node` XYFlow doit correspondre **exactement** à une **clé** de `flowNodeTypes` dans `flow.registry.ts` pour les customs, ou aux types natifs utilisés (`input`, `output`, `default`, etc.), listés dans `flow.types.ts` comme `BuiltInNodeKind`.

2. **`data` (nodeData)**  
   Chaque nœud custom a un type **`XxxNodeData`** co-localisé (ou dans `*.types.ts`). Le composant utilise `NodeProps<Node<XxxNodeData, 'maCleRegistry'>>` pour que `data` soit typé.

3. **`type` d’arête**  
   Même principe : clé dans `flowEdgeTypes` (`CustomEdgeKind`), et types natifs éventuels dans `BuiltInEdgeKind`.

4. **Source de vérité**
   - Tout nouveau composant enregistré dans **`config/flow.registry.ts`**.
   - Les alias `CustomNodeKind`, `CustomEdgeKind`, `AppNode`, `AppEdge` dans **`config/flow.types.ts`** suivent le registry (`keyof typeof flowNodeTypes`, etc.) pour l’auto-complétion.

5. **Canvas**  
   Pas dans `node/` : uniquement des imports depuis `composant/node/…`. Aucune logique métier lourde dans `config/` hors typage et tables de composants.

---

## 3. Fichiers `config/` en détail

### `flow.registry.ts`

- Objet **`flowNodeTypes`** : `{ [cleCamelCase]: ComposantNode }`.
- Objet **`flowEdgeTypes`** : `{ [cle]: ComposantEdge }`.
- Importer les composants depuis `../costumeNode/...`, `../costumeEdge/...`, etc., et **exporter** les deux objets.

Toute nouvelle clé doit être utilisée de façon cohérente (état initial, `onConnect`, `setNodes`, …).

### `flow.types.ts`

- **`CustomNodeKind`** = `keyof typeof flowNodeTypes`
- **`CustomEdgeKind`** = `keyof typeof flowEdgeTypes`
- **`BuiltInNodeKind` / `BuiltInEdgeKind`** : à étendre si vous utilisez d’autres types natifs XYFlow.
- **`AppNode`** / **`AppEdge`** : alias `Node` / `Edge` avec les bons génériques.

Les appels à `useReactFlow()` doivent utiliser **`useReactFlow<AppNode, AppEdge>()`** lorsque ces types sont définis.

---

## 4. Créer un **nœud custom**

1. Créer **`costumeNode/<NomNode>/`** avec `NomNode.tsx`, types, styles Tailwind, `index.ts`.
2. Définir **`NomNodeData`** (ex. `{ label: string }`).
3. Exposer **`NomNodeType = Node<NomNodeData, 'cleRegistry'>`** où `'cleRegistry'` est **identique** à la clé dans `flowNodeTypes`.
4. Props : **`NodeProps<NomNodeType>`**.
5. Dans le JSX : **`Handle`** (targets/sources) ; classes **`nodrag` / `nowheel`** sur les contrôles interactifs si besoin. Réutiliser un handle sous **`costumeHandle/`** si utile.
6. **Enregistrer** dans `flow.registry.ts` : `cleRegistry: NomNode`.

**Exemple minimal (schématique)**

```tsx
import { Handle, NodeProps, Position, Node } from "@xyflow/react";

type MonNodeData = { label: string };
export type MonNodeType = Node<MonNodeData, "monNode">;
type MonNodeProps = NodeProps<MonNodeType>;

export function MonNode({ data }: MonNodeProps) {
  return (
    <div className="rounded-box border border-base-300 bg-base-100 px-3 py-2">
      {data.label}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="sortie" />
    </div>
  );
}
```

Puis dans le registry : `monNode: MonNode`.

---

## 5. Arêtes et handles

- **Arête** : même schéma sous **`costumeEdge/<NomEdge>/`**, enregistrement dans **`flowEdgeTypes`**.
- **Handle** : composants partagés sous **`costumeHandle/<NomHandle>/`**, importés par plusieurs nœuds ; export via `index.ts` du sous-dossier.

---

## 6. Résumé

| Couche                       | Emplacement                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Styles XYFlow globaux        | `src/index.css` → `@xyflow/react/dist/style.css`                                |
| Registry + types TS          | `composant/node/config/`                                                        |
| Nœuds / arêtes / handles     | `costumeNode/`, `costumeEdge/`, `costumeHandle/`                                |
| Vue canvas (`<ReactFlow />`) | Organisme (ou équivalent) sous `composant/ui/`, imports depuis `composant/node` |

Une clé dans **`flow.registry.ts`** définit un `node.type` ou `edge.type` identifiable ; les composants vivent sous **`costume*`** ; **`flow.types.ts`** propage les clés en types pour le reste de l’app.
