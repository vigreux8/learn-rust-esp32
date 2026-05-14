import { ChevronDown, GripVertical, Pencil, Search, Trash2 } from "lucide-preact";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { cn } from "../../../../../../lib/cn";
import { collectionTreeBorderHexForDepth } from "../../../../../../lib/collectionHierarchyVis";
import { MarkdownViewer } from "../../../../atomes/MarkdownViewer";
import { normalizeQuestionNodeMovePayload, readReactFlowDnDFromEvent } from "../../FlowSidebarOverlay.metier";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import type { QuestionListGroup, QuestionListPanelProps } from "./QuestionListPanel.types";

type QuestionListRow = QuestionListGroup["items"][number];

type SelectionAnchor = { collectionId: number; index: number };

function defaultDetailsOpenForCollection(collectionId: number, expandId: number | null): boolean {
  if (expandId == null) return false;
  return collectionId === expandId;
}

type MovedQuestionFlash = NonNullable<QuestionListPanelProps["data"]["movedQuestionHighlight"]>;

/**
 * Ajuste scrollTop pour que `child` soit visible dans `container` (sans scrollIntoView sur la ligne).
 */
function scrollRegionToRevealChildEdge(container: HTMLElement, child: HTMLElement, margin: number): void {
  const cRect = container.getBoundingClientRect();
  const rRect = child.getBoundingClientRect();
  if (rRect.top < cRect.top + margin) {
    container.scrollTop -= cRect.top + margin - rRect.top;
  } else if (rRect.bottom > cRect.bottom - margin) {
    container.scrollTop += rRect.bottom - (cRect.bottom - margin);
  }
}

function scrollMovedQuestionRowIntoView(flash: MovedQuestionFlash): void {
  const row = document.querySelector(
    `[data-moved-question-row="${String(flash.token)}"]`,
  ) as HTMLElement | null;
  if (row == null) return;
  const details = row.closest("details");
  const outer = row.closest("[data-question-list-outer-scroll]");
  if (details == null || outer == null || !(outer instanceof HTMLElement)) return;

  const inner = details.querySelector<HTMLElement>(
    `[data-question-collection-body="${String(flash.collectionId)}"]`,
  );
  const margin = 8;
  const summary = details.querySelector("summary");
  const outerAnchor = summary instanceof HTMLElement ? summary : (details as HTMLElement);
  scrollRegionToRevealChildEdge(outer, outerAnchor, margin);
  if (inner != null && inner.contains(row)) {
    scrollRegionToRevealChildEdge(inner, row, margin);
  }
}

function rowCollectionIdForQuestion(groups: QuestionListGroup[], questionId: number): number | null {
  for (const g of groups) {
    for (const it of g.items) {
      if (Number(it.id) === questionId) return g.collectionId;
    }
  }
  return null;
}

/**
 * Si la ligne glissée est dans la sélection, retourne toutes les questions sélectionnées
 * de la même collection ; sinon une seule question.
 */
function collectDragQuestionIds(
  dragged: { questionId: number; collectionId: number },
  selected: ReadonlySet<number>,
  groups: QuestionListGroup[],
): number[] {
  const { questionId, collectionId } = dragged;
  if (!(selected.size > 0 && selected.has(questionId))) {
    return [questionId];
  }
  const acc: number[] = [];
  for (const qid of selected) {
    if (rowCollectionIdForQuestion(groups, qid) === collectionId) acc.push(qid);
  }
  const unique = [...new Set(acc)].sort((a, b) => a - b);
  return unique.length > 0 ? unique : [questionId];
}

function flashIdSet(flash: MovedQuestionFlash, collectionId: number): Set<number> | null {
  if (flash.collectionId !== collectionId) return null;
  if (flash.questionIds != null && flash.questionIds.length > 0) {
    return new Set(flash.questionIds.map((x) => Number(x)));
  }
  return new Set<number>([flash.questionId]);
}

/**
 * Panneau : recherche et accordéons par collection (`category`) avec questions draggables.
 * Maj+clic : plage dans un même bloc. Cmd / Ctrl + clic : bascule une question dans la sélection (sans plage).
 * Glisser-déposer : déplace la sélection (même collection que la ligne glissée).
 */
export function QuestionListPanel(props: QuestionListPanelProps) {
  const { data, actions } = props;
  const [detailsOpenOverride, setDetailsOpenOverride] = useState<Partial<Record<number, boolean>>>(
    {},
  );
  const [dropTargetCollectionId, setDropTargetCollectionId] = useState<number | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<ReadonlySet<number>>(() => new Set());
  const anchorRef = useRef<SelectionAnchor | null>(null);
  const moveQuestion = actions.onMoveQuestionToCollection;
  const editQuestion = actions.onEditQuestionInSidebar;
  const deleteQuestion = actions.onDeleteQuestionInSidebar;
  const showQuestionRowActions = editQuestion != null || deleteQuestion != null;

  const visibleQuestionIds = useMemo(() => {
    const s = new Set<number>();
    for (const g of data.groups) {
      for (const it of g.items) s.add(Number(it.id));
    }
    return s;
  }, [data.groups]);

  useEffect(() => {
    setDetailsOpenOverride({});
  }, [data.detailsExpandCollectionId]);

  /** Recherche vidée : on repasse sur le seul défaut graphe (`detailsExpandCollectionId`) sans vieux `false` qui bloquerait le dépliage. */
  useEffect(() => {
    if (data.search.trim().length === 0) {
      setDetailsOpenOverride({});
    }
  }, [data.search]);

  useEffect(() => {
    setSelectedQuestionIds((prev) => {
      let changed = false;
      const next = new Set<number>();
      for (const id of prev) {
        if (visibleQuestionIds.has(id)) next.add(id);
        else changed = true;
      }
      if (!changed && next.size === prev.size) return prev;
      return next;
    });
  }, [visibleQuestionIds]);

  useEffect(() => {
    if (moveQuestion == null) return;
    const clearDrop = () => setDropTargetCollectionId(null);
    document.addEventListener("dragend", clearDrop);
    return () => document.removeEventListener("dragend", clearDrop);
  }, [moveQuestion]);

  useLayoutEffect(() => {
    const flash = data.movedQuestionHighlight;
    if (flash == null) return;
    setDetailsOpenOverride((prev) => ({ ...prev, [flash.collectionId]: true }));
    const run = () => {
      scrollMovedQuestionRowIntoView(flash);
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, [data.movedQuestionHighlight]);

  const handleQuestionRowClick = useCallback(
    (event: MouseEvent, group: QuestionListGroup, item: QuestionListRow) => {
      const qid = Number(item.id);
      const idx = group.items.findIndex((x) => x.id === item.id);
      if (idx < 0) return;

      /** Cmd (macOS) ou Ctrl (Windows / habituel) : ajouter ou retirer une seule question, sans plage. */
      if (event.metaKey || event.ctrlKey) {
        event.preventDefault();
        setSelectedQuestionIds((prev) => {
          const next = new Set(prev);
          if (next.has(qid)) next.delete(qid);
          else next.add(qid);
          return next;
        });
        anchorRef.current = { collectionId: group.collectionId, index: idx };
        return;
      }

      if (event.shiftKey && anchorRef.current?.collectionId === group.collectionId) {
        const anchorIdx = anchorRef.current.index;
        const lo = Math.min(anchorIdx, idx);
        const hi = Math.max(anchorIdx, idx);
        const next = new Set<number>();
        for (let i = lo; i <= hi; i++) next.add(Number(group.items[i].id));
        setSelectedQuestionIds(next);
        return;
      }

      setSelectedQuestionIds(new Set([qid]));
      anchorRef.current = { collectionId: group.collectionId, index: idx };
    },
    [],
  );

  return (
    <div class="flex min-h-0 flex-1 flex-col gap-2">
      <label class={`shrink-0 ${FLOW_SIDEBAR_OVERLAY_STYLES.searchLabel}`}>
        <Search size={14} aria-hidden />
        <input
          type="search"
          class={FLOW_SIDEBAR_OVERLAY_STYLES.searchInput}
          placeholder="Rechercher dans les intitulés des questions…"
          value={data.search}
          onInput={(event) => actions.setSearch((event.target as HTMLInputElement).value)}
        />
      </label>

      <div
        data-question-list-outer-scroll
        class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain"
        onDragLeave={(event) => {
          if (moveQuestion == null) return;
          const rel = event.relatedTarget as Node | null;
          if (rel != null && (event.currentTarget as HTMLElement).contains(rel)) return;
          setDropTargetCollectionId(null);
        }}
      >
        {data.groups.length === 0 ? (
          <p class="rounded-lg border border-base-content/10 bg-base-200/40 px-3 py-6 text-center text-xs text-base-content/60">
            Aucune collection dans ce périmètre ; ajoute des nœuds collection ou question sur le graphe, ou élargis
            la sélection.
          </p>
        ) : null}
        {data.groups.map((group) => {
          const { collectionId, treeDepth: depth } = group;
          const accentHex = collectionTreeBorderHexForDepth(depth);
          const sectionKey = String(collectionId);
          const flash = data.movedQuestionHighlight;
          const flashIds = flash != null ? flashIdSet(flash, collectionId) : null;
          const override = detailsOpenOverride[collectionId];
          const hasActiveSearch = data.search.trim().length > 0;
          const collectionHasSearchHit = hasActiveSearch && group.items.length > 0;
          const defaultOpen = defaultDetailsOpenForCollection(
            collectionId,
            data.detailsExpandCollectionId,
          );
          /** Repli explicite d’abord ; sinon déplier toutes les collections avec au moins un match ; sinon override / défaut graphe. */
          const isOpen =
            override === false
              ? false
              : collectionHasSearchHit
                ? true
                : override === true
                  ? true
                  : defaultOpen;
          return (
            <details
              key={sectionKey}
              class={cn(
                FLOW_SIDEBAR_OVERLAY_STYLES.questionCollectionDetails,
                FLOW_SIDEBAR_OVERLAY_STYLES.questionListCollectionDepthStripe,
                moveQuestion != null && dropTargetCollectionId === collectionId
                  ? FLOW_SIDEBAR_OVERLAY_STYLES.questionCollectionDropOver
                  : undefined,
              )}
              style={{ borderLeftColor: accentHex }}
              open={isOpen}
              onToggle={(event) => {
                const target = event.currentTarget as HTMLDetailsElement;
                setDetailsOpenOverride((prev) => ({ ...prev, [collectionId]: target.open }));
              }}
              onDragOver={
                moveQuestion != null
                  ? (event) => {
                      event.preventDefault();
                      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
                      setDropTargetCollectionId(collectionId);
                    }
                  : undefined
              }
              onDragLeave={
                moveQuestion != null
                  ? (event) => {
                      const rel = event.relatedTarget as Node | null;
                      const root = event.currentTarget as HTMLElement;
                      if (rel != null && root.contains(rel)) return;
                      setDropTargetCollectionId((cur) => (cur === collectionId ? null : cur));
                    }
                  : undefined
              }
              onDrop={
                moveQuestion != null
                  ? (event) => {
                      event.preventDefault();
                      setDropTargetCollectionId(null);
                      const parsed = readReactFlowDnDFromEvent(event as unknown as DragEvent);
                      if (parsed?.type !== "questionNode") return;
                      const { fromCollectionId, questionIds } = normalizeQuestionNodeMovePayload(parsed.data);
                      if (questionIds.length === 0 || fromCollectionId == null) return;
                      const toCollectionId = collectionId;
                      if (fromCollectionId === toCollectionId) return;
                      void moveQuestion({
                        questionId: questionIds[0],
                        fromCollectionId,
                        toCollectionId,
                        ...(questionIds.length > 1 ? { questionIds } : {}),
                      })
                        .then(() => {
                          setSelectedQuestionIds(new Set());
                          anchorRef.current = null;
                        })
                        .catch(() => {
                          /* erreur déjà signalée côté page */
                        });
                    }
                  : undefined
              }
            >
              <summary class={FLOW_SIDEBAR_OVERLAY_STYLES.questionCollectionSummary}>
                <ChevronDown
                  size={16}
                  class="shrink-0 opacity-60 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
                <span class="min-w-0 flex-1" style={{ color: accentHex }}>
                  {group.category}
                </span>
              </summary>
              <div
                data-question-collection-body={String(collectionId)}
                class={cn(
                  FLOW_SIDEBAR_OVERLAY_STYLES.questionListScrollInner,
                  group.items.length === 0 && moveQuestion != null
                    ? FLOW_SIDEBAR_OVERLAY_STYLES.questionListScrollInnerEmptyDropTarget
                    : undefined,
                )}
              >
                {group.items.length === 0 ? (
                  <p
                    class="px-2 py-3 text-center text-[11px] italic"
                    style={{ color: accentHex }}
                  >
                    <span class="opacity-65">
                      {data.search.trim().length > 0 && group.totalQuestionCount > 0
                        ? "Aucune question ne correspond à ta recherche dans cette collection."
                        : "Aucune question dans cette collection."}
                    </span>
                  </p>
                ) : (
                  group.items.map((item: QuestionListRow) => {
                    const qNum = Number(item.id);
                    const isPostMoveFlash = flashIds != null && flashIds.has(qNum);
                    const isSelected = selectedQuestionIds.has(qNum);
                    return (
                    <div
                      key={item.id}
                      data-moved-question-row={isPostMoveFlash && flash != null ? String(flash.token) : undefined}
                      class={cn(
                        FLOW_SIDEBAR_OVERLAY_STYLES.dragItem,
                        isPostMoveFlash ? FLOW_SIDEBAR_OVERLAY_STYLES.questionRowPostMove : undefined,
                        isSelected ? FLOW_SIDEBAR_OVERLAY_STYLES.questionRowSelected : undefined,
                      )}
                      draggable
                      onDragStart={(event) => {
                        const ids = collectDragQuestionIds(
                          { questionId: qNum, collectionId: item.collectionId },
                          selectedQuestionIds,
                          data.groups,
                        );
                        actions.onDragStart(event as unknown as DragEvent, "questionNode", {
                          title: item.title,
                          questionId: qNum,
                          collectionId: item.collectionId,
                          ...(ids.length > 1 ? { questionIds: ids } : {}),
                        });
                      }}
                    >
                      <GripVertical
                        size={16}
                        class={`${FLOW_SIDEBAR_OVERLAY_STYLES.grip} mt-0.5 shrink-0`}
                        aria-hidden
                      />
                      <div
                        class={cn(
                          FLOW_SIDEBAR_OVERLAY_STYLES.questionRowMain,
                          "cursor-pointer select-none",
                        )}
                        onClick={(event) => handleQuestionRowClick(event as unknown as MouseEvent, group, item)}
                      >
                        <div
                          class={`min-w-0 flex-1 ${FLOW_SIDEBAR_OVERLAY_STYLES.questionTitleMarkdown}`}
                        >
                          <MarkdownViewer data={{ content: item.title }} />
                        </div>
                        {showQuestionRowActions ? (
                          <div
                            class={FLOW_SIDEBAR_OVERLAY_STYLES.questionRowActions}
                            onMouseDown={(event) => event.stopPropagation()}
                          >
                            {editQuestion != null ? (
                              <button
                                type="button"
                                class={FLOW_SIDEBAR_OVERLAY_STYLES.questionRowActionBtn}
                                draggable={false}
                                aria-label="Modifier la question"
                                title="Modifier"
                                onClick={() => editQuestion(Number(item.id))}
                              >
                                <Pencil size={13} strokeWidth={2} aria-hidden />
                              </button>
                            ) : null}
                            {deleteQuestion != null ? (
                              <button
                                type="button"
                                class={FLOW_SIDEBAR_OVERLAY_STYLES.questionRowActionBtn}
                                draggable={false}
                                aria-label="Supprimer la question"
                                title="Supprimer"
                                onClick={() => void deleteQuestion(Number(item.id))}
                              >
                                <Trash2 size={13} strokeWidth={2} aria-hidden />
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
