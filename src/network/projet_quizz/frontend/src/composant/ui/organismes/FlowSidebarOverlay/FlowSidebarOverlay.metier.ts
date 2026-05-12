import { collectionTreePaletteBucket } from "../../../../lib/collectionHierarchyVis";
import type { FlowSidebarCollectionRow } from "./FlowSidebarOverlay.types";

export {
  REACT_FLOW_DND_MIME,
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
