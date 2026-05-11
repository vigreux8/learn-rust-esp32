import type { CollectionNodeData } from "./CollectionNode.types";

/** Données initiales pour démo / tests dans `NodeView`. */
export const DEFAULT_COLLECTION_NODE_DATA: CollectionNodeData = {
  label: "Collection démo",
  collections: [
    { id: "c1", label: "Biologie" },
    { id: "c2", label: "Histoire" },
  ],
  creators: [
    { id: "u1", name: "Alice" },
    { id: "u2", name: "Bob" },
  ],
};
