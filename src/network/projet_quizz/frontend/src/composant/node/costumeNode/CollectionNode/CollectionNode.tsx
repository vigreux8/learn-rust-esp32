import { Handle, Position } from "@xyflow/react";
import { FileJson, ListOrdered, ListTree, Play, User, Hash, CirclePlus } from "lucide-preact";
import { route } from "preact-router";
import { cn } from "../../../../lib/cn";
import { collectionTreeBorderHexForDepth } from "../../../../lib/collectionHierarchyVis";
import { useNodeViewGraphActions } from "../../../../lib/nodeViewGraphActionsContext";
import { Button } from "../../../ui/atomes/Button/Button";
import {
  buildQuestionsRoutePath,
  buildReflexionRoutePath,
} from "../../../ui/molecules/CollectionCard/CollectionCard.metier";
import type { CollectionTagRef } from "../../../ui/molecules/CollectionCard/CollectionCard.types";
import { useCollectionNode } from "./CollectionNode.hook";
import { COLLECTION_NODE_STYLES } from "./CollectionNode.styles";
import type { CollectionItem, CollectionNodeProps } from "./CollectionNode.types";
import { CollectionPanel } from "./parts/CollectionPanel/CollectionPanel";
import { CreatorPanel } from "./parts/CreatorPanel/CreatorPanel";

function tagRefsFromSupercollections(items: CollectionItem[]): CollectionTagRef[] {
  return items
    .map((t) => {
      const id = Number(t.id);
      if (!Number.isFinite(id)) return null;
      return { id, nom: t.label };
    })
    .filter((x): x is CollectionTagRef => x != null);
}

export function CollectionNode(props: CollectionNodeProps) {
  const { layout, content, supercollectionsPanel, creatorPanel, actions, dnd, graphPlay } = useCollectionNode(props);
  const { isConnectable, data } = props;
  const graphActions = useNodeViewGraphActions();
  const collectionApiId = typeof data.collectionId === "number" ? data.collectionId : null;
  const treeDepthAccentHex =
    data.treeDepth !== undefined && data.treeDepth !== null
      ? collectionTreeBorderHexForDepth(data.treeDepth)
      : null;
  const apiHierarchyOrphan = collectionApiId != null && data.isHierarchyOrphan === true;
  const orphanBorderHex = "#94a3b8";
  const showLeftDepthStripe = apiHierarchyOrphan || treeDepthAccentHex != null;
  const nodeCardLeftStyle = apiHierarchyOrphan
    ? { borderLeftColor: orphanBorderHex }
    : treeDepthAccentHex
      ? { borderLeftColor: treeDepthAccentHex }
      : undefined;

  return (
    <div
      class={COLLECTION_NODE_STYLES.wrapper}
      onDragOver={dnd.nodeSurface.onDragOver}
      onDragOverCapture={dnd.nodeSurface.onDragOverCapture}
      onDrop={dnd.nodeSurface.onDrop}
    >
      <div class={COLLECTION_NODE_STYLES.coreColumn}>
        {layout.isExpanded ? (
          <div class={COLLECTION_NODE_STYLES.panelsFloating}>
            <CollectionPanel
              data={supercollectionsPanel.data}
              settings={supercollectionsPanel.settings}
              status={supercollectionsPanel.status}
              actions={supercollectionsPanel.actions}
            />
            <CreatorPanel
              data={creatorPanel.data}
              settings={creatorPanel.settings}
              status={creatorPanel.status}
              actions={creatorPanel.actions}
            />
          </div>
        ) : null}

        <div
          class={cn(
            COLLECTION_NODE_STYLES.nodeCard,
            apiHierarchyOrphan ? COLLECTION_NODE_STYLES.nodeCardOrphan : undefined,
            showLeftDepthStripe ? "border-l-4" : undefined,
          )}
          style={nodeCardLeftStyle}
          title={
            apiHierarchyOrphan
              ? "Collection sans parent ni enfant en base : relie-la en tirant une arête du bas d’une collection parente vers ce nœud."
              : undefined
          }
        >
          <div class={COLLECTION_NODE_STYLES.topStrip} aria-hidden />
          <Handle
            type="target"
            position={Position.Top}
            id="h-left"
            isConnectable={isConnectable}
            className={`${COLLECTION_NODE_STYLES.handleOnBarHalf} !left-0`}
          />
          <Handle
            type="target"
            position={Position.Top}
            id="h-right"
            isConnectable={isConnectable}
            className={`${COLLECTION_NODE_STYLES.handleOnBarHalf} !left-1/2`}
          />

          <div class={COLLECTION_NODE_STYLES.mainBar}>
            <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              {graphPlay.showToggle ? (
                <label
                  class={COLLECTION_NODE_STYLES.playIncludeToggle}
                  title="Inclure les questions de cette collection dans le paquet quand tu lances une partie depuis le graphe"
                >
                  <input
                    type="checkbox"
                    class="checkbox checkbox-primary checkbox-xs nodrag"
                    checked={graphPlay.included}
                    onChange={graphPlay.onToggleIncluded}
                    aria-label="Inclure les questions de cette collection au jeu depuis le graphe"
                  />
                </label>
              ) : null}
              <button
                type="button"
                class={COLLECTION_NODE_STYLES.buttonIconCollections}
                onClick={layout.toggle}
                aria-label="Basculer panneau supercollections"
              >
                <Hash class="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              </button>

              <h3 class={cn(COLLECTION_NODE_STYLES.title, apiHierarchyOrphan ? COLLECTION_NODE_STYLES.titleOrphan : undefined)}>
                {content.title}
              </h3>
            </div>

            <div class="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                class={COLLECTION_NODE_STYLES.buttonIconCreators}
                onClick={layout.toggle}
                aria-label="Basculer panneau influenceurs"
              >
                <User class="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              </button>
              <button type="button" class={COLLECTION_NODE_STYLES.playButton} onClick={actions.onPlay} aria-label="Lancer">
                <Play class="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current ml-0.5" aria-hidden />
              </button>
            </div>
          </div>

          {collectionApiId != null ? (
            <div class={COLLECTION_NODE_STYLES.actionsRow}>
              <Button
                variant="outline"
                class="btn-xs gap-1.5 bg-base-100 hover:bg-base-200/50 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  route(
                    buildQuestionsRoutePath(
                      collectionApiId,
                      tagRefsFromSupercollections(data.supercollections ?? []),
                      { fromNode: true },
                    ),
                  );
                }}
              >
                <ListTree class="h-3.5 w-3.5 text-base-content/70" aria-hidden />
                Questions
              </Button>
              {data.isMine === true ? (
                <Button
                  variant="outline"
                  class="btn-xs gap-1.5 bg-base-100 hover:bg-base-200/50 shadow-sm"
                  title="Créer une question"
                  onClick={(e) => {
                    e.stopPropagation();
                    graphActions?.openCreateQuestionModalForCollection(collectionApiId);
                  }}
                >
                  <CirclePlus class="h-3.5 w-3.5 text-base-content/70" aria-hidden />
                  Créer
                </Button>
              ) : null}
              {data.isMine === true && (data.questionCount ?? 0) > 0 ? (
                <Button
                  variant="outline"
                  class="btn-xs gap-1.5 bg-base-100 hover:bg-base-200/50 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    route(buildReflexionRoutePath(collectionApiId));
                  }}
                >
                  <ListOrdered class="h-3.5 w-3.5 text-base-content/70" aria-hidden />
                  Suite logique
                </Button>
              ) : null}
              <Button
                variant="learn"
                class="btn-xs gap-1.5 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  graphActions?.openLlmImportForCollection(collectionApiId);
                }}
              >
                <FileJson class="h-3.5 w-3.5" aria-hidden />
                Import LLM
              </Button>
            </div>
          ) : null}

          <div class={COLLECTION_NODE_STYLES.bottomStrip} aria-hidden />
          <Handle
            type="source"
            position={Position.Bottom}
            id="output"
            isConnectable={isConnectable}
            className={COLLECTION_NODE_STYLES.handleOnBar}
          />
        </div>
      </div>
    </div>
  );
}
