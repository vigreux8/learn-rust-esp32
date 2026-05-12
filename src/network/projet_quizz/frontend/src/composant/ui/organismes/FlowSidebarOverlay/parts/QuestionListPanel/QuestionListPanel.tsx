import { ChevronDown, GripVertical, Search } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";
import { collectionTreeBorderHexForDepth } from "../../../../../../lib/collectionHierarchyVis";
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

  useEffect(() => {
    setDetailsOpenOverride({});
  }, [data.detailsExpandCollectionId]);

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

      <div class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain">
        {data.groups.length === 0 ? (
          <p class="rounded-lg border border-base-content/10 bg-base-200/40 px-3 py-6 text-center text-xs text-base-content/60">
            Aucune question correspondante à ta recherche ; essaie un autre mot-clé ou vérifie les filtres de la
            sélection sur le graphe.
          </p>
        ) : null}
        {data.groups.map((group) => {
          const first = group.items[0];
          const depth = first?.treeDepth;
          const accentHex = depth != null ? collectionTreeBorderHexForDepth(depth) : null;
          const collectionId = first?.collectionId;
          const sectionKey = String(collectionId ?? group.category);
          const isOpen =
            typeof collectionId === "number"
              ? (detailsOpenOverride[collectionId] ??
                defaultDetailsOpenForCollection(collectionId, data.detailsExpandCollectionId))
              : false;
          return (
            <details
              key={sectionKey}
              class={FLOW_SIDEBAR_OVERLAY_STYLES.questionCollectionDetails}
              open={isOpen}
              onToggle={(event) => {
                const target = event.currentTarget as HTMLDetailsElement;
                const id = group.items[0]?.collectionId;
                if (typeof id !== "number") return;
                setDetailsOpenOverride((prev) => ({ ...prev, [id]: target.open }));
              }}
            >
              <summary class={FLOW_SIDEBAR_OVERLAY_STYLES.questionCollectionSummary}>
                <ChevronDown
                  size={16}
                  class="shrink-0 opacity-60 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
                <span
                  class="min-w-0 flex-1 text-primary"
                  style={accentHex ? { color: accentHex } : undefined}
                >
                  {group.category}
                </span>
              </summary>
              <div class={FLOW_SIDEBAR_OVERLAY_STYLES.questionListScrollInner}>
                {group.items.map((item) => (
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
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
