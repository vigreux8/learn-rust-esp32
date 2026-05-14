import { useCallback, useEffect } from "preact/hooks";
import { useReactFlow } from "@xyflow/react";
import type { AppEdge, AppNode } from "../../config/flow.types";
import { REACT_FLOW_DND_MIME } from "../../../../lib/reactFlowDnD";
import type { QuestionNodeData } from "./QuestionNode.types";

/**
 * Prépare le drag HTML5 (même charge que la sidebar Questions) depuis le nœud graphe.
 */
export function useQuestionNodeSidebarDrag(data: QuestionNodeData) {
  const onGripDragStart = useCallback(
    (event: DragEvent) => {
      const questionId = data.questionId;
      const collectionId = data.collectionId;
      if (typeof questionId !== "number" || typeof collectionId !== "number") {
        event.preventDefault();
        return;
      }
      if (!event.dataTransfer) return;
      const body = JSON.stringify({
        type: "questionNode",
        data: {
          title: data.title,
          questionId,
          collectionId,
        },
      });
      event.dataTransfer.setData(REACT_FLOW_DND_MIME, body);
      event.dataTransfer.effectAllowed = "move";
    },
    [data.collectionId, data.questionId, data.title],
  );

  return { onGripDragStart, canSidebarDrag: typeof data.questionId === "number" && typeof data.collectionId === "number" };
}

/**
 * Retire `moveFlashToken` après surbrillance temporaire (déplacement collection).
 */
export function useQuestionNodeMoveFlash(opts: { nodeId: string; moveFlashToken?: number }) {
  const { nodeId, moveFlashToken } = opts;
  const { setNodes } = useReactFlow<AppNode, AppEdge>();
  useEffect(() => {
    if (moveFlashToken == null) return;
    const t = window.setTimeout(() => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId && n.type === "questionNode"
            ? { ...n, data: { ...n.data, moveFlashToken: undefined } }
            : n,
        ),
      );
    }, 2600);
    return () => window.clearTimeout(t);
  }, [moveFlashToken, nodeId, setNodes]);
}
