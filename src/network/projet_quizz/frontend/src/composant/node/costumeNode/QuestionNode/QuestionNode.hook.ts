import { useCallback } from "preact/hooks";
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
