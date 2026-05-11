import { GripVertical, Search } from "lucide-preact";
import {
  personaliteImportanceAccentHex,
  personaliteImportanceBucket,
} from "../../../../../../lib/collectionHierarchyVis";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import {
  PERSONALITE_BUCKET_LABEL_FR,
  personalityRowAccentBucketHex,
} from "./PersonalityFilterPanel.metier";
import { PERSONALITY_FILTER_PANEL_STYLES } from "./PersonalityFilterPanel.styles";
import type { PersonalityFilterPanelProps } from "./PersonalityFilterPanel.types";

/**
 * Panneau : recherche, filtre par branche collection (parent + descendants), liste draggables.
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

      <label class="flex flex-col gap-1">
        <span class="text-[10px] font-medium uppercase tracking-wide text-base-content/50">
          Branche collection (cette collection + enfants)
        </span>
        <select
          class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100 text-sm"
          value={data.branchRootCollectionId == null ? "" : String(data.branchRootCollectionId)}
          aria-label="Filtrer par branche de collection"
          onChange={(event) => {
            const raw = (event.target as HTMLSelectElement).value;
            actions.setBranchRootCollectionId(raw === "" ? null : Number(raw));
          }}
        >
          <option value="">Toutes les collections</option>
          {data.collectionOptions.map((opt) => (
            <option key={opt.id} value={String(opt.id)}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <div class="flex min-h-0 flex-col gap-2 overflow-y-auto">
        {data.rows.length === 0 ? (
          <p class={PERSONALITY_FILTER_PANEL_STYLES.emptyState}>
            Aucune personnalité pour ce filtre. Associe des personnalités depuis l écran Collections.
          </p>
        ) : null}
        {data.rows.map((row) => {
          const bucket = personaliteImportanceBucket(row.importanceType);
          const accentHex = personaliteImportanceAccentHex(row.importanceType);
          const chipHex = personalityRowAccentBucketHex(bucket);
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
                style={{ borderColor: chipHex, color: chipHex, backgroundColor: "transparent" }}
              >
                {PERSONALITE_BUCKET_LABEL_FR[bucket]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
