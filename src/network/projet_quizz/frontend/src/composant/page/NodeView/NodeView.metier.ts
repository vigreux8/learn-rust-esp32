import {
  computeTreeDepth,
  orderCollectionsHierarchy,
} from "../../../lib/collectionHierarchyVis";
import type { CollectionUi } from "../../../types/quizz";
import type { AppNode } from "../../node/config/flow.types";
import type {
  FlowSidebarCollectionRow,
  FlowSidebarQuestionRow,
} from "../../ui/organismes/FlowSidebarOverlay/FlowSidebarOverlay.types";

/**
 * Projette les collections API (même source que la page Collections) vers les lignes sidebar + questions groupées.
 */
export function buildNodeViewSidebarData(collections: CollectionUi[]): {
  collections: FlowSidebarCollectionRow[];
  questions: FlowSidebarQuestionRow[];
} {
  if (collections.length === 0) {
    return { collections: [], questions: [] };
  }

  const byId = new Map(collections.map((c) => [c.id, c]));
  const ordered = orderCollectionsHierarchy(collections);
  const collectionRows: FlowSidebarCollectionRow[] = ordered.map((c) => ({
    id: String(c.id),
    collectionId: c.id,
    label: c.nom,
    treeDepth: computeTreeDepth(c, byId),
  }));

  const questions: FlowSidebarQuestionRow[] = [];
  for (const c of collections) {
    for (const q of c.questions) {
      questions.push({
        id: String(q.id),
        title: q.question,
        category: c.nom,
        collectionId: c.id,
      });
    }
  }

  return { collections: collectionRows, questions };
}

/**
 * Déduit la collection dont on restreint la liste Questions (un seul nœud sélectionné avec `collectionId`).
 */
export function resolveQuestionsScopeCollectionIdFromSelection(selectedNodes: AppNode[]): number | null {
  if (selectedNodes.length !== 1) return null;
  const node = selectedNodes[0];
  if (node == null) return null;
  if (node.type === "collectionNode") {
    const cid = node.data.collectionId;
    return typeof cid === "number" ? cid : null;
  }
  if (node.type === "questionNode") {
    const cid = node.data.collectionId;
    return typeof cid === "number" ? cid : null;
  }
  return null;
}
