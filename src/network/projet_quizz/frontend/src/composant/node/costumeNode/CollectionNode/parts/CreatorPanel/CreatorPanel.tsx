import { ChevronDown, UserRound } from "lucide-preact";
import { personaliteImportanceAccentHex } from "../../../../../../lib/collectionHierarchyVis";
import { CREATOR_PANEL_STYLES } from "./CreatorPanel.styles";
import type { CreatorPanelProps } from "./CreatorPanel.types";

export function CreatorPanel(props: CreatorPanelProps) {
  const { creators } = props;

  return (
    <div class={CREATOR_PANEL_STYLES.root}>
      <span class={CREATOR_PANEL_STYLES.legend}>Influenceurs</span>
      {creators.map((u) => {
        const accent = personaliteImportanceAccentHex(u.importanceType);
        return (
          <div
            key={u.id}
            class={CREATOR_PANEL_STYLES.row}
            style={{
              borderLeftColor: accent,
              backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
            }}
          >
            <span class={CREATOR_PANEL_STYLES.rowInner}>
              <UserRound class={CREATOR_PANEL_STYLES.roleIcon} style={{ color: accent }} aria-hidden />
              <span>{u.name}</span>
            </span>
            <ChevronDown class={CREATOR_PANEL_STYLES.chevron} aria-hidden />
          </div>
        );
      })}
      <div class={CREATOR_PANEL_STYLES.footer}>Glisser une personnalité depuis la barre latérale</div>
    </div>
  );
}
