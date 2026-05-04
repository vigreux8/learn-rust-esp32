import type { CollectionTagRef } from "./CollectionCard.types";

export function buildQuestionsRoutePath(
  collectionId: number,
  linkedTags: CollectionTagRef[],
): string {
  const first = linkedTags[0];
  const q = first != null ? `?tagCollection=${first.id}` : "";
  return `/questions/${collectionId}${q}`;
}

export function buildSousCollectionsRoutePath(collectionId: number): string {
  return `/collections/${collectionId}/sous-collections`;
}
