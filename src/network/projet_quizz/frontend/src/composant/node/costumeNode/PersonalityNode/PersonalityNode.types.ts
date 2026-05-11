import type { Node, NodeProps } from "@xyflow/react";

export type PersonalityNodeData = {
  label: string;
  importanceType: string | null;
  personaliteId?: number;
  collectionLabel?: string;
  ficheCollectionId?: number;
};

export type PersonalityNodeType = Node<PersonalityNodeData, "personalityNode">;

export type PersonalityNodeProps = NodeProps<PersonalityNodeType>;
