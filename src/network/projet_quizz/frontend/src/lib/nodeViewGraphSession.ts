import type { AppEdge, AppNode } from "../composant/node/config/flow.types";

const STORAGE_KEY = "quizz-node-view-graph-session";
const STORAGE_VERSION = 1;

export type NodeViewGraphViewport = { x: number; y: number; zoom: number };

export type NodeViewGraphSessionPayload = {
  version: number;
  nodes: AppNode[];
  edges: AppEdge[];
  viewport: NodeViewGraphViewport | null;
  questionsScopeCollectionId: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidViewport(value: unknown): value is NodeViewGraphViewport {
  if (!isRecord(value)) return false;
  return (
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.zoom === "number" &&
    Number.isFinite(value.x) &&
    Number.isFinite(value.y) &&
    Number.isFinite(value.zoom)
  );
}

/**
 * Lit le dernier état graphe `/node` sauvegardé en session (onglet courant).
 */
export function readStoredNodeViewGraph(): NodeViewGraphSessionPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw == null || raw === "") return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;
    if (parsed.version !== STORAGE_VERSION) return null;
    if (!Array.isArray(parsed.nodes)) return null;
    if (!Array.isArray(parsed.edges)) return null;
    const viewport =
      parsed.viewport === null || parsed.viewport === undefined
        ? null
        : isValidViewport(parsed.viewport)
          ? parsed.viewport
          : null;
    const q =
      parsed.questionsScopeCollectionId === null || parsed.questionsScopeCollectionId === undefined
        ? null
        : typeof parsed.questionsScopeCollectionId === "number" &&
            Number.isFinite(parsed.questionsScopeCollectionId)
          ? parsed.questionsScopeCollectionId
          : null;
    return {
      version: STORAGE_VERSION,
      nodes: parsed.nodes as AppNode[],
      edges: parsed.edges as AppEdge[],
      viewport,
      questionsScopeCollectionId: q,
    };
  } catch {
    return null;
  }
}

/**
 * Enregistre nœuds, arêtes, viewport et périmètre questions pour restauration après navigation hors `/node`.
 */
export function writeStoredNodeViewGraph(payload: {
  nodes: AppNode[];
  edges: AppEdge[];
  viewport: NodeViewGraphViewport;
  questionsScopeCollectionId: number | null;
}): void {
  if (typeof sessionStorage === "undefined") return;
  const body: NodeViewGraphSessionPayload = {
    version: STORAGE_VERSION,
    nodes: payload.nodes.map((n) => ({ ...n, selected: false })),
    edges: payload.edges,
    viewport: payload.viewport,
    questionsScopeCollectionId: payload.questionsScopeCollectionId,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(body));
}
