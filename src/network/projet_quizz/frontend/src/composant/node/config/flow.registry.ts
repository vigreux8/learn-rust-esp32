import type { NodeTypes, EdgeTypes } from "@xyflow/react";
import { CollectionNode } from "../costumeNode/CollectionNode";
import { QuestionNode } from "../costumeNode/QuestionNode";
import { CollectionEdge } from "../costumeEdge/CollectionEdge";

export const flowNodeTypes = {
  collectionNode: CollectionNode,
  questionNode: QuestionNode,
} satisfies NodeTypes;

export const flowEdgeTypes = {
  collectionEdge: CollectionEdge,
} satisfies EdgeTypes;
