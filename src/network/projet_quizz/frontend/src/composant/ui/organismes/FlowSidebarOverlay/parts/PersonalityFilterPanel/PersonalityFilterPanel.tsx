import { FolderOpen, GripVertical, Search } from "lucide-preact";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import { PERSONALITY_FILTER_PANEL_STYLES } from "./PersonalityFilterPanel.styles";
import type { PersonalityFilterPanelProps } from "./PersonalityFilterPanel.types";

/**
 * Panneau : recherche par nom de personnalité, recherche par nom de collection (branche + enfants), liste draggables.
 */
export function PersonalityFilterPanel(props: PersonalityFilterPanelProps) {
  const { data, actions } = props;
  const openQuestionsForFiche = actions.onOpenQuestionsForPersonalityFiche;

  return (
    <div class="flex min-h-0 flex-1 flex-col gap-2">
      <datalist id="quizz-flow-sidebar-personality-name-dl">
        {data.personalityLabelSuggestions.map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>
      <label class={`shrink-0 ${FLOW_SIDEBAR_OVERLAY_STYLES.searchLabel}`}>
        <Search size={14} aria-hidden />
        <input
          type="search"
          class={FLOW_SIDEBAR_OVERLAY_STYLES.searchInput}
          placeholder="Rechercher une personnalité…"
          list="quizz-flow-sidebar-personality-name-dl"
          autoComplete="off"
          value={data.search}
          onInput={(event) => actions.setSearch((event.target as HTMLInputElement).value)}
        />
      </label>

      <datalist id="quizz-flow-sidebar-personality-collection-dl">
        {data.collectionLabelSuggestions.map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>
      <label class={`shrink-0 ${FLOW_SIDEBAR_OVERLAY_STYLES.searchLabel}`}>
        <Search size={14} aria-hidden />
        <input
          type="search"
          class={FLOW_SIDEBAR_OVERLAY_STYLES.searchInput}
          placeholder="Filtrer par nom de collection (cette branche + collections enfants)…"
          list="quizz-flow-sidebar-personality-collection-dl"
          autoComplete="off"
          value={data.collectionSearch}
          onInput={(event) => actions.setCollectionSearch((event.target as HTMLInputElement).value)}
        />
      </label>

      <div class="nodrag nowheel flex min-h-0 flex-1 flex-col gap-2 touch-pan-y overflow-y-auto overscroll-y-contain">
        {data.rows.length === 0 ? (
          <p class={PERSONALITY_FILTER_PANEL_STYLES.emptyState}>
            Aucune personnalité pour ce filtre. Associe des personnalités depuis l’écran Collections.
          </p>
        ) : null}
        {data.rows.map((row) => (
          <div
            key={row.id}
            class={FLOW_SIDEBAR_OVERLAY_STYLES.dragItem}
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
            </div>
            {openQuestionsForFiche != null ? (
              <button
                type="button"
                class="btn btn-square btn-ghost btn-xs h-7 w-7 shrink-0 text-base-content/40 hover:text-base-content"
                draggable={false}
                title="Ouvrir le menu Questions de la fiche personnalité"
                aria-label="Ouvrir le menu Questions de la fiche personnalité"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={() => openQuestionsForFiche(row.ficheCollectionId)}
              >
                <FolderOpen size={15} strokeWidth={2} aria-hidden />
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
