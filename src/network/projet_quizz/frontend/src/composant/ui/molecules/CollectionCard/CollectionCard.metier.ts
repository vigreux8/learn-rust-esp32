import type { CollectionTagRef } from "./CollectionCard.types";

export type BuildQuestionsRoutePathOptions = {
  /** Ajoute `from=node` pour afficher un retour vers `/node` et restaurer le panneau latéral sauvegardé. */
  fromNode?: boolean;
  /** Ajoute `importLlm=1` pour ouvrir le panneau d’import LLM sur la page Questions. */
  openImportLlm?: boolean;
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
  if (options?.openImportLlm === true) params.set("importLlm", "1");
  const q = params.toString();
  return `/questions/${collectionId}${q ? `?${q}` : ""}`;
}

export function buildSousCollectionsRoutePath(collectionId: number): string {
  return `/collections/${collectionId}/sous-collections`;
}

export function buildReflexionRoutePath(collectionId: number): string {
  return `/collections/${collectionId}/reflexion`;
}

export type BuildReflexionRouteFromNodeOptions = {
  /** Pré-sélectionne une suite dans l’éditeur (`?groupeId=`). */
  groupeId?: number;
};

/** Vue suites logiques depuis le graphe : bouton retour vers `/node` (query `from=node`). */
export function buildReflexionRoutePathFromNode(
  collectionId: number,
  options?: BuildReflexionRouteFromNodeOptions,
): string {
  const params = new URLSearchParams();
  params.set("from", "node");
  if (options?.groupeId != null) params.set("groupeId", String(options.groupeId));
  const q = params.toString();
  return `/collections/${collectionId}/reflexion?${q}`;
}
