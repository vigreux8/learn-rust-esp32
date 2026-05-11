import type { Node, NodeProps } from "@xyflow/react";

export type QuestionNodeData = {
  title: string;
};

export type QuestionNodeType = Node<QuestionNodeData, "questionNode">;

export type QuestionNodeProps = NodeProps<QuestionNodeType>;
