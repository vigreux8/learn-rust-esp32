import { Handle, Position } from "@xyflow/react";
import { Hash, Play, User } from "lucide-preact";
import { useCollectionNode } from "./CollectionNode.hook";
import { COLLECTION_NODE_STYLES } from "./CollectionNode.styles";
import type { CollectionNodeProps } from "./CollectionNode.types";
import { CollectionPanel } from "./parts/CollectionPanel/CollectionPanel";
import { CreatorPanel } from "./parts/CreatorPanel/CreatorPanel";

export function CollectionNode(props: CollectionNodeProps) {
  const { layout, content, actions, dnd } = useCollectionNode(props);
  const { isConnectable } = props;

  return (
    <div class={COLLECTION_NODE_STYLES.wrapper}>
      <div class={COLLECTION_NODE_STYLES.coreColumn}>
        {layout.isExpanded ? (
          <div class={COLLECTION_NODE_STYLES.panelsFloating}>
            <CollectionPanel
              supercollections={content.supercollections}
              dropZone={dnd.supercollections}
            />
            <CreatorPanel creators={content.creators} dropZone={dnd.influenceurs} />
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

        <div class={COLLECTION_NODE_STYLES.mainBar}>
          <button
            type="button"
            class={COLLECTION_NODE_STYLES.buttonIconCollections}
            onClick={layout.toggle}
            aria-label="Basculer panneau supercollections (collections étiquette)"
          >
            <Hash class="h-4 w-4" aria-hidden />
          </button>

          <h3 class={COLLECTION_NODE_STYLES.title}>{content.title}</h3>

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
