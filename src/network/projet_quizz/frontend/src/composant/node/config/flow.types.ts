import type { Edge, Node } from "@xyflow/react";
import type { CollectionNodeData } from "../costumeNode/CollectionNode/CollectionNode.types";

/** Aligné sur les clés de `flow.registry.ts` (`collectionNode`, …). */
export type CustomNodeKind = "collectionNode";

export type AppNode = Node<CollectionNodeData, CustomNodeKind>;
export type AppEdge = Edge;
