import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import type { GraphSettingsPanelProps } from "./GraphSettingsPanel.types";

/**
 * Préférences du graphe `/node` (comportements sidebar).
 */
export function GraphSettingsPanel(props: GraphSettingsPanelProps) {
  const { settings, actions } = props;

  return (
    <div class="nodrag nowheel flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain px-1 py-0.5">
      <p class={FLOW_SIDEBAR_OVERLAY_STYLES.questionCategoryFilterSectionTitle}>Questions</p>
      <label class="flex cursor-pointer items-start gap-3 rounded-lg border border-base-content/10 bg-base-200/40 px-3 py-2.5">
        <input
          type="checkbox"
          class="checkbox checkbox-primary checkbox-sm mt-0.5 shrink-0"
          checked={settings.focusQuestionAfterCollectionMove}
          onChange={(e) =>
            actions.setFocusQuestionAfterCollectionMove((e.target as HTMLInputElement).checked)
          }
        />
        <span class="min-w-0 text-xs leading-snug text-base-content/90">
          Après un déplacement de question vers une autre collection, mettre en évidence la ligne dans
          le panneau « Questions » et faire défiler jusqu’à elle.
        </span>
      </label>
    </div>
  );
}
