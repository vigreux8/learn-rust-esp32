import { GitBranch, GripVertical, Search } from "lucide-preact";
import { COLLECTION_TREE_LEVEL_BORDER_HEX } from "../../../../../../lib/collectionHierarchyVis";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import type { FlowSidebarCollectionRow } from "../../FlowSidebarOverlay.types";
import {
  FLOW_COLLECTION_PALETTE_BUCKET_INDICES,
  flowCollectionPaletteHexForDepth,
  ORPHAN_COLLECTION_ACCENT_HEX,
} from "./CollectionFilterPanel.metier";
import { COLLECTION_FILTER_PANEL_STYLES } from "./CollectionFilterPanel.styles";
import type { CollectionFilterPanelProps } from "./CollectionFilterPanel.types";

type RowItemProps = {
  row: FlowSidebarCollectionRow;
  accentHex: string;
  badgeLabel: string;
  actions: CollectionFilterPanelProps["actions"];
};

function CollectionFilterRowItem(props: RowItemProps) {
  const { row, accentHex, badgeLabel, actions } = props;
  return (
    <div
      key={row.id}
      class={`${FLOW_SIDEBAR_OVERLAY_STYLES.dragItem} ${COLLECTION_FILTER_PANEL_STYLES.rowLeftAccent}`}
      style={{ borderLeftColor: accentHex }}
      onClick={
        actions.onShowCollectionOnGraph != null ? () => actions.onShowCollectionOnGraph?.(row) : undefined
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
        {badgeLabel}
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
}

/**
 * Panneau : recherche, filtres par bande de couleur (profondeur arbre), liste des collections API.
 */
export function CollectionFilterPanel(props: CollectionFilterPanelProps) {
  const { data, actions } = props;
  const orphanRows = data.orphanRows ?? [];
  const listIsEmpty = data.rows.length === 0 && orphanRows.length === 0;

  return (
    <div class="flex min-h-0 flex-1 flex-col gap-2">
      <label class={`shrink-0 ${FLOW_SIDEBAR_OVERLAY_STYLES.searchLabel}`}>
        <Search size={14} aria-hidden />
        <input
          type="search"
          class={FLOW_SIDEBAR_OVERLAY_STYLES.searchInput}
          placeholder="Rechercher une collection…"
          value={data.search}
          onInput={(event) => actions.setSearch((event.target as HTMLInputElement).value)}
        />
      </label>

      <div class={`shrink-0 ${FLOW_SIDEBAR_OVERLAY_STYLES.levelRow}`} role="group" aria-label="Filtrer par profondeur (couleur carte)">
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

      <div class="nodrag nowheel flex min-h-0 flex-1 flex-col gap-2 touch-pan-y overflow-y-auto overscroll-y-contain">
        {listIsEmpty ? (
          <p class={COLLECTION_FILTER_PANEL_STYLES.emptyState}>
            Aucune collection à afficher (chargement ou liste vide). Les données viennent de l’API comme sur la page
            Collections.
          </p>
        ) : null}

        {orphanRows.length > 0 ? (
          <div class="flex flex-col gap-1.5">
            <p class={COLLECTION_FILTER_PANEL_STYLES.sectionLabel} id="flow-sidebar-orphan-collections-label">
              Sans parent ni enfant (orphelines)
            </p>
            <div class="flex flex-col gap-2" role="list" aria-labelledby="flow-sidebar-orphan-collections-label">
              {orphanRows.map((row) => (
                <CollectionFilterRowItem
                  key={`orphan-${row.id}`}
                  row={row}
                  accentHex={ORPHAN_COLLECTION_ACCENT_HEX}
                  badgeLabel="Orpheline"
                  actions={actions}
                />
              ))}
            </div>
          </div>
        ) : null}

        {orphanRows.length > 0 && data.rows.length > 0 ? (
          <p class={COLLECTION_FILTER_PANEL_STYLES.sectionLabel} id="flow-sidebar-hierarchy-collections-label">
            Autres collections
          </p>
        ) : null}

        {data.rows.length > 0 ? (
          <div
            class="flex flex-col gap-2"
            role="list"
            aria-label={orphanRows.length > 0 ? "Autres collections" : "Collections"}
          >
            {data.rows.map((row) => {
              const accentHex = flowCollectionPaletteHexForDepth(row.treeDepth);
              return (
                <CollectionFilterRowItem
                  key={row.id}
                  row={row}
                  accentHex={accentHex}
                  badgeLabel={`prof. ${row.treeDepth}`}
                  actions={actions}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
