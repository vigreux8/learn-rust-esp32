import type { NodeTypes } from "@xyflow/react";
import { CollectionNode } from "../costumeNode/CollectionNode";
import { QuestionNode } from "../costumeNode/QuestionNode";

export const flowNodeTypes = {
  collectionNode: CollectionNode,
  questionNode: QuestionNode,
} satisfies NodeTypes;

/** Types d’arêtes customs (vide tant qu’aucune arête custom). */
export const flowEdgeTypes = {};
