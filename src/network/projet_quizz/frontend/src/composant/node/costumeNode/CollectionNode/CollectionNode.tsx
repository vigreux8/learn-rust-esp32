import { Handle, Position } from "@xyflow/react";
import { FileJson, ListOrdered, ListTree, Play, User, Hash } from "lucide-preact";
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
  const { layout, content, actions, dnd, graphPlay } = useCollectionNode(props);
  const { isConnectable, data } = props;
  const graphActions = useNodeViewGraphActions();
  const collectionApiId = typeof data.collectionId === "number" ? data.collectionId : null;
  const treeDepthAccentHex =
    data.treeDepth !== undefined && data.treeDepth !== null
      ? collectionTreeBorderHexForDepth(data.treeDepth)
      : null;

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
            <CollectionPanel supercollections={content.supercollections} />
            <CreatorPanel creators={content.creators} />
          </div>
        ) : null}

        <div class={COLLECTION_NODE_STYLES.topStrip} aria-hidden>
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
        </div>

        <div
          class={cn(COLLECTION_NODE_STYLES.mainBar, treeDepthAccentHex ? "border-2" : undefined)}
          style={treeDepthAccentHex ? { borderColor: treeDepthAccentHex } : undefined}
        >
          <div class="flex min-w-0 flex-1 items-center gap-2">
            {graphPlay.showToggle ? (
              <label
                class={COLLECTION_NODE_STYLES.playIncludeToggle}
                title="Inclure les questions de cette collection dans le paquet quand tu lances une partie depuis le graphe (avec ou sans collections enfant côté mode de jeu)."
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
              aria-label="Basculer panneau supercollections (collections étiquette)"
            >
              <Hash class="h-4 w-4" aria-hidden />
            </button>

            <h3 class={COLLECTION_NODE_STYLES.title}>{content.title}</h3>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <button
              type="button"
              class={COLLECTION_NODE_STYLES.buttonIconCreators}
              onClick={layout.toggle}
              aria-label="Basculer panneau influenceurs"
            >
              <User class="h-4 w-4" aria-hidden />
            </button>
            <button type="button" class={COLLECTION_NODE_STYLES.playButton} onClick={actions.onPlay} aria-label="Lancer">
              <Play class="h-3.5 w-3.5 fill-current" aria-hidden />
            </button>
          </div>
        </div>

        {collectionApiId != null ? (
          <div class={COLLECTION_NODE_STYLES.actionsRow}>
            <Button
              variant="outline"
              class="btn-xs gap-1 sm:btn-sm"
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
              <ListTree class="h-4 w-4" aria-hidden />
              Questions
            </Button>
            {data.isMine === true && (data.questionCount ?? 0) > 0 ? (
              <Button
                variant="outline"
                class="btn-xs gap-1 sm:btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  route(buildReflexionRoutePath(collectionApiId));
                }}
              >
                <ListOrdered class="h-4 w-4" aria-hidden />
                Suite logique
              </Button>
            ) : null}
            <Button
              variant="learn"
              class="btn-xs gap-1 sm:btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                graphActions?.openLlmImportForCollection(collectionApiId);
              }}
            >
              <FileJson class="h-4 w-4" aria-hidden />
              Import LLM
            </Button>
          </div>
        ) : null}

        <div class={COLLECTION_NODE_STYLES.bottomStrip} aria-hidden>
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
