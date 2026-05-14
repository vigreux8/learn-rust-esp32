import type { Node, NodeProps } from "@xyflow/react";

import type { InfluenceurRolePick } from "./parts/CreatorPanel/CreatorPanel.metier";

export type CollectionItem = { id: string; label: string };
/** `importanceType` = rôle (`ref_importance_personalite.type` : pionnier, important, secondaire, ou absent). */
export type CreatorItem = { id: string; name: string; importanceType?: string | null };

/** Props du panneau influenceurs (partagé avec `CreatorPanel` sans cycle d’import). */
export type CollectionNodeCreatorPanelInput = {
  data: { creators: CreatorItem[] };
  settings: { roleChangeEnabled: boolean };
  status: { savingPersonaliteId: number | null };
  actions: {
    onRoleChange: (personaliteId: number, importancePick: InfluenceurRolePick) => void;
    onRemoveCreator: (personaliteId: number) => void;
  };
};
/** Props du panneau supercollections / # (partagé avec `CollectionPanel`). */
export type CollectionNodeSupercollectionsPanelInput = {
  data: { supercollections: CollectionItem[] };
  settings: { tagRemoveEnabled: boolean };
  status: { savingTagCollectionId: number | null };
  actions: { onRemoveTag: (tagCollectionId: number) => void };
};

export type CollectionNodeActions = {
  onPlay?: (nodeId: string) => void;
  onAddItem?: (type: "collection" | "creator", nodeId: string) => void;
};

export type CollectionNodeData = {
  label: string;
  /** Profondeur dans l’arbre parent → enfants (même logique que les cartes Collections). */
  treeDepth?: number;
  /** Si renseigné, aligné sur l’API collections (filtre sidebar Questions au clic sur ce nœud). */
  collectionId?: number | null;
  /**
   * Collections qui étiquettent celle-ci (`collection_tags` côté API) — affichées derrière l’icône #.
   * Ce ne sont pas les sous-collections enfants (`sous_collections`).
   */
  supercollections: CollectionItem[];
  creators: CreatorItem[];
  /** Si `false`, les questions de cette collection sont exclues du paquet quand une partie est lancée depuis le graphe. */
  playIncluded?: boolean;
  actions?: CollectionNodeActions;
  /** Nombre de questions dans la collection (API) — pour afficher « Suite logique ». */
  questionCount?: number;
  /** Collection appartenant à l’utilisateur courant (aligné sur les cartes Collections). */
  isMine?: boolean;
  /** `true` si la collection n’a pas de parent en base **et** aucun enfant direct — sinon ce n’est pas considérée comme orpheline (racine qui porte une branche). */
  isHierarchyOrphan?: boolean;
};

export type CollectionNodeType = Node<CollectionNodeData, "collectionNode">;

export type CollectionNodeProps = NodeProps<CollectionNodeType>;

export type CollectionNodeViewStates = {
  layout: {
    isExpanded: boolean;
    toggle: () => void;
  };
  content: {
    title: string;
  };
  supercollectionsPanel: CollectionNodeSupercollectionsPanelInput;
  creatorPanel: CollectionNodeCreatorPanelInput;
  dnd: {
    isOverBar: boolean;
    /** Drop depuis la sidebar : collection → # (persisté API si graphe NodeView), personnalité → influenceurs. */
    nodeSurface: {
      onDragOver: (event: DragEvent) => void;
      onDragOverCapture: (event: DragEvent) => void;
      onDrop: (event: DragEvent) => void;
    };
  };
  graphPlay: {
    showToggle: boolean;
    included: boolean;
    onToggleIncluded: (e: Event) => void;
  };
  actions: {
    onPlay: () => void;
  };
};
