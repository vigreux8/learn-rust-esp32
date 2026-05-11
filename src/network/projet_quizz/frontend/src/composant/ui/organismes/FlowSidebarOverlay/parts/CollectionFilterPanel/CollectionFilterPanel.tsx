import { GripVertical, Search } from "lucide-preact";
import {
  FLOW_SIDEBAR_OVERLAY_STYLES,
  flowSidebarLevelBadgeClass,
  flowSidebarLevelFilterButtonClass,
} from "../../FlowSidebarOverlay.styles";
import type { CollectionFilterPanelProps } from "./CollectionFilterPanel.types";

const LEVELS = [1, 2, 3] as const;

/**
 * Panneau : recherche, filtres par niveau, liste de collections glissables vers le canvas.
 */
export function CollectionFilterPanel(props: CollectionFilterPanelProps) {
  const { data, actions } = props;

  return (
    <div class="flex min-h-0 flex-col gap-2">
      <label class={FLOW_SIDEBAR_OVERLAY_STYLES.searchLabel}>
        <Search size={14} aria-hidden />
        <input
          type="search"
          class={FLOW_SIDEBAR_OVERLAY_STYLES.searchInput}
          placeholder="Rechercher une collection…"
          value={data.search}
          onInput={(event) => actions.setSearch((event.target as HTMLInputElement).value)}
        />
      </label>

      <div class={FLOW_SIDEBAR_OVERLAY_STYLES.levelRow} role="group" aria-label="Filtrer par niveau">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            class={flowSidebarLevelFilterButtonClass(data.isLevelActive(level))}
            onClick={() => actions.toggleLevel(level)}
          >
            <span class={flowSidebarLevelBadgeClass(level)}>niv. {level}</span>
          </button>
        ))}
        <span class="badge badge-sm badge-accent">auteur</span>
      </div>

      <div class="flex min-h-0 flex-col gap-2 overflow-y-auto">
        {data.rows.map((row) => (
          <div
            key={row.id}
            class={FLOW_SIDEBAR_OVERLAY_STYLES.dragItem}
            draggable
            onDragStart={(event) =>
              actions.onDragStart(event as unknown as DragEvent, "collectionNode", {
                label: row.label,
              })
            }
          >
            <GripVertical size={16} class={FLOW_SIDEBAR_OVERLAY_STYLES.grip} aria-hidden />
            <span class={FLOW_SIDEBAR_OVERLAY_STYLES.collectionLabel}>{row.label}</span>
            <span class={flowSidebarLevelBadgeClass(row.level)}>niv. {row.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
