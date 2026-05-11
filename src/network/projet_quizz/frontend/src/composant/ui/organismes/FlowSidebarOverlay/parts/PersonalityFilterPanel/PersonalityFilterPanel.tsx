import { GripVertical, Search } from "lucide-preact";
import {
  personaliteImportanceAccentHex,
  personaliteImportanceBucket,
} from "../../../../../../lib/collectionHierarchyVis";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import {
  PERSONALITE_BUCKET_LABEL_FR,
  PERSONALITE_FILTER_BUCKET_ORDER,
  personalityFilterChipHex,
} from "./PersonalityFilterPanel.metier";
import { PERSONALITY_FILTER_PANEL_STYLES } from "./PersonalityFilterPanel.styles";
import type { PersonalityFilterPanelProps } from "./PersonalityFilterPanel.types";

/**
 * Panneau : recherche, filtres par importance (couleurs Collections / bandeaux personnalité), liste draggables.
 */
export function PersonalityFilterPanel(props: PersonalityFilterPanelProps) {
  const { data, actions } = props;

  return (
    <div class="flex min-h-0 flex-col gap-2">
      <label class={FLOW_SIDEBAR_OVERLAY_STYLES.searchLabel}>
        <Search size={14} aria-hidden />
        <input
          type="search"
          class={FLOW_SIDEBAR_OVERLAY_STYLES.searchInput}
          placeholder="Rechercher une personnalité ou une collection…"
          value={data.search}
          onInput={(event) => actions.setSearch((event.target as HTMLInputElement).value)}
        />
      </label>

      <div class={FLOW_SIDEBAR_OVERLAY_STYLES.levelRow} role="group" aria-label="Filtrer par niveau d importance">
        {PERSONALITE_FILTER_BUCKET_ORDER.map((bucket) => {
          const hex = personalityFilterChipHex(bucket);
          return (
            <button
              key={bucket}
              type="button"
              class={PERSONALITY_FILTER_PANEL_STYLES.bucketChip(data.isBucketActive(bucket))}
              aria-pressed={data.isBucketActive(bucket)}
              title={PERSONALITE_BUCKET_LABEL_FR[bucket]}
              onClick={() => actions.toggleBucket(bucket)}
            >
              <span
                class={PERSONALITY_FILTER_PANEL_STYLES.bucketDot}
                style={{ backgroundColor: hex }}
                aria-hidden
              />
              <span class="text-xs font-medium text-base-content/90">{PERSONALITE_BUCKET_LABEL_FR[bucket]}</span>
            </button>
          );
        })}
      </div>

      <div class="flex min-h-0 flex-col gap-2 overflow-y-auto">
        {data.rows.length === 0 ? (
          <p class={PERSONALITY_FILTER_PANEL_STYLES.emptyState}>
            Aucune personnalité liée aux collections chargées. Associe des personnalités depuis l écran Collections.
          </p>
        ) : null}
        {data.rows.map((row) => {
          const accentHex = personaliteImportanceAccentHex(row.importanceType);
          return (
            <div
              key={row.id}
              class={`${FLOW_SIDEBAR_OVERLAY_STYLES.dragItem} ${PERSONALITY_FILTER_PANEL_STYLES.rowLeftAccent}`}
              style={{ borderLeftColor: accentHex }}
              draggable
              onDragStart={(event) =>
                actions.onDragStart(event as unknown as DragEvent, "personalityNode", {
                  label: row.label,
                  importanceType: row.importanceType,
                  personaliteId: row.personaliteId,
                  collectionLabel: row.collectionLabel,
                  collectionId: row.collectionId,
                  ficheCollectionId: row.ficheCollectionId,
                })
              }
            >
              <GripVertical size={16} class={FLOW_SIDEBAR_OVERLAY_STYLES.grip} aria-hidden />
              <div class="min-w-0 flex-1">
                <span class={FLOW_SIDEBAR_OVERLAY_STYLES.collectionLabel}>{row.label}</span>
                <span class="mt-0.5 block truncate text-[10px] text-base-content/55">{row.collectionLabel}</span>
              </div>
              <span
                class="badge badge-sm shrink-0 border font-mono text-[10px] font-semibold capitalize"
                style={{ borderColor: accentHex, color: accentHex, backgroundColor: "transparent" }}
              >
                {PERSONALITE_BUCKET_LABEL_FR[personaliteImportanceBucket(row.importanceType)]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
