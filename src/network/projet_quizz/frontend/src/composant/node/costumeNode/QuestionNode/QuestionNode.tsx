import { Handle, Position } from "@xyflow/react";
import { GripVertical, MessageSquare } from "lucide-preact";
import { useQuestionNodeSidebarDrag } from "./QuestionNode.hook";
import { QUESTION_NODE_STYLES } from "./QuestionNode.styles";
import type { QuestionNodeProps } from "./QuestionNode.types";

/**
 * Nœud graphe minimal pour une question (titre), utilisable après drag depuis la sidebar.
 */
export function QuestionNode(props: QuestionNodeProps) {
  const { data, isConnectable } = props;
  const sidebarDrag = useQuestionNodeSidebarDrag(data);

  return (
    <div class={QUESTION_NODE_STYLES.wrapper}>
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
        <p class={QUESTION_NODE_STYLES.title}>{data.title}</p>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
}
