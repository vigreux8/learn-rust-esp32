import { useCallback, useState } from "preact/hooks";
import { useReactFlow } from "@xyflow/react";
import { useNodeViewGraphActions } from "../../../../lib/nodeViewGraphActionsContext";
import { normalizeQuestionNodeMovePayload, readReactFlowDnDFromEvent } from "../../../../lib/reactFlowDnD";
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
  const graphActions = useNodeViewGraphActions();

  const toggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const onTogglePlayIncluded = useCallback(
    (e: Event) => {
      e.stopPropagation();
      if (typeof data.collectionId !== "number") return;
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== id || node.type !== "collectionNode") return node;
          const cur = node.data.playIncluded !== false;
          return { ...node, data: { ...node.data, playIncluded: !cur } };
        }),
      );
    },
    [data.collectionId, id, setNodes],
  );

  const onPlay = useCallback(() => {
    const cid = typeof data.collectionId === "number" ? data.collectionId : null;
    if (cid != null && graphActions?.navigateToPlayForCollection != null) {
      graphActions.navigateToPlayForCollection(cid);
      return;
    }
    if (cid == null) {
      window.alert(
        "Ce nœud n’est pas relié à une collection en base : dépose une collection depuis la barre latérale ou recharge une branche.",
      );
      return;
    }
    data.actions?.onPlay?.(id);
  }, [data.actions, data.collectionId, graphActions, id]);

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
        return;
      }

      if (parsed.type === "questionNode") {
        const toCollectionId = data.collectionId;
        if (typeof toCollectionId !== "number") {
          window.alert("Dépose sur un nœud collection relié à l’API (pas le gabarit vide).");
          return;
        }
        const { fromCollectionId, questionIds } = normalizeQuestionNodeMovePayload(parsed.data);
        if (questionIds.length === 0 || fromCollectionId == null) {
          window.alert(
            "Seules les questions déjà liées à une collection (liste ou nœud avec poignée) peuvent être déplacées.",
          );
          return;
        }
        if (fromCollectionId === toCollectionId) {
          return;
        }
        const moveQuestionToCollection = graphActions?.moveQuestionToCollection;
        if (moveQuestionToCollection == null) {
          window.alert("Action de déplacement non disponible sur ce graphe.");
          return;
        }
        void moveQuestionToCollection({
          questionId: questionIds[0],
          fromCollectionId,
          toCollectionId,
          ...(questionIds.length > 1 ? { questionIds } : {}),
        });
      }
    },
    [data.collectionId, graphActions, id, setNodes],
  );

  const collectionApiId = typeof data.collectionId === "number" ? data.collectionId : null;
  const playIncluded = data.playIncluded !== false;

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
    graphPlay: {
      showToggle: collectionApiId != null,
      included: playIncluded,
      onToggleIncluded: onTogglePlayIncluded,
    },
    actions: { onPlay },
  };
}
