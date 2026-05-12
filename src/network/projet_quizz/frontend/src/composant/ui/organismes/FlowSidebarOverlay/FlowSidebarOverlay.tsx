import { X } from "lucide-preact";
import { useFlowSidebarOverlay } from "./FlowSidebarOverlay.hook";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "./FlowSidebarOverlay.styles";
import type { FlowSidebarCollectionRow, FlowSidebarOverlayProps } from "./FlowSidebarOverlay.types";
import { CollectionFilterPanel } from "./parts/CollectionFilterPanel";
import { CreationShortcutsPanel } from "./parts/CreationShortcutsPanel";
import { PersonalityFilterPanel } from "./parts/PersonalityFilterPanel";
import { QuestionListPanel } from "./parts/QuestionListPanel";
import { SidebarRail } from "./parts/SidebarRail";

/**
 * Overlay flottant : rail d’icônes + panneaux filtre collections, recherche branche, questions, personnalités, création.
 */
export function FlowSidebarOverlay(props: FlowSidebarOverlayProps) {
  const { presentation, actions } = props;
  const { rail, panneau, collections, collectionSubtree, questions, personalities, drag } =
    useFlowSidebarOverlay(props);
  const panelOpen = panneau.activeTab !== null;
  const onShowCollectionSubtreeRow =
    actions?.onShowCollectionSubtreeOnGraph != null
      ? (row: FlowSidebarCollectionRow) => {
          actions.onShowCollectionSubtreeOnGraph?.(row.collectionId);
        }
      : undefined;
  const panelTitle =
    panneau.activeTab === "collections"
      ? "Filtrer collections"
      : panneau.activeTab === "collectionSubtree"
        ? "Recherche branches collections"
        : panneau.activeTab === "questions"
          ? "Questions par collection"
          : panneau.activeTab === "personalities"
            ? "Personnalités"
            : panneau.activeTab === "create"
              ? "Créer sur le graphe"
              : "";

  return (
    <div class={FLOW_SIDEBAR_OVERLAY_STYLES.overlayWrapper}>
      <SidebarRail data={{ activeTab: rail.activeTab }} actions={{ toggleTab: rail.toggleTab }} />

      {panelOpen ? (
        <aside class={FLOW_SIDEBAR_OVERLAY_STYLES.panel}>
          <div class={FLOW_SIDEBAR_OVERLAY_STYLES.panelHeader}>
            <div class="min-w-0 flex-1">
              <h2 class={FLOW_SIDEBAR_OVERLAY_STYLES.panelTitle}>{panelTitle}</h2>
              {panneau.activeTab === "questions" && presentation?.questionsPanelHint != null ? (
                <p class="mt-1 text-[10px] font-normal normal-case tracking-normal text-base-content/65">
                  {presentation.questionsPanelHint}
                </p>
              ) : null}
            </div>
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
                  isPaletteBucketActive: collections.isPaletteBucketActive,
                }}
                actions={{
                  setSearch: collections.setSearch,
                  togglePaletteBucket: collections.togglePaletteBucket,
                  onDragStart: drag.onDragStart,
                }}
              />
            ) : null}

            {panneau.activeTab === "collectionSubtree" ? (
              <CollectionFilterPanel
                data={{
                  search: collectionSubtree.search,
                  rows: collectionSubtree.rows,
                  isPaletteBucketActive: collectionSubtree.isPaletteBucketActive,
                }}
                actions={{
                  setSearch: collectionSubtree.setSearch,
                  togglePaletteBucket: collectionSubtree.togglePaletteBucket,
                  onDragStart: drag.onDragStart,
                  onShowCollectionOnGraph: onShowCollectionSubtreeRow,
                }}
              />
            ) : null}

            {panneau.activeTab === "questions" ? (
              <QuestionListPanel
                data={{
                  search: questions.search,
                  groups: questions.groups,
                  detailsExpandCollectionId: presentation?.questionsDetailsExpandCollectionId ?? null,
                }}
                actions={{
                  setSearch: questions.setSearch,
                  onDragStart: drag.onDragStart,
                  onMoveQuestionToCollection: actions?.onMoveQuestionToCollection,
                }}
              />
            ) : null}

            {panneau.activeTab === "personalities" ? (
              <PersonalityFilterPanel
                data={{
                  search: personalities.search,
                  rows: personalities.rows,
                  collectionOptions: personalities.collectionOptions,
                  branchRootCollectionId: personalities.branchRootCollectionId,
                }}
                actions={{
                  setSearch: personalities.setSearch,
                  setBranchRootCollectionId: personalities.setBranchRootCollectionId,
                  onDragStart: drag.onDragStart,
                }}
              />
            ) : null}

            {panneau.activeTab === "create" ? (
              <CreationShortcutsPanel actions={{ onDragStart: drag.onDragStart }} />
            ) : null}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
