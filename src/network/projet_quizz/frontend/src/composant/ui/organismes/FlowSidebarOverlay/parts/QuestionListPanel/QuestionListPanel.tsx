import { ChevronDown, GripVertical, Search } from "lucide-preact";
import { useEffect, useLayoutEffect, useState } from "preact/hooks";
import { cn } from "../../../../../../lib/cn";
import { collectionTreeBorderHexForDepth } from "../../../../../../lib/collectionHierarchyVis";
import { readReactFlowDnDFromEvent } from "../../../../../../lib/reactFlowDnD";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import type { QuestionListPanelProps } from "./QuestionListPanel.types";

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

/**
 * Panneau : recherche et accordéons par collection (`category`) avec questions draggables.
 */
export function QuestionListPanel(props: QuestionListPanelProps) {
  const { data, actions } = props;
  const [detailsOpenOverride, setDetailsOpenOverride] = useState<Partial<Record<number, boolean>>>(
    {},
  );
  const [dropTargetCollectionId, setDropTargetCollectionId] = useState<number | null>(null);
  const moveQuestion = actions.onMoveQuestionToCollection;

  useEffect(() => {
    setDetailsOpenOverride({});
  }, [data.detailsExpandCollectionId]);

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

  return (
    <div class="flex min-h-0 flex-1 flex-col gap-2">
      <label class={`shrink-0 ${FLOW_SIDEBAR_OVERLAY_STYLES.searchLabel}`}>
        <Search size={14} aria-hidden />
        <input
          type="search"
          class={FLOW_SIDEBAR_OVERLAY_STYLES.searchInput}
          placeholder="Rechercher une question ou une collection…"
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
            Aucune question correspondante à ta recherche ; essaie un autre mot-clé ou vérifie les filtres de la
            sélection sur le graphe.
          </p>
        ) : null}
        {data.groups.map((group) => {
          const { collectionId, treeDepth: depth } = group;
          const accentHex = collectionTreeBorderHexForDepth(depth);
          const sectionKey = String(collectionId);
          const flash = data.movedQuestionHighlight;
          const isOpen =
            detailsOpenOverride[collectionId] ??
            defaultDetailsOpenForCollection(collectionId, data.detailsExpandCollectionId);
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
                      const patch = (parsed.data ?? {}) as {
                        collectionId?: unknown;
                        questionId?: unknown;
                      };
                      const questionId = typeof patch.questionId === "number" ? patch.questionId : null;
                      const fromCollectionId =
                        typeof patch.collectionId === "number" ? patch.collectionId : null;
                      if (questionId == null || fromCollectionId == null) return;
                      const toCollectionId = collectionId;
                      if (fromCollectionId === toCollectionId) return;
                      void moveQuestion({ questionId, fromCollectionId, toCollectionId });
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
                    <span class="opacity-65">Aucune question dans cette collection.</span>
                  </p>
                ) : (
                  group.items.map((item) => {
                    const isPostMoveFlash =
                      flash != null &&
                      flash.collectionId === collectionId &&
                      Number(item.id) === flash.questionId;
                    return (
                    <div
                      key={item.id}
                      data-moved-question-row={isPostMoveFlash ? String(flash.token) : undefined}
                      class={cn(
                        FLOW_SIDEBAR_OVERLAY_STYLES.dragItem,
                        isPostMoveFlash ? FLOW_SIDEBAR_OVERLAY_STYLES.questionRowPostMove : undefined,
                      )}
                      draggable
                      onDragStart={(event) =>
                        actions.onDragStart(event as unknown as DragEvent, "questionNode", {
                          title: item.title,
                          questionId: Number(item.id),
                          collectionId: item.collectionId,
                        })
                      }
                    >
                      <GripVertical size={16} class={FLOW_SIDEBAR_OVERLAY_STYLES.grip} aria-hidden />
                      <span class={FLOW_SIDEBAR_OVERLAY_STYLES.questionTitle}>{item.title}</span>
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
