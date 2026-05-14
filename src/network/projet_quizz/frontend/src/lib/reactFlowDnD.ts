/** MIME utilisé par la sidebar graphe et les zones drop des nœuds (`@xyflow/react`). */
export const REACT_FLOW_DND_MIME = "application/reactflow";

export type ReactFlowDnDPayload = {
  type: string;
  data: unknown;
};

/**
 * Interprète la charge utile JSON déposée sur le canvas ou un nœud.
 */
export function parseReactFlowDnDPayload(raw: string): ReactFlowDnDPayload | null {
  try {
    const value = JSON.parse(raw) as unknown;
    if (value === null || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    if (typeof record.type !== "string") return null;
    return { type: record.type, data: record.data };
  } catch {
    return null;
  }
}

/**
 * Lit le MIME React Flow sur un événement `drop` ou `dragstart`.
 */
export function readReactFlowDnDFromEvent(event: DragEvent): ReactFlowDnDPayload | null {
  const raw = event.dataTransfer?.getData(REACT_FLOW_DND_MIME);
  if (raw == null || raw === "") return null;
  return parseReactFlowDnDPayload(raw);
}

/**
 * Charge utile `questionNode` (sidebar ou nœud) : `questionIds` optionnel pour un déplacement groupé.
 */
export function normalizeQuestionNodeMovePayload(data: unknown): {
  fromCollectionId: number | null;
  questionIds: number[];
} {
  const patch = (data ?? {}) as Record<string, unknown>;
  const fromCollectionId = typeof patch.collectionId === "number" ? patch.collectionId : null;
  const single = typeof patch.questionId === "number" ? patch.questionId : null;
  const raw = patch.questionIds;
  const fromArray = Array.isArray(raw)
    ? raw.filter((x): x is number => typeof x === "number" && Number.isFinite(x))
    : [];
  const merged =
    fromArray.length > 0 ? [...new Set(fromArray)] : single != null ? [single] : [];
  merged.sort((a, b) => a - b);
  return { fromCollectionId, questionIds: merged };
}

/**
 * Charge utile `reflexionGroupeNode` (sidebar) : `groupeIds` optionnel pour un déplacement groupé.
 */
export function normalizeReflexionGroupeNodeMovePayload(data: unknown): {
  fromCollectionId: number | null;
  groupeIds: number[];
} {
  const patch = (data ?? {}) as Record<string, unknown>;
  const fromCollectionId = typeof patch.collectionId === "number" ? patch.collectionId : null;
  const single = typeof patch.groupeId === "number" ? patch.groupeId : null;
  const raw = patch.groupeIds;
  const fromArray = Array.isArray(raw)
    ? raw.filter((x): x is number => typeof x === "number" && Number.isFinite(x))
    : [];
  const merged =
    fromArray.length > 0 ? [...new Set(fromArray)] : single != null ? [single] : [];
  merged.sort((a, b) => a - b);
  return { fromCollectionId, groupeIds: merged };
}
