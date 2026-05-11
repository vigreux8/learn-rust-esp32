import { COLLECTION_PANEL_STYLES } from "./CollectionPanel.styles";
import type { CollectionPanelProps } from "./CollectionPanel.types";

export function CollectionPanel(props: CollectionPanelProps) {
  const { collections } = props;

  return (
    <div class={COLLECTION_PANEL_STYLES.root}>
      <span class={COLLECTION_PANEL_STYLES.legend}>Collections</span>
      {collections.map((c) => (
        <div key={c.id} class={COLLECTION_PANEL_STYLES.badge}>
          #{c.label}
        </div>
      ))}
      <div class={COLLECTION_PANEL_STYLES.footer}>déposable</div>
    </div>
  );
}
