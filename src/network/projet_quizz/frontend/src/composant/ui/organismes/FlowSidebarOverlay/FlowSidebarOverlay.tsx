import { X } from "lucide-preact";
import { useFlowSidebarOverlay } from "./FlowSidebarOverlay.hook";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "./FlowSidebarOverlay.styles";
import type { FlowSidebarOverlayProps } from "./FlowSidebarOverlay.types";
import { CollectionFilterPanel } from "./parts/CollectionFilterPanel";
import { QuestionListPanel } from "./parts/QuestionListPanel";
import { SidebarRail } from "./parts/SidebarRail";

/**
 * Overlay flottant : rail d’icônes + panneau filtre collections ou liste questions / collection.
 */
export function FlowSidebarOverlay(props: FlowSidebarOverlayProps) {
  const { rail, panneau, collections, questions, drag } = useFlowSidebarOverlay(props);
  const panelOpen = panneau.activeTab !== null;
  const panelTitle =
    panneau.activeTab === "collections"
      ? "Filtrer collections"
      : panneau.activeTab === "questions"
        ? "Questions par collection"
        : "";

  return (
    <div class={FLOW_SIDEBAR_OVERLAY_STYLES.overlayWrapper}>
      <SidebarRail data={{ activeTab: rail.activeTab }} actions={{ toggleTab: rail.toggleTab }} />

      {panelOpen ? (
        <aside class={FLOW_SIDEBAR_OVERLAY_STYLES.panel}>
          <div class={FLOW_SIDEBAR_OVERLAY_STYLES.panelHeader}>
            <h2 class={FLOW_SIDEBAR_OVERLAY_STYLES.panelTitle}>{panelTitle}</h2>
            <button
              type="button"
              class="btn btn-circle btn-ghost btn-xs"
              aria-label="Fermer le panneau"
              onClick={panneau.closePanel}
            >
              <X size={14} aria-hidden />
            </button>
          </div>

          <div class={FLOW_SIDEBAR_OVERLAY_STYLES.panelBody}>
            {panneau.activeTab === "collections" ? (
              <CollectionFilterPanel
                data={{
                  search: collections.search,
                  rows: collections.rows,
                  isLevelActive: collections.isLevelActive,
                }}
                actions={{
                  setSearch: collections.setSearch,
                  toggleLevel: collections.toggleLevel,
                  onDragStart: drag.onDragStart,
                }}
              />
            ) : null}

            {panneau.activeTab === "questions" ? (
              <QuestionListPanel
                data={{ search: questions.search, groups: questions.groups }}
                actions={{ setSearch: questions.setSearch, onDragStart: drag.onDragStart }}
              />
            ) : null}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
