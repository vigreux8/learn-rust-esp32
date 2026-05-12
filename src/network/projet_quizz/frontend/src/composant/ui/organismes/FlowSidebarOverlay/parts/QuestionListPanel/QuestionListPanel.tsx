import { ChevronDown, GripVertical, Search } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";
import { cn } from "../../../../../../lib/cn";
import { collectionTreeBorderHexForDepth } from "../../../../../../lib/collectionHierarchyVis";
import { readReactFlowDnDFromEvent } from "../../../../../../lib/reactFlowDnD";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import type { QuestionListPanelProps } from "./QuestionListPanel.types";

function defaultDetailsOpenForCollection(collectionId: number, expandId: number | null): boolean {
  if (expandId == null) return false;
  return collectionId === expandId;
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
          const isOpen =
            detailsOpenOverride[collectionId] ??
            defaultDetailsOpenForCollection(collectionId, data.detailsExpandCollectionId);
          return (
            <details
              key={sectionKey}
              class={cn(
                FLOW_SIDEBAR_OVERLAY_STYLES.questionCollectionDetails,
                FLOW_SIDEBAR_OVERLAY_STYLES.questionListCollectionDepthStripe,
              )}
              style={{ borderLeftColor: accentHex }}
              open={isOpen}
              onToggle={(event) => {
                const target = event.currentTarget as HTMLDetailsElement;
                setDetailsOpenOverride((prev) => ({ ...prev, [collectionId]: target.open }));
              }}
            >
              <summary
                class={cn(
                  FLOW_SIDEBAR_OVERLAY_STYLES.questionCollectionSummary,
                  moveQuestion != null && dropTargetCollectionId === collectionId
                    ? FLOW_SIDEBAR_OVERLAY_STYLES.questionCollectionSummaryDropOver
                    : undefined,
                )}
                onDragOver={
                  moveQuestion != null
                    ? (event) => {
                        event.preventDefault();
                        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
                        setDropTargetCollectionId(collectionId);
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
                <ChevronDown
                  size={16}
                  class="shrink-0 opacity-60 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
                <span class="min-w-0 flex-1" style={{ color: accentHex }}>
                  {group.category}
                </span>
              </summary>
              <div class={FLOW_SIDEBAR_OVERLAY_STYLES.questionListScrollInner}>
                {group.items.length === 0 ? (
                  <p
                    class="px-2 py-3 text-center text-[11px] italic"
                    style={{ color: accentHex }}
                  >
                    <span class="opacity-65">Aucune question dans cette collection.</span>
                  </p>
                ) : (
                  group.items.map((item) => (
                    <div
                      key={item.id}
                      class={FLOW_SIDEBAR_OVERLAY_STYLES.dragItem}
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
                  ))
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
