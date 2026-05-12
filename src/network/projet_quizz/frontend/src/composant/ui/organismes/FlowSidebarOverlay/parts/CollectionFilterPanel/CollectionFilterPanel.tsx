import { GitBranch, GripVertical, Search } from "lucide-preact";
import { COLLECTION_TREE_LEVEL_BORDER_HEX } from "../../../../../../lib/collectionHierarchyVis";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import {
  FLOW_COLLECTION_PALETTE_BUCKET_INDICES,
  flowCollectionPaletteHexForDepth,
} from "./CollectionFilterPanel.metier";
import { COLLECTION_FILTER_PANEL_STYLES } from "./CollectionFilterPanel.styles";
import type { CollectionFilterPanelProps } from "./CollectionFilterPanel.types";

/**
 * Panneau : recherche, filtres par bande de couleur (profondeur arbre), liste des collections API.
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

      <div class={FLOW_SIDEBAR_OVERLAY_STYLES.levelRow} role="group" aria-label="Filtrer par profondeur (couleur carte)">
        {FLOW_COLLECTION_PALETTE_BUCKET_INDICES.map((bucket) => {
          const hex = COLLECTION_TREE_LEVEL_BORDER_HEX[bucket];
          return (
            <button
              key={bucket}
              type="button"
              class={COLLECTION_FILTER_PANEL_STYLES.depthChip(data.isPaletteBucketActive(bucket))}
              title={`Même couleur de bord que les cartes « niveau ${bucket + 1} » (profondeur ${bucket === COLLECTION_TREE_LEVEL_BORDER_HEX.length - 1 ? `${bucket}+` : String(bucket)})`}
              aria-pressed={data.isPaletteBucketActive(bucket)}
              onClick={() => actions.togglePaletteBucket(bucket)}
            >
              <span
                class={COLLECTION_FILTER_PANEL_STYLES.depthDot}
                style={{ backgroundColor: hex }}
                aria-hidden
              />
              <span class={COLLECTION_FILTER_PANEL_STYLES.depthLabel}>Couleur {bucket + 1}</span>
            </button>
          );
        })}
      </div>

      <div class="flex min-h-0 flex-col gap-2 overflow-y-auto">
        {data.rows.length === 0 ? (
          <p class={COLLECTION_FILTER_PANEL_STYLES.emptyState}>
            Aucune collection à afficher (chargement ou liste vide). Les données viennent de l’API comme sur la page
            Collections.
          </p>
        ) : null}
        {data.rows.map((row) => {
          const accentHex = flowCollectionPaletteHexForDepth(row.treeDepth);
          return (
            <div
              key={row.id}
              class={`${FLOW_SIDEBAR_OVERLAY_STYLES.dragItem} ${COLLECTION_FILTER_PANEL_STYLES.rowLeftAccent}`}
              style={{ borderLeftColor: accentHex }}
              onClick={
                actions.onShowCollectionOnGraph != null
                  ? () => actions.onShowCollectionOnGraph?.(row)
                  : undefined
              }
              title={
                actions.onShowCollectionOnGraph != null
                  ? "Cliquer ou bouton branche pour afficher la hiérarchie ; glisser pour poser un nœud sur le graphe."
                  : undefined
              }
              draggable
              onDragStart={(event) =>
                actions.onDragStart(event as unknown as DragEvent, "collectionNode", {
                  label: row.label,
                  collectionId: row.collectionId,
                })
              }
            >
              <GripVertical size={16} class={FLOW_SIDEBAR_OVERLAY_STYLES.grip} aria-hidden />
              <span class={FLOW_SIDEBAR_OVERLAY_STYLES.collectionLabel}>{row.label}</span>
              <span
                class="badge badge-sm shrink-0 border font-mono text-[10px] font-semibold"
                style={{ borderColor: accentHex, color: accentHex, backgroundColor: "transparent" }}
              >
                prof. {row.treeDepth}
              </span>
              {actions.onShowCollectionOnGraph != null ? (
                <button
                  type="button"
                  class="btn btn-ghost btn-xs shrink-0 nodrag"
                  aria-label={`Afficher la branche « ${row.label} » sur le graphe`}
                  title="Afficher ancêtres et sous-arbre sur le graphe"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    actions.onShowCollectionOnGraph?.(row);
                  }}
                >
                  <GitBranch class="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
