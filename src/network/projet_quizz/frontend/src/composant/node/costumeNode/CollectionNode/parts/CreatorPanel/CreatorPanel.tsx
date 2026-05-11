import { ChevronDown } from "lucide-preact";
import { CREATOR_PANEL_STYLES } from "./CreatorPanel.styles";
import type { CreatorPanelProps } from "./CreatorPanel.types";

export function CreatorPanel(props: CreatorPanelProps) {
  const { creators } = props;

  return (
    <div class={CREATOR_PANEL_STYLES.root}>
      <span class={CREATOR_PANEL_STYLES.legend}>Créateurs</span>
      {creators.map((u) => (
        <div key={u.id} class={CREATOR_PANEL_STYLES.row}>
          <span>{u.name}</span>
          <ChevronDown class={CREATOR_PANEL_STYLES.chevron} aria-hidden />
        </div>
      ))}
      <div class={CREATOR_PANEL_STYLES.footer}>déposable</div>
    </div>
  );
}
