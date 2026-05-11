import { ChevronDown } from "lucide-preact";
import { CREATOR_PANEL_STYLES } from "./CreatorPanel.styles";
import type { CreatorPanelProps } from "./CreatorPanel.types";

export function CreatorPanel(props: CreatorPanelProps) {
  const { creators, dropZone } = props;

  return (
    <div
      class={CREATOR_PANEL_STYLES.root}
      onDragOver={dropZone?.onDragOver}
      onDrop={dropZone?.onDrop}
    >
      <span class={CREATOR_PANEL_STYLES.legend}>Influenceurs</span>
      {creators.map((u) => (
        <div key={u.id} class={CREATOR_PANEL_STYLES.row}>
          <span>{u.name}</span>
          <ChevronDown class={CREATOR_PANEL_STYLES.chevron} aria-hidden />
        </div>
      ))}
      <div class={CREATOR_PANEL_STYLES.footer}>Glisser une personnalité depuis la barre latérale</div>
    </div>
  );
}
