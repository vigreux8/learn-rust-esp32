import type { Edge } from "@xyflow/react";
import type { CollectionNodeType } from "../costumeNode/CollectionNode/CollectionNode.types";
import type { QuestionNodeType } from "../costumeNode/QuestionNode/QuestionNode.types";
import type { CollectionEdgeType } from "../costumeEdge/CollectionEdge/CollectionEdge.types";

/** Aligné sur les clés de `flow.registry.ts` (`collectionNode`, `questionNode`, …). */
export type CustomNodeKind = CollectionNodeType["type"] | QuestionNodeType["type"];
export type CustomEdgeKind = CollectionEdgeType["type"];

export type AppNode = CollectionNodeType | QuestionNodeType;
export type AppEdge = Edge | CollectionEdgeType;
