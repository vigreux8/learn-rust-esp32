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
 * Orchestration locale du nœud (expansion, contenu dérivé de `data`, drop sidebar → panneaux # / influenceurs).
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

  const onSupercollectionDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }, []);

  const onSupercollectionDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const parsed = readReactFlowDnDFromEvent(event);
      if (parsed == null || parsed.type !== "collectionNode") return;
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
    },
    [id, setNodes],
  );

  const onInfluenceurDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }, []);

  const onInfluenceurDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const parsed = readReactFlowDnDFromEvent(event);
      if (parsed == null || parsed.type !== "personalityNode") return;
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== id || node.type !== "collectionNode") return node;
          const merged = mergeInfluenceurFromSidebarPayload(node.data.creators ?? [], parsed.data);
          if (merged == null) return node;
          return { ...node, data: { ...node.data, creators: merged } };
        }),
      );
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
      supercollections: {
        onDragOver: onSupercollectionDragOver,
        onDrop: onSupercollectionDrop,
      },
      influenceurs: {
        onDragOver: onInfluenceurDragOver,
        onDrop: onInfluenceurDrop,
      },
    },
    actions: { onPlay },
  };
}
