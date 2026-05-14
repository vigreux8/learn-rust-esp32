import { collectionTreePaletteBucket } from "../../../../lib/collectionHierarchyVis";
import type { FlowSidebarCollectionRow, FlowSidebarPersonalityRow } from "./FlowSidebarOverlay.types";

export {
  REACT_FLOW_DND_MIME,
  normalizeQuestionNodeMovePayload,
  parseReactFlowDnDPayload,
  readReactFlowDnDFromEvent,
  type ReactFlowDnDPayload,
} from "../../../../lib/reactFlowDnD";

/**
 * Même logique que le panneau « Filtrer collections » : recherche texte + pastilles palette (profondeur).
 */
export function filterFlowSidebarCollectionRows(
  rows: FlowSidebarCollectionRow[],
  paletteBucketFilters: number[],
  rawSearch: string,
): FlowSidebarCollectionRow[] {
  let out = rows;
  if (paletteBucketFilters.length > 0) {
    out = out.filter((row) =>
      paletteBucketFilters.includes(collectionTreePaletteBucket(row.treeDepth)),
    );
  }
  const query = rawSearch.trim().toLowerCase();
  if (query.length > 0) {
    out = out.filter((row) => row.label.toLowerCase().includes(query));
  }
  return out;
}

/**
 * Filtre nom personnalité : chaque segment séparé par des espaces doit apparaître dans le libellé (casse ignorée).
 */
export function personalityLabelsMatchesNameTokens(label: string, searchRaw: string): boolean {
  const trimmed = searchRaw.trim().toLowerCase();
  if (trimmed.length === 0) return true;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const hay = label.toLowerCase();
  return tokens.every((t) => hay.includes(t));
}

/** Une ligne par fiche (`personaliteId`) : conserve la première occurrence (ordre déjà trié côté données). */
export function dedupePersonalityRowsByPersonId(
  rows: readonly FlowSidebarPersonalityRow[],
): FlowSidebarPersonalityRow[] {
  const seen = new Set<number>();
  const out: FlowSidebarPersonalityRow[] = [];
  for (const row of rows) {
    if (seen.has(row.personaliteId)) continue;
    seen.add(row.personaliteId);
    out.push(row);
  }
  return out;
}
