import type { CollectionItem, CollectionNodeData, CreatorItem } from "./CollectionNode.types";

/**
 * Ajoute une entrée supercollection (#) depuis le drag sidebar (payload `collectionNode` avec `collectionId`).
 */
export function mergeSupercollectionFromSidebarPayload(
  current: CollectionItem[],
  data: unknown,
): CollectionItem[] | null {
  if (data === null || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if (record.blankTemplate === true) return null;
  const cid = record.collectionId;
  if (typeof cid !== "number") return null;
  const label = typeof record.label === "string" ? record.label : `Collection ${cid}`;
  const item: CollectionItem = { id: String(cid), label };
  if (current.some((c) => c.id === item.id)) return current;
  return [...current, item];
}

/**
 * Ajoute une ligne influenceur depuis le drag sidebar (payload `personalityNode` avec `personaliteId`).
 */
export function mergeInfluenceurFromSidebarPayload(
  current: CreatorItem[],
  data: unknown,
): CreatorItem[] | null {
  if (data === null || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if (record.blankTemplate === true) return null;
  const pid = record.personaliteId;
  if (typeof pid !== "number") return null;
  const name = typeof record.label === "string" ? record.label : `Personnalité ${pid}`;
  const item: CreatorItem = { id: String(pid), name };
  if (current.some((c) => c.id === item.id)) return current;
  return [...current, item];
}

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
