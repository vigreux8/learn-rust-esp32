import type { LinkedModule } from "./CollectionCard.types";

export function buildQuestionsRoutePath(collectionId: number, linkedModules: LinkedModule[]): string {
  const first = linkedModules[0];
  const q = first != null ? `?module=${first.id}` : "";
  return `/questions/${collectionId}${q}`;
}

export function buildSousCollectionsRoutePath(collectionId: number): string {
  return `/collections/${collectionId}/sous-collections`;
}
