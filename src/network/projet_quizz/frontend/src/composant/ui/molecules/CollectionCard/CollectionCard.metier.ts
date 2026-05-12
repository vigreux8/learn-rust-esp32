import type { CollectionTagRef } from "./CollectionCard.types";

export type BuildQuestionsRoutePathOptions = {
  /** Ajoute `from=node` pour afficher un retour vers `/node` et restaurer le panneau latéral sauvegardé. */
  fromNode?: boolean;
};

export function buildQuestionsRoutePath(
  collectionId: number,
  linkedTags: CollectionTagRef[],
  options?: BuildQuestionsRoutePathOptions,
): string {
  const params = new URLSearchParams();
  const first = linkedTags[0];
  if (first != null) params.set("tagCollection", String(first.id));
  if (options?.fromNode === true) params.set("from", "node");
  const q = params.toString();
  return `/questions/${collectionId}${q ? `?${q}` : ""}`;
}

export function buildSousCollectionsRoutePath(collectionId: number): string {
  return `/collections/${collectionId}/sous-collections`;
}

export function buildReflexionRoutePath(collectionId: number): string {
  return `/collections/${collectionId}/reflexion`;
}
