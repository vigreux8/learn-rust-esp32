import type { Node, NodeProps } from "@xyflow/react";

export type CollectionItem = { id: string; label: string };
export type CreatorItem = { id: string; name: string };

export type CollectionNodeActions = {
  onPlay?: (nodeId: string) => void;
  onAddItem?: (type: "collection" | "creator", nodeId: string) => void;
};

export type CollectionNodeData = {
  label: string;
  collections: CollectionItem[];
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
    collections: CollectionItem[];
    creators: CreatorItem[];
  };
  dnd: {
    isOverBar: boolean;
  };
  actions: {
    onPlay: () => void;
  };
};
