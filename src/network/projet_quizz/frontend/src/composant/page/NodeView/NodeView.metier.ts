import {
  computeTreeDepth,
  orderCollectionsHierarchy,
} from "../../../lib/collectionHierarchyVis";
import type { CollectionUi } from "../../../types/quizz";
import type { AppEdge, AppNode } from "../../node/config/flow.types";
import {
  collectionNodeGraphHorizontalStepPx,
  collectionNodeGraphVerticalStepPx,
} from "../../node/costumeNode/CollectionNode/CollectionNode.styles";
import type {
  FlowSidebarCollectionHierarchyRef,
  FlowSidebarCollectionRow,
  FlowSidebarPersonalityRow,
  FlowSidebarQuestionRow,
} from "../../ui/organismes/FlowSidebarOverlay/FlowSidebarOverlay.types";

/**
 * Projette les collections API (même source que la page Collections) vers les lignes sidebar + questions groupées.
 */
export function buildNodeViewSidebarData(collections: CollectionUi[]): {
  collections: FlowSidebarCollectionRow[];
  questions: FlowSidebarQuestionRow[];
  personalities: FlowSidebarPersonalityRow[];
  collectionHierarchy: FlowSidebarCollectionHierarchyRef[];
} {
  if (collections.length === 0) {
    return { collections: [], questions: [], personalities: [], collectionHierarchy: [] };
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
  const personalities: FlowSidebarPersonalityRow[] = [];
  for (const c of collections) {
    for (const q of c.questions) {
      questions.push({
        id: String(q.id),
        title: q.question,
        category: c.nom,
        collectionId: c.id,
      });
    }
    for (const p of c.personnalites ?? []) {
      personalities.push({
        id: `${c.id}-${p.id}`,
        personaliteId: p.id,
        label: `${p.prenom} ${p.nom}`.trim(),
        importanceType: p.importance_type ?? null,
        collectionId: c.id,
        collectionLabel: c.nom,
        ficheCollectionId: p.fiche_collection_id,
      });
    }
  }

  personalities.sort((a, b) => {
    const byLabel = a.label.localeCompare(b.label, "fr");
    return byLabel !== 0 ? byLabel : a.collectionLabel.localeCompare(b.collectionLabel, "fr");
  });

  const collectionHierarchy: FlowSidebarCollectionHierarchyRef[] = collections.map((c) => ({
    id: c.id,
    parent_collection_id: c.parent_collection_id ?? null,
  }));

  return { collections: collectionRows, questions, personalities, collectionHierarchy };
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

/** Identifiant nœud React Flow stable pour une branche catalogue (distinct du drop aléatoire). */
export function treeCollectionReactFlowNodeId(collectionId: number): string {
  return `collection-tree-${collectionId}`;
}

function ancestorChainRootToFocus(focusCollectionId: number, byId: Map<number, CollectionUi>): number[] {
  const ascend: number[] = [];
  let cur: number | null = focusCollectionId;
  const visited = new Set<number>();
  while (cur != null && !visited.has(cur)) {
    visited.add(cur);
    ascend.push(cur);
    const pid: number | null = byId.get(cur)?.parent_collection_id ?? null;
    cur = pid != null && byId.has(pid) ? pid : null;
  }
  return ascend.slice().reverse();
}

function descendantIdsExclusive(focusId: number, collections: CollectionUi[]): Set<number> {
  const childrenByParent = new Map<number, number[]>();
  for (const c of collections) {
    const p = c.parent_collection_id ?? null;
    if (p == null) continue;
    const arr = childrenByParent.get(p);
    if (arr) arr.push(c.id);
    else childrenByParent.set(p, [c.id]);
  }
  for (const arr of childrenByParent.values()) arr.sort((a, b) => a - b);
  const out = new Set<number>();
  const stack = [...(childrenByParent.get(focusId) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (out.has(id)) continue;
    out.add(id);
    const ch = childrenByParent.get(id);
    if (ch) for (const x of ch) stack.push(x);
  }
  return out;
}

function assignBfsDepthLevels(
  rootId: number,
  memberIds: Set<number>,
  childrenByParent: Map<number, number[]>,
): Map<number, number> {
  const depthById = new Map<number, number>();
  depthById.set(rootId, 0);
  let frontier = [rootId];

  while (frontier.length > 0) {
    frontier.sort((a, b) => a - b);
    const next: number[] = [];
    for (const id of frontier) {
      const depth = depthById.get(id)!;
      for (const ch of childrenByParent.get(id) ?? []) {
        if (!memberIds.has(ch) || depthById.has(ch)) continue;
        depthById.set(ch, depth + 1);
        next.push(ch);
      }
    }
    frontier = [...new Set(next)].sort((a, b) => a - b);
  }

  return depthById;
}

/** Nœuds + arêtes parent→enfant (handles `output` → `h-left`) pour ancêtres jusqu’à la racine puis sous-arbre descendant. */
export function buildCollectionSubtreeGraphElements(
  focusCollectionId: number,
  collections: CollectionUi[],
): { nodes: AppNode[]; edges: AppEdge[] } {
  if (collections.length === 0) {
    return { nodes: [], edges: [] };
  }
  const byId = new Map(collections.map((c) => [c.id, c]));
  if (!byId.has(focusCollectionId)) {
    return { nodes: [], edges: [] };
  }

  const childrenByParent = new Map<number, number[]>();
  for (const c of collections) {
    const p = c.parent_collection_id ?? null;
    if (p == null) continue;
    const arr = childrenByParent.get(p);
    if (arr) arr.push(c.id);
    else childrenByParent.set(p, [c.id]);
  }
  for (const arr of childrenByParent.values()) arr.sort((a, b) => a - b);

  const ancestryRootToFocus = ancestorChainRootToFocus(focusCollectionId, byId);
  const subtreeDown = descendantIdsExclusive(focusCollectionId, collections);
  const graphIds = new Set<number>(subtreeDown);
  for (const id of ancestryRootToFocus) graphIds.add(id);

  const layoutRootId = ancestryRootToFocus[0]!;
  const depthLevels = assignBfsDepthLevels(layoutRootId, graphIds, childrenByParent);

  const nodesByDepth = new Map<number, number[]>();
  for (const id of graphIds) {
    const d = depthLevels.get(id);
    if (d === undefined) continue;
    const row = nodesByDepth.get(d);
    if (row) row.push(id);
    else nodesByDepth.set(d, [id]);
  }
  const depthKeysSorted = [...nodesByDepth.keys()].sort((a, b) => a - b);

  const horizontalStep = collectionNodeGraphHorizontalStepPx();
  const verticalStep = collectionNodeGraphVerticalStepPx();
  const positions = new Map<number, { x: number; y: number }>();

  depthKeysSorted.forEach((depth) => {
    const rowIds = [...(nodesByDepth.get(depth) ?? [])].sort((a, b) => a - b);
    const n = rowIds.length;
    rowIds.forEach((id, ix) => {
      const xRaw = ix * horizontalStep;
      const x = xRaw - (n > 0 ? ((n - 1) / 2) * horizontalStep : 0);
      const y = depth * verticalStep;
      positions.set(id, { x, y });
    });
  });

  const nodes: AppNode[] = [];
  for (const id of graphIds) {
    const c = byId.get(id);
    const pos = positions.get(id);
    if (c == null || pos == null) continue;
    const treeDepth = computeTreeDepth(c, byId);
    nodes.push({
      id: treeCollectionReactFlowNodeId(id),
      type: "collectionNode",
      position: pos,
      data: {
        label: c.nom,
        collectionId: c.id,
        treeDepth,
        supercollections: (c.collection_tags ?? []).map((tag) => ({
          id: String(tag.id),
          label: tag.nom,
        })),
        creators: (c.personnalites ?? []).map((p) => ({
          id: String(p.id),
          name: `${p.prenom} ${p.nom}`.trim(),
          importanceType: p.importance_type ?? null,
        })),
      },
    });
  }

  const edges: AppEdge[] = [];
  for (const c of collections) {
    if (!graphIds.has(c.id)) continue;
    const pid = c.parent_collection_id ?? null;
    if (pid == null || !graphIds.has(pid)) continue;
    edges.push({
      id: `ce-${pid}-${c.id}`,
      source: treeCollectionReactFlowNodeId(pid),
      target: treeCollectionReactFlowNodeId(c.id),
      sourceHandle: "output",
      targetHandle: "h-left",
    });
  }

  return { nodes, edges };
}
