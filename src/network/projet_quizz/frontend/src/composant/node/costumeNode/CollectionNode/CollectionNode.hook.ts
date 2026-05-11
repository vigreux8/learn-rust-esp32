import { useCallback, useState } from "preact/hooks";
import { useReactFlow } from "@xyflow/react";
import { readReactFlowDnDFromEvent } from "../../../../lib/reactFlowDnD";
import type { AppEdge, AppNode } from "../../config/flow.types";
import {
  mergeInfluenceurFromSidebarPayload,
  mergeSupercollectionFromSidebarPayload,
} from "./CollectionNode.metier";
import type { CollectionNodeProps, CollectionNodeViewStates } from "./CollectionNode.types";

/**
 * Orchestration locale du nœud (expansion, drop sidebar sur tout le nœud → # ou influenceurs).
 */
export function useCollectionNode(props: CollectionNodeProps): CollectionNodeViewStates {
  const { data, id } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const { setNodes } = useReactFlow<AppNode, AppEdge>();

  const toggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const onPlay = useCallback(() => {
    data.actions?.onPlay?.(id);
  }, [data.actions, id]);

  const onNodeDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }, []);

  const onNodeDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const parsed = readReactFlowDnDFromEvent(event);
      if (parsed == null) return;

      if (parsed.type === "collectionNode") {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id !== id || node.type !== "collectionNode") return node;
            const merged = mergeSupercollectionFromSidebarPayload(
              node.data.supercollections ?? [],
              parsed.data,
            );
            if (merged == null) return node;
            return { ...node, data: { ...node.data, supercollections: merged } };
          }),
        );
        return;
      }

      if (parsed.type === "personalityNode") {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id !== id || node.type !== "collectionNode") return node;
            const merged = mergeInfluenceurFromSidebarPayload(node.data.creators ?? [], parsed.data);
            if (merged == null) return node;
            return { ...node, data: { ...node.data, creators: merged } };
          }),
        );
      }
    },
    [id, setNodes],
  );

  return {
    layout: { isExpanded, toggle },
    content: {
      title: data.label,
      supercollections: data.supercollections ?? [],
      creators: data.creators ?? [],
    },
    dnd: {
      isOverBar: false,
      nodeSurface: {
        onDragOver: onNodeDragOver,
        onDragOverCapture: onNodeDragOver,
        onDrop: onNodeDrop,
      },
    },
    actions: { onPlay },
  };
}
