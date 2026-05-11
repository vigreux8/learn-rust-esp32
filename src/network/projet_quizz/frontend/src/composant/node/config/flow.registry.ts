import type { NodeTypes } from "@xyflow/react";
import { CollectionNode } from "../costumeNode/CollectionNode";

export const flowNodeTypes = {
  collectionNode: CollectionNode,
} satisfies NodeTypes;

/** Types d’arêtes customs (vide tant qu’aucune arête custom). */
export const flowEdgeTypes = {};
