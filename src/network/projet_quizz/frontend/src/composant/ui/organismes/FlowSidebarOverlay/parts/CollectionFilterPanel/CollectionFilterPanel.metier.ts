import {
  COLLECTION_TREE_LEVEL_BORDER_HEX,
  collectionTreeBorderHexForDepth,
} from "../../../../../../lib/collectionHierarchyVis";

/** Voie compatible : même résultat que `collectionTreeBorderHexForDepth` (`lib/collectionHierarchyVis`). */
export function flowCollectionPaletteHexForDepth(treeDepth: number): string {
  return collectionTreeBorderHexForDepth(treeDepth);
}

export const FLOW_COLLECTION_PALETTE_BUCKET_INDICES = COLLECTION_TREE_LEVEL_BORDER_HEX.map(
  (_, index) => index,
);
