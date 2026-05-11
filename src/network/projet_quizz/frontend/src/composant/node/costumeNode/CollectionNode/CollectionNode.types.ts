import type { Node, NodeProps } from "@xyflow/react";

export type CollectionItem = { id: string; label: string };
export type CreatorItem = { id: string; name: string };

export type CollectionNodeActions = {
  onPlay?: (nodeId: string) => void;
  onAddItem?: (type: "collection" | "creator", nodeId: string) => void;
};

export type CollectionNodeData = {
  label: string;
  /** Si renseigné, aligné sur l’API collections (filtre sidebar Questions au clic sur ce nœud). */
  collectionId?: number | null;
  /**
   * Collections qui étiquettent celle-ci (`collection_tags` côté API) — affichées derrière l’icône #.
   * Ce ne sont pas les sous-collections enfants (`sous_collections`).
   */
  supercollections: CollectionItem[];
  creators: CreatorItem[];
  actions?: CollectionNodeActions;
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
    supercollections: CollectionItem[];
    creators: CreatorItem[];
  };
  dnd: {
    isOverBar: boolean;
    /** Zones HTML5 drop : supercollections (#) et influenceurs. */
    supercollections: { onDragOver: (event: DragEvent) => void; onDrop: (event: DragEvent) => void };
    influenceurs: { onDragOver: (event: DragEvent) => void; onDrop: (event: DragEvent) => void };
  };
  actions: {
    onPlay: () => void;
  };
};
