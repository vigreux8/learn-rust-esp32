import { Handle, Position } from "@xyflow/react";
import { GripVertical, MessageSquare } from "lucide-preact";
import { cn } from "../../../../lib/cn";
import { MarkdownViewer } from "../../../ui/atomes/MarkdownViewer";
import { useQuestionNodeMoveFlash, useQuestionNodeSidebarDrag } from "./QuestionNode.hook";
import { QUESTION_NODE_STYLES } from "./QuestionNode.styles";
import type { QuestionNodeProps } from "./QuestionNode.types";

/**
 * Nœud graphe minimal pour une question (titre), utilisable après drag depuis la sidebar.
 */
export function QuestionNode(props: QuestionNodeProps) {
  const { data, isConnectable, id } = props;
  const sidebarDrag = useQuestionNodeSidebarDrag(data);
  useQuestionNodeMoveFlash({ nodeId: id, moveFlashToken: data.moveFlashToken });

  return (
    <div
      class={cn(
        QUESTION_NODE_STYLES.wrapper,
        data.moveFlashToken != null ? QUESTION_NODE_STYLES.wrapperMoveFlash : undefined,
      )}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div class="flex items-start gap-2">
        {sidebarDrag.canSidebarDrag ? (
          <span
            class={QUESTION_NODE_STYLES.dragGrip}
            draggable
            aria-label="Glisser vers un nœud collection pour changer de collection"
            onDragStart={sidebarDrag.onGripDragStart}
          >
            <GripVertical size={16} aria-hidden />
          </span>
        ) : null}
        <MessageSquare class="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden />
        <div class={QUESTION_NODE_STYLES.titleMarkdown}>
          <MarkdownViewer data={{ content: data.title }} />
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
}
