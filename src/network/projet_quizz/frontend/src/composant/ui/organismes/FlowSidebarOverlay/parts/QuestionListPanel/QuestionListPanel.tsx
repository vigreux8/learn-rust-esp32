import { GripVertical, Search } from "lucide-preact";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import type { QuestionListPanelProps } from "./QuestionListPanel.types";

/**
 * Panneau : recherche et accordéons par collection (`category`) avec questions draggables.
 */
export function QuestionListPanel(props: QuestionListPanelProps) {
  const { data, actions } = props;

  return (
    <div class="flex min-h-0 flex-col gap-2">
      <label class={FLOW_SIDEBAR_OVERLAY_STYLES.searchLabel}>
        <Search size={14} aria-hidden />
        <input
          type="search"
          class={FLOW_SIDEBAR_OVERLAY_STYLES.searchInput}
          placeholder="Rechercher une question ou une collection…"
          value={data.search}
          onInput={(event) => actions.setSearch((event.target as HTMLInputElement).value)}
        />
      </label>

      <div class="flex min-h-0 flex-col gap-2 overflow-y-auto">
        {data.groups.map((group) => (
          <div key={group.category} class={FLOW_SIDEBAR_OVERLAY_STYLES.collapse}>
            <input type="checkbox" defaultChecked aria-label={`Déplier ${group.category}`} />
            <div class={FLOW_SIDEBAR_OVERLAY_STYLES.collapseTitle}>{group.category}</div>
            <div class={FLOW_SIDEBAR_OVERLAY_STYLES.collapseContent}>
              {group.items.map((item) => (
                <div
                  key={item.id}
                  class={FLOW_SIDEBAR_OVERLAY_STYLES.dragItem}
                  draggable
                  onDragStart={(event) =>
                    actions.onDragStart(event as unknown as DragEvent, "questionNode", {
                      title: item.title,
                    })
                  }
                >
                  <GripVertical size={16} class={FLOW_SIDEBAR_OVERLAY_STYLES.grip} aria-hidden />
                  <span class={FLOW_SIDEBAR_OVERLAY_STYLES.questionTitle}>{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
