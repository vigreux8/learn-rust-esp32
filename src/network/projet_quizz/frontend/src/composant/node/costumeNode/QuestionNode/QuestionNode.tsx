import { Handle, Position } from "@xyflow/react";
import { MessageSquare } from "lucide-preact";
import { QUESTION_NODE_STYLES } from "./QuestionNode.styles";
import type { QuestionNodeProps } from "./QuestionNode.types";

/**
 * Nœud graphe minimal pour une question (titre), utilisable après drag depuis la sidebar.
 */
export function QuestionNode(props: QuestionNodeProps) {
  const { data, isConnectable } = props;

  return (
    <div class={QUESTION_NODE_STYLES.wrapper}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div class="flex items-start gap-2">
        <MessageSquare class="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden />
        <p class={QUESTION_NODE_STYLES.title}>{data.title}</p>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
}
