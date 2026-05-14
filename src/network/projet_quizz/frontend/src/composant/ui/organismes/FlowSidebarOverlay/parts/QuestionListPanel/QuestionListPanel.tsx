import { ChevronDown, Search } from "lucide-preact";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { cn } from "../../../../../../lib/cn";
import { collectionTreeBorderHexForDepth } from "../../../../../../lib/collectionHierarchyVis";
import { MarkdownViewer } from "../../../../atomes/MarkdownViewer";
import {
  normalizeQuestionNodeMovePayload,
  normalizeReflexionGroupeNodeMovePayload,
  readReactFlowDnDFromEvent,
} from "../../FlowSidebarOverlay.metier";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import { QuestionListDraggableRow } from "../QuestionListDraggableRow";
import {
  collectDragBundleForRow,
  reduceSidebarListRowClick,
  type SidebarListAnchor,
} from "./QuestionListPanel.interactions.metier";
import type { QuestionListGroup, QuestionListPanelProps } from "./QuestionListPanel.types";

type QuestionListRow = QuestionListGroup["items"][number];

function defaultDetailsOpenForCollection(collectionId: number, expandId: number | null): boolean {
  if (expandId == null) return false;
  return collectionId === expandId;
}

type MovedQuestionFlash = NonNullable<QuestionListPanelProps["data"]["movedQuestionHighlight"]>;

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
  if (details instanceof HTMLDetailsElement && !details.open) {
    details.open = true;
  }

  const outer = row.closest("[data-question-list-outer-scroll]") as HTMLElement | null;
  if (outer == null) return;

  const margin = 8;
  scrollRegionToRevealChildEdge(outer, row, margin);

  const inner = document.querySelector(
    `[data-question-collection-body="${String(flash.collectionId)}"]`,
  ) as HTMLElement | null;
  if (inner != null && inner.contains(row)) {
    scrollRegionToRevealChildEdge(inner, row, margin);
  }
}

function flashIdSet(flash: MovedQuestionFlash, collectionId: number): Set<number> | null {
  if (flash.collectionId !== collectionId) return null;
  if (flash.questionIds != null && flash.questionIds.length > 0) {
    return new Set(flash.questionIds.map((x) => Number(x)));
  }
  return new Set<number>([flash.questionId]);
}

/**
 * Panneau : recherche et accordéons par collection (`category`) avec questions et suites logiques draggables.
 * Maj+clic : plage dans un même bloc. Cmd / Ctrl + clic : bascule dans la sélection (sans plage).
 * Glisser-déposer : déplace la sélection (même collection que la ligne glissée).
 */
export function QuestionListPanel(props: QuestionListPanelProps) {
  const { data, actions } = props;
  const hasTitleSearch = data.search.trim().length > 0;
  const hasCategoryFilter =
    data.categoryFilter.selectedParentId != null || data.categoryFilter.selectedEnfantId != null;
  const hasListFilter = hasTitleSearch || hasCategoryFilter;
  const [detailsOpenOverride, setDetailsOpenOverride] = useState<Partial<Record<number, boolean>>>(
    {},
  );
  const [dropTargetCollectionId, setDropTargetCollectionId] = useState<number | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<ReadonlySet<number>>(() => new Set());
  const [selectedGroupeIds, setSelectedGroupeIds] = useState<ReadonlySet<number>>(() => new Set());
  const anchorQuestionsRef = useRef<SidebarListAnchor | null>(null);
  const anchorGroupesRef = useRef<SidebarListAnchor | null>(null);
  const moveQuestion = actions.onMoveQuestionToCollection;
  const moveGroupe = actions.onMoveGroupeToCollection;
  const canDropSidebar = moveQuestion != null || moveGroupe != null;
  const editQuestion = actions.onEditQuestionInSidebar;
  const deleteQuestion = actions.onDeleteQuestionInSidebar;
  const deleteGroupe = actions.onDeleteGroupeInSidebar;
  const openReflexionEditor = actions.onOpenReflexionEditorForCollection;
  const showQuestionRowActions = editQuestion != null || deleteQuestion != null;
  const showGroupeRowActions = openReflexionEditor != null || deleteGroupe != null;

  const visibleQuestionIds = useMemo(() => {
    const s = new Set<number>();
    for (const g of data.groups) {
      for (const it of g.items) s.add(Number(it.id));
    }
    return s;
  }, [data.groups]);

  const visibleGroupeIds = useMemo(() => {
    const s = new Set<number>();
    for (const g of data.groups) {
      for (const it of g.reflexionGroupes) s.add(it.groupeId);
    }
    return s;
  }, [data.groups]);

  useEffect(() => {
    setDetailsOpenOverride({});
  }, [data.detailsExpandCollectionId]);

  useEffect(() => {
    if (!hasListFilter) {
      setDetailsOpenOverride({});
    }
  }, [hasListFilter]);

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
    setSelectedGroupeIds((prev) => {
      let changed = false;
      const next = new Set<number>();
      for (const id of prev) {
        if (visibleGroupeIds.has(id)) next.add(id);
        else changed = true;
      }
      if (!changed && next.size === prev.size) return prev;
      return next;
    });
  }, [visibleGroupeIds]);

  useEffect(() => {
    if (!canDropSidebar) return;
    const clearDrop = () => setDropTargetCollectionId(null);
    document.addEventListener("dragend", clearDrop);
    return () => document.removeEventListener("dragend", clearDrop);
  }, [canDropSidebar]);

  const mainListScrollRef = useRef<HTMLDivElement>(null);
  const gutterScrollRef = useRef<HTMLDivElement>(null);
  const scrollSyncLockRef = useRef(false);
  const [gutterTrackHeightPx, setGutterTrackHeightPx] = useState(1);

  const updateGutterTrackHeight = useCallback(() => {
    const el = mainListScrollRef.current;
    if (el == null) return;
    setGutterTrackHeightPx(Math.max(1, el.scrollHeight));
  }, []);

  useLayoutEffect(() => {
    updateGutterTrackHeight();
  }, [updateGutterTrackHeight, data.groups, data.search, hasListFilter, detailsOpenOverride]);

  useLayoutEffect(() => {
    const el = mainListScrollRef.current;
    if (el == null) return;
    const ro = new ResizeObserver(() => {
      updateGutterTrackHeight();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateGutterTrackHeight]);

  useLayoutEffect(() => {
    const main = mainListScrollRef.current;
    const gutter = gutterScrollRef.current;
    if (main == null || gutter == null) return;
    scrollSyncLockRef.current = true;
    gutter.scrollTop = main.scrollTop;
    scrollSyncLockRef.current = false;
  }, [gutterTrackHeightPx]);

  const onMainListScroll = useCallback(() => {
    if (scrollSyncLockRef.current) return;
    const main = mainListScrollRef.current;
    const gutter = gutterScrollRef.current;
    if (main == null || gutter == null) return;
    scrollSyncLockRef.current = true;
    gutter.scrollTop = main.scrollTop;
    scrollSyncLockRef.current = false;
  }, []);

  const onGutterScroll = useCallback(() => {
    if (scrollSyncLockRef.current) return;
    const main = mainListScrollRef.current;
    const gutter = gutterScrollRef.current;
    if (main == null || gutter == null) return;
    scrollSyncLockRef.current = true;
    main.scrollTop = gutter.scrollTop;
    scrollSyncLockRef.current = false;
  }, []);

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
      const idx = group.items.findIndex((x) => x.id === item.id);
      if (idx < 0) return;
      const { nextSelected, nextAnchor } = reduceSidebarListRowClick({
        event,
        collectionId: group.collectionId,
        rowIndex: idx,
        listLength: group.items.length,
        getIdAtIndex: (i) => Number(group.items[i].id),
        prevSelected: selectedQuestionIds,
        prevAnchor: anchorQuestionsRef.current,
      });
      setSelectedQuestionIds(nextSelected);
      anchorQuestionsRef.current = nextAnchor;
    },
    [selectedQuestionIds],
  );

  const handleGroupeRowClick = useCallback(
    (event: MouseEvent, group: QuestionListGroup, groupeId: number) => {
      const idx = group.reflexionGroupes.findIndex((x) => x.groupeId === groupeId);
      if (idx < 0) return;
      const { nextSelected, nextAnchor } = reduceSidebarListRowClick({
        event,
        collectionId: group.collectionId,
        rowIndex: idx,
        listLength: group.reflexionGroupes.length,
        getIdAtIndex: (i) => group.reflexionGroupes[i].groupeId,
        prevSelected: selectedGroupeIds,
        prevAnchor: anchorGroupesRef.current,
      });
      setSelectedGroupeIds(nextSelected);
      anchorGroupesRef.current = nextAnchor;
    },
    [selectedGroupeIds],
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
        class={FLOW_SIDEBAR_OVERLAY_STYLES.questionCategoryFilterBlock}
        role="toolbar"
        aria-label="Filtrer par type et sous-type de question"
      >
        <p class={FLOW_SIDEBAR_OVERLAY_STYLES.questionCategoryFilterSectionTitle}>Type</p>
        <div
          class={FLOW_SIDEBAR_OVERLAY_STYLES.questionCategoryFilterChipRow}
          role="group"
          aria-label="Catégorie parente"
        >
          {data.categoryFilter.parentChips.map((chip) => {
            const active = data.categoryFilter.selectedParentId === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                class={cn(
                  FLOW_SIDEBAR_OVERLAY_STYLES.questionCategoryFilterChip,
                  active ? FLOW_SIDEBAR_OVERLAY_STYLES.questionCategoryFilterChipActive : undefined,
                )}
                aria-pressed={active}
                title={
                  active
                    ? `Retirer « ${chip.label} » du filtre (cliquer à nouveau pour tout afficher)`
                    : chip.title
                }
                onClick={() => actions.toggleParentCategory(chip.id)}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
        {data.categoryFilter.enfantChips.length > 0 ? (
          <div class="mt-1 flex flex-col gap-1">
            <p class={FLOW_SIDEBAR_OVERLAY_STYLES.questionCategoryFilterSectionTitle}>
              Sous-types (selon le type)
            </p>
            <div
              class={FLOW_SIDEBAR_OVERLAY_STYLES.questionCategoryFilterChipRow}
              role="group"
              aria-label="Sous-catégories pour le type sélectionné"
            >
              {data.categoryFilter.enfantChips.map((chip) => {
                const active = data.categoryFilter.selectedEnfantId === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    class={cn(
                      FLOW_SIDEBAR_OVERLAY_STYLES.questionCategoryFilterChip,
                      "max-w-22 truncate font-medium",
                      active ? FLOW_SIDEBAR_OVERLAY_STYLES.questionCategoryFilterChipActive : undefined,
                    )}
                    aria-pressed={active}
                    title={
                      active
                        ? `Retirer le filtre sous-type « ${chip.label} »`
                        : chip.title
                    }
                    onClick={() => actions.toggleEnfantCategory(chip.id)}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div
        class="flex min-h-0 min-w-0 flex-1 flex-row"
        onDragLeave={(event) => {
          if (!canDropSidebar) return;
          const rel = event.relatedTarget as Node | null;
          const root = event.currentTarget as HTMLElement;
          if (rel != null && root.contains(rel)) return;
          setDropTargetCollectionId(null);
        }}
      >
        <div
          ref={mainListScrollRef}
          data-question-list-outer-scroll
          class={FLOW_SIDEBAR_OVERLAY_STYLES.questionListMainColumn}
          onScroll={onMainListScroll}
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
          const collectionHasFilterHit =
            hasListFilter && (group.items.length > 0 || group.reflexionGroupes.length > 0);
          const defaultOpen = defaultDetailsOpenForCollection(
            collectionId,
            data.detailsExpandCollectionId,
          );
          const isOpen =
            override === false
              ? false
              : collectionHasFilterHit
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
                canDropSidebar && dropTargetCollectionId === collectionId
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
                canDropSidebar
                  ? (event) => {
                      event.preventDefault();
                      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
                      setDropTargetCollectionId(collectionId);
                    }
                  : undefined
              }
              onDragLeave={
                canDropSidebar
                  ? (event) => {
                      const rel = event.relatedTarget as Node | null;
                      const root = event.currentTarget as HTMLElement;
                      if (rel != null && root.contains(rel)) return;
                      setDropTargetCollectionId((cur) => (cur === collectionId ? null : cur));
                    }
                  : undefined
              }
              onDrop={
                canDropSidebar
                  ? (event) => {
                      event.preventDefault();
                      setDropTargetCollectionId(null);
                      const parsed = readReactFlowDnDFromEvent(event as unknown as DragEvent);
                      if (parsed == null) return;
                      const toCollectionId = collectionId;

                      if (parsed.type === "questionNode" && moveQuestion != null) {
                        const { fromCollectionId, questionIds } = normalizeQuestionNodeMovePayload(parsed.data);
                        if (questionIds.length === 0 || fromCollectionId == null) return;
                        if (fromCollectionId === toCollectionId) return;
                        void moveQuestion({
                          questionId: questionIds[0],
                          fromCollectionId,
                          toCollectionId,
                          ...(questionIds.length > 1 ? { questionIds } : {}),
                        })
                          .then(() => {
                            setSelectedQuestionIds(new Set());
                            anchorQuestionsRef.current = null;
                          })
                          .catch(() => {
                            /* erreur déjà signalée côté page */
                          });
                        return;
                      }

                      if (parsed.type === "reflexionGroupeNode" && moveGroupe != null) {
                        const { fromCollectionId, groupeIds } = normalizeReflexionGroupeNodeMovePayload(
                          parsed.data,
                        );
                        if (groupeIds.length === 0 || fromCollectionId == null) return;
                        if (fromCollectionId === toCollectionId) return;
                        void moveGroupe({
                          groupeId: groupeIds[0],
                          fromCollectionId,
                          toCollectionId,
                          ...(groupeIds.length > 1 ? { groupeIds } : {}),
                        })
                          .then(() => {
                            setSelectedGroupeIds(new Set());
                            anchorGroupesRef.current = null;
                          })
                          .catch(() => {
                            /* erreur déjà signalée côté page */
                          });
                      }
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
                  group.items.length === 0 &&
                    group.reflexionGroupes.length === 0 &&
                    canDropSidebar
                    ? FLOW_SIDEBAR_OVERLAY_STYLES.questionListScrollInnerEmptyDropTarget
                    : undefined,
                )}
              >
                {group.reflexionGroupes.length > 0 ? (
                  <div class="mb-1 shrink-0 border-b border-base-content/10 px-1 pb-2">
                    <p class={FLOW_SIDEBAR_OVERLAY_STYLES.reflexionSuiteSectionTitle}>Suites logiques</p>
                    <div class="flex flex-col gap-1">
                      {group.reflexionGroupes.map((suite) => {
                        const idsInBlock = new Set(group.reflexionGroupes.map((g) => g.groupeId));
                        const dragIds = collectDragBundleForRow(
                          suite.groupeId,
                          selectedGroupeIds,
                          idsInBlock,
                        );
                        const isSelected = selectedGroupeIds.has(suite.groupeId);
                        return (
                          <QuestionListDraggableRow
                            key={`groupe-${suite.groupeId}`}
                            movedFlashToken={null}
                            isPostMoveFlash={false}
                            isSelected={isSelected}
                            draggable={moveGroupe != null}
                            onDragStart={(event) => {
                              actions.onDragStart(event as unknown as DragEvent, "reflexionGroupeNode", {
                                title: suite.label,
                                groupeId: suite.groupeId,
                                collectionId: group.collectionId,
                                ...(dragIds.length > 1 ? { groupeIds: dragIds } : {}),
                              });
                            }}
                            onMainClick={(event) =>
                              handleGroupeRowClick(event as unknown as MouseEvent, group, suite.groupeId)
                            }
                            title={<span class="text-[11px] font-medium leading-snug">{suite.label}</span>}
                            actions={
                              showGroupeRowActions
                                ? {
                                    onEdit:
                                      openReflexionEditor != null
                                        ? () => openReflexionEditor(group.collectionId, suite.groupeId)
                                        : undefined,
                                    onDelete:
                                      deleteGroupe != null ? () => void deleteGroupe(suite.groupeId) : undefined,
                                    editAriaLabel: `Modifier la suite « ${suite.label} »`,
                                    editTitle: "Ouvrir l’éditeur de suites logiques",
                                    deleteAriaLabel: `Supprimer la suite « ${suite.label} »`,
                                    deleteTitle: "Supprimer la suite logique",
                                  }
                                : null
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {group.items.length === 0 ? (
                  <p
                    class="px-2 py-3 text-center text-[11px] italic"
                    style={{ color: accentHex }}
                  >
                    <span class="opacity-65">
                      {hasListFilter && group.totalQuestionCount > 0
                        ? "Aucune question ne correspond au filtre dans cette collection."
                        : "Aucune question dans cette collection."}
                    </span>
                  </p>
                ) : (
                  group.items.map((item: QuestionListRow) => {
                    const qNum = Number(item.id);
                    const isPostMoveFlash = flashIds != null && flashIds.has(qNum);
                    const isSelected = selectedQuestionIds.has(qNum);
                    const idsInBlock = new Set(group.items.map((it) => Number(it.id)));
                    const dragIds = collectDragBundleForRow(qNum, selectedQuestionIds, idsInBlock);
                    return (
                      <QuestionListDraggableRow
                        key={item.id}
                        movedFlashToken={isPostMoveFlash && flash != null ? flash.token : null}
                        isPostMoveFlash={isPostMoveFlash}
                        isSelected={isSelected}
                        draggable={moveQuestion != null}
                        onDragStart={(event) => {
                          actions.onDragStart(event as unknown as DragEvent, "questionNode", {
                            title: item.title,
                            questionId: qNum,
                            collectionId: item.collectionId,
                            ...(dragIds.length > 1 ? { questionIds: dragIds } : {}),
                          });
                        }}
                        onMainClick={(event) =>
                          handleQuestionRowClick(event as unknown as MouseEvent, group, item)
                        }
                        title={<MarkdownViewer data={{ content: item.title }} />}
                        actions={
                          showQuestionRowActions
                            ? {
                                onEdit: editQuestion != null ? () => editQuestion(Number(item.id)) : undefined,
                                onDelete:
                                  deleteQuestion != null ? () => void deleteQuestion(Number(item.id)) : undefined,
                                editAriaLabel: "Modifier la question",
                                deleteAriaLabel: "Supprimer la question",
                              }
                            : null
                        }
                      />
                    );
                  })
                )}
              </div>
            </details>
          );
        })}
        </div>
        <div
          ref={gutterScrollRef}
          class={FLOW_SIDEBAR_OVERLAY_STYLES.questionListScrollGutter}
          onScroll={onGutterScroll}
          aria-label="Défilement de la liste des collections"
          title="Faire défiler la liste des collections sans passer sur les questions (glisser-déposer)"
        >
          <div
            aria-hidden
            class="pointer-events-none w-px shrink-0"
            style={{ minHeight: "100%", height: `${gutterTrackHeightPx}px` }}
          />
        </div>
      </div>
    </div>
  );
}
