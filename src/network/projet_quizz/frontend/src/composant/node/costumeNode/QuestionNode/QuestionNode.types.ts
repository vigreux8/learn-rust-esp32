import type { Node, NodeProps } from "@xyflow/react";

export type QuestionNodeData = {
  title: string;
  /** Collection d’origine (filtre sidebar Questions au clic sur ce nœud). */
  collectionId?: number | null;
};

export type QuestionNodeType = Node<QuestionNodeData, "questionNode">;

export type QuestionNodeProps = NodeProps<QuestionNodeType>;
