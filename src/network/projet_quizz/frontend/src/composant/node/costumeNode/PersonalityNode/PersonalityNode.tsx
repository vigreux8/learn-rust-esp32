import { Handle, Position } from "@xyflow/react";
import { UserRound } from "lucide-preact";
import { personaliteImportanceAccentHex } from "../../../../lib/collectionHierarchyVis";
import { PERSONALITY_NODE_STYLES } from "./PersonalityNode.styles";
import type { PersonalityNodeProps } from "./PersonalityNode.types";

/**
 * Nœud graphe pour une personnalité liée à une collection (drag depuis la sidebar).
 */
export function PersonalityNode(props: PersonalityNodeProps) {
  const { data, isConnectable } = props;
  const accent = personaliteImportanceAccentHex(data.importanceType);

  return (
    <div
      class={`${PERSONALITY_NODE_STYLES.wrapper} border-l-4`}
      style={{ borderLeftColor: accent }}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div class="flex items-start gap-2">
        <UserRound class="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} aria-hidden />
        <div class="min-w-0 flex-1">
          <p class={PERSONALITY_NODE_STYLES.title}>{data.label}</p>
          {data.collectionLabel != null && data.collectionLabel !== "" ? (
            <p class={PERSONALITY_NODE_STYLES.subtitle}>{data.collectionLabel}</p>
          ) : null}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
}
