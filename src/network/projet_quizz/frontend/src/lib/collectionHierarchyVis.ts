import type { CollectionPersonnaliteRef, CollectionUi } from "../types/quizz";

/** Couleurs de contour carte par profondeur parent → enfants (niveau 0 = racine). */
export const COLLECTION_TREE_LEVEL_BORDER_HEX = [
  "#9333B3",
  "#F5A623",
  "#F7D147",
  "#D1BCB2",
] as const;

/**
 * Indice de palette (bord carte / légende) pour une profondeur d’arbre, comme sur les cartes collections.
 */
export function collectionTreePaletteBucket(treeDepth: number): number {
  return Math.min(Math.max(treeDepth, 0), COLLECTION_TREE_LEVEL_BORDER_HEX.length - 1);
}

/**
 * Couleur de bord carte collections / nœud graphe pour une profondeur d’arbre
 * (alias des cartes Collections et du filtre graphe).
 */
export function collectionTreeBorderHexForDepth(treeDepth: number): string {
  return COLLECTION_TREE_LEVEL_BORDER_HEX[collectionTreePaletteBucket(treeDepth)];
}

/** Contours des bandeaux personnalité (auteur vs secondaire). */
export const COLLECTION_PERSONNALITE_BORDER = {
  auteur: "#38D19F",
  secondaire: "#49C5E3",
} as const;

/**
 * Accents par niveau d’importance (filtre sidebar graphe, pastilles).
 * Pionnier / important partagent le même groupe « auteur » sur les cartes Collections mais sont distingués ici.
 */
export const PERSONNALITE_IMPORTANCE_ACCENT_HEX = {
  pionnier: "#38D19F",
  important: "#F5A623",
  secondaire: "#49C5E3",
  sans: "#94a3b8",
} as const;

export type PersonaliteImportanceBucket = keyof typeof PERSONNALITE_IMPORTANCE_ACCENT_HEX;

export function personaliteImportanceBucket(
  importanceType: string | null | undefined,
): PersonaliteImportanceBucket {
  if (importanceType === "secondaire") return "secondaire";
  if (importanceType === "important") return "important";
  if (importanceType === "pionnier") return "pionnier";
  return "sans";
}

export function personaliteImportanceAccentHex(importanceType: string | null | undefined): string {
  return PERSONNALITE_IMPORTANCE_ACCENT_HEX[personaliteImportanceBucket(importanceType)];
}

/**
 * Calcule la profondeur d’une collection dans l’arbre (nombre de liens parent remontés).
 */
export function computeTreeDepth(collection: CollectionUi, byId: Map<number, CollectionUi>): number {
  let d = 0;
  let pid: number | null | undefined = collection.parent_collection_id ?? null;
  const seen = new Set<number>([collection.id]);
  while (pid != null) {
    if (seen.has(pid)) break;
    seen.add(pid);
    d += 1;
    pid = byId.get(pid)?.parent_collection_id ?? null;
  }
  return d;
}

/**
 * Ordre parent puis enfants (préfixe), en ne considérant que les ids présents dans `filtered`.
 */
export function orderCollectionsHierarchy(filtered: CollectionUi[]): CollectionUi[] {
  if (filtered.length === 0) return [];
  const inSet = new Set(filtered.map((c) => c.id));
  const parentOf = (c: CollectionUi) => c.parent_collection_id ?? null;
  const isRoot = (c: CollectionUi) => {
    const p = parentOf(c);
    return p == null || !inSet.has(p);
  };
  const childrenOf = (parentId: number) =>
    filtered.filter((c) => parentOf(c) === parentId).sort((a, b) => a.id - b.id);

  const roots = filtered.filter(isRoot).sort((a, b) => a.id - b.id);
  const out: CollectionUi[] = [];
  const walk = (c: CollectionUi) => {
    out.push(c);
    for (const ch of childrenOf(c.id)) walk(ch);
  };
  for (const r of roots) walk(r);
  return out;
}

/** Secondaire affiché après les profils « auteur » (pionnier / important / sans type). */
export function sortPersonnalitesForDisplay(
  list: CollectionPersonnaliteRef[],
): CollectionPersonnaliteRef[] {
  const rank = (t: string | null) => (t === "secondaire" ? 1 : 0);
  return [...list].sort((a, b) => {
    const d = rank(a.importance_type) - rank(b.importance_type);
    return d !== 0 ? d : a.id - b.id;
  });
}

export function personnaliteStripBorderHex(importanceType: string | null | undefined): string {
  if (importanceType === "secondaire") return COLLECTION_PERSONNALITE_BORDER.secondaire;
  return COLLECTION_PERSONNALITE_BORDER.auteur;
}

/** Référence minimale pour parcourir l’arbre parent → enfants (filtres sidebar, etc.). */
export type CollectionParentRef = {
  id: number;
  parent_collection_id?: number | null;
};

/**
 * Tous les ids de collections descendantes de `rootId` (sans inclure `rootId`).
 */
export function collectDescendantCollectionIds(
  rootId: number,
  collections: readonly CollectionParentRef[],
): Set<number> {
  const childrenByParent = new Map<number, number[]>();
  for (const c of collections) {
    const p = c.parent_collection_id ?? null;
    if (p == null) continue;
    const arr = childrenByParent.get(p);
    if (arr) arr.push(c.id);
    else childrenByParent.set(p, [c.id]);
  }
  const out = new Set<number>();
  const stack = [...(childrenByParent.get(rootId) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (out.has(id)) continue;
    out.add(id);
    const ch = childrenByParent.get(id);
    if (ch) for (const x of ch) stack.push(x);
  }
  return out;
}

/**
 * `rootId` et toutes ses collections descendantes (personnalités liées à cette branche).
 */
export function collectSubtreeCollectionIds(
  rootId: number,
  collections: readonly CollectionParentRef[],
): Set<number> {
  const descendants = collectDescendantCollectionIds(rootId, collections);
  const out = new Set(descendants);
  out.add(rootId);
  return out;
}
