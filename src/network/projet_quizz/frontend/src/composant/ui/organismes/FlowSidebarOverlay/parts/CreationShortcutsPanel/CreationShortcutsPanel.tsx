import { GripVertical, Sparkles } from "lucide-preact";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import {
  CREATE_DRAG_COLLECTION_LABEL,
  CREATE_DRAG_PERSONALITY_LABEL,
} from "./CreationShortcutsPanel.metier";
import type { CreationShortcutsPanelProps } from "./CreationShortcutsPanel.types";

/**
 * Raccourcis drag : nœud collection ou personnalité vierge sur le canvas.
 */
export function CreationShortcutsPanel(props: CreationShortcutsPanelProps) {
  const { actions } = props;

  return (
    <div class="flex min-h-0 flex-col gap-3">
      <p class="text-[11px] leading-snug text-base-content/65">
        Glisse-dépose sur le graphe pour ajouter un nœud modèle (sans lien API tant que tu ne relies pas une vraie
        collection ou personnalité).
      </p>
      <div class="flex flex-col gap-2">
        <div
          class={FLOW_SIDEBAR_OVERLAY_STYLES.dragItem}
          draggable
          onDragStart={(event) =>
            actions.onDragStart(event as unknown as DragEvent, "collectionNode", {
              label: CREATE_DRAG_COLLECTION_LABEL,
              blankTemplate: true,
            })
          }
        >
          <GripVertical size={16} class={FLOW_SIDEBAR_OVERLAY_STYLES.grip} aria-hidden />
          <Sparkles class="h-4 w-4 shrink-0 text-warning" aria-hidden />
          <span class={FLOW_SIDEBAR_OVERLAY_STYLES.collectionLabel}>{CREATE_DRAG_COLLECTION_LABEL}</span>
        </div>
        <div
          class={FLOW_SIDEBAR_OVERLAY_STYLES.dragItem}
          draggable
          onDragStart={(event) =>
            actions.onDragStart(event as unknown as DragEvent, "personalityNode", {
              label: CREATE_DRAG_PERSONALITY_LABEL,
              importanceType: null,
              blankTemplate: true,
            })
          }
        >
          <GripVertical size={16} class={FLOW_SIDEBAR_OVERLAY_STYLES.grip} aria-hidden />
          <Sparkles class="h-4 w-4 shrink-0 text-success" aria-hidden />
          <span class={FLOW_SIDEBAR_OVERLAY_STYLES.collectionLabel}>{CREATE_DRAG_PERSONALITY_LABEL}</span>
        </div>
      </div>
    </div>
  );
}
