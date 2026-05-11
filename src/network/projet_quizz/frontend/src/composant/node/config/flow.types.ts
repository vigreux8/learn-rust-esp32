import type { Edge } from "@xyflow/react";
import type { CollectionNodeType } from "../costumeNode/CollectionNode/CollectionNode.types";
import type { PersonalityNodeType } from "../costumeNode/PersonalityNode/PersonalityNode.types";
import type { QuestionNodeType } from "../costumeNode/QuestionNode/QuestionNode.types";

/** Aligné sur les clés de `flow.registry.ts` (`collectionNode`, `questionNode`, `personalityNode`, …). */
export type CustomNodeKind =
  | CollectionNodeType["type"]
  | QuestionNodeType["type"]
  | PersonalityNodeType["type"];

export type AppNode = CollectionNodeType | QuestionNodeType | PersonalityNodeType;
export type AppEdge = Edge;
