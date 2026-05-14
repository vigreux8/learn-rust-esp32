/**
 * Sélection Maj / Cmd+clic et regroupement des ids pour drag (questions ou suites logiques).
 */

export type SidebarListAnchor = { collectionId: number; index: number };

export type SidebarListClickReduceArgs = {
  event: Pick<MouseEvent, "metaKey" | "ctrlKey" | "shiftKey" | "preventDefault">;
  collectionId: number;
  rowIndex: number;
  listLength: number;
  getIdAtIndex: (i: number) => number;
  prevSelected: ReadonlySet<number>;
  prevAnchor: SidebarListAnchor | null;
};

export type SidebarListClickReduceResult = {
  nextSelected: Set<number>;
  nextAnchor: SidebarListAnchor | null;
};

/**
 * Réduit un clic sur une ligne numérotée (ids stables) : plage Maj dans le même bloc, toggle Cmd.
 */
export function reduceSidebarListRowClick(args: SidebarListClickReduceArgs): SidebarListClickReduceResult {
  const { event, collectionId, rowIndex, listLength, getIdAtIndex, prevSelected, prevAnchor } = args;
  if (rowIndex < 0 || rowIndex >= listLength) {
    return { nextSelected: new Set(prevSelected), nextAnchor: prevAnchor };
  }
  const rowId = getIdAtIndex(rowIndex);

  if (event.metaKey || event.ctrlKey) {
    event.preventDefault();
    const next = new Set(prevSelected);
    if (next.has(rowId)) next.delete(rowId);
    else next.add(rowId);
    return { nextSelected: next, nextAnchor: { collectionId, index: rowIndex } };
  }

  if (event.shiftKey && prevAnchor?.collectionId === collectionId) {
    const anchorIdx = prevAnchor.index;
    const lo = Math.min(anchorIdx, rowIndex);
    const hi = Math.max(anchorIdx, rowIndex);
    const next = new Set<number>();
    for (let i = lo; i <= hi; i++) next.add(getIdAtIndex(i));
    return { nextSelected: next, nextAnchor: prevAnchor };
  }

  return { nextSelected: new Set([rowId]), nextAnchor: { collectionId, index: rowIndex } };
}

/**
 * Si la ligne glissée est dans la sélection, retourne tous les ids sélectionnés du même périmètre ; sinon une seule ligne.
 */
export function collectDragBundleForRow<T extends number>(
  draggedId: T,
  selected: ReadonlySet<T>,
  idsInSameBlockAsDragged: ReadonlySet<T>,
): T[] {
  if (!(selected.size > 0 && selected.has(draggedId))) {
    return [draggedId];
  }
  const acc: T[] = [];
  for (const id of selected) {
    if (idsInSameBlockAsDragged.has(id)) acc.push(id);
  }
  const unique = [...new Set(acc)].sort((a, b) => Number(a) - Number(b));
  return unique.length > 0 ? unique : [draggedId];
}
