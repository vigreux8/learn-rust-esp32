import {
  COLLECTION_TREE_LEVEL_BORDER_HEX,
  collectionTreePaletteBucket,
} from "../../../../../../lib/collectionHierarchyVis";

export function flowCollectionPaletteHexForDepth(treeDepth: number): string {
  const bucket = collectionTreePaletteBucket(treeDepth);
  return COLLECTION_TREE_LEVEL_BORDER_HEX[bucket];
}

export const FLOW_COLLECTION_PALETTE_BUCKET_INDICES = COLLECTION_TREE_LEVEL_BORDER_HEX.map(
  (_, index) => index,
);
