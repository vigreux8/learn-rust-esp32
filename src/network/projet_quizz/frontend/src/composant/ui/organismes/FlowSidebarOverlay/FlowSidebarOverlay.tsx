import { X } from "lucide-preact";
import { useCallback } from "preact/hooks";
import type { RefObject } from "preact";
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
  const { shell, rail, panneau, collections, collectionSubtree, questions, personalities, drag } =
    useFlowSidebarOverlay(props);
  const assignOverlayRef = useCallback(
    (node: HTMLDivElement | null) => {
      (shell.overlayRef as RefObject<HTMLDivElement | null>).current = node;
      const forwarded = presentation?.shellRef;
      if (forwarded != null) forwarded.current = node;
    },
    [shell.overlayRef, presentation?.shellRef],
  );
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
    <div ref={assignOverlayRef} class={FLOW_SIDEBAR_OVERLAY_STYLES.overlayWrapper}>
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
                  orphanRows: collectionSubtree.orphanRows,
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
                  categoryFilter: questions.categoryFilter,
                  detailsExpandCollectionId: presentation?.questionsDetailsExpandCollectionId ?? null,
                  movedQuestionHighlight: presentation?.movedQuestionHighlight ?? null,
                }}
                actions={{
                  setSearch: questions.setSearch,
                  toggleParentCategory: questions.toggleParentCategory,
                  toggleEnfantCategory: questions.toggleEnfantCategory,
                  onDragStart: drag.onDragStart,
                  onMoveQuestionToCollection: actions?.onMoveQuestionToCollection,
                  onMoveGroupeToCollection: actions?.onMoveGroupeToCollection,
                  onEditQuestionInSidebar: actions?.onEditQuestionInSidebar,
                  onDeleteQuestionInSidebar: actions?.onDeleteQuestionInSidebar,
                  onDeleteGroupeInSidebar: actions?.onDeleteGroupeInSidebar,
                  onOpenReflexionEditorForCollection: actions?.onOpenReflexionEditorForCollection,
                }}
              />
            ) : null}

            {panneau.activeTab === "personalities" ? (
              <PersonalityFilterPanel
                data={{
                  search: personalities.search,
                  collectionSearch: personalities.collectionSearch,
                  rows: personalities.rows,
                  personalityLabelSuggestions: personalities.personalityLabelSuggestions,
                  collectionLabelSuggestions: personalities.collectionLabelSuggestions,
                }}
                actions={{
                  setSearch: personalities.setSearch,
                  setCollectionSearch: personalities.setCollectionSearch,
                  onDragStart: drag.onDragStart,
                  onOpenQuestionsForPersonalityFiche: actions?.onOpenQuestionsForPersonalityFiche,
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
