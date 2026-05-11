import type { CollectionNodeData } from "./CollectionNode.types";

/** Données initiales pour démo / tests dans `NodeView`. */
export const DEFAULT_COLLECTION_NODE_DATA: CollectionNodeData = {
  label: "Collection démo",
  supercollections: [
    { id: "t1", label: "Étiquette démo A" },
    { id: "t2", label: "Étiquette démo B" },
  ],
  creators: [
    { id: "u1", name: "Alice" },
    { id: "u2", name: "Bob" },
  ],
};
