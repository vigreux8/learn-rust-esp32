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
