import { COLLECTION_PANEL_STYLES } from "./CollectionPanel.styles";
import type { CollectionPanelProps } from "./CollectionPanel.types";

export function CollectionPanel(props: CollectionPanelProps) {
  const { supercollections, dropZone } = props;

  return (
    <div
      class={COLLECTION_PANEL_STYLES.root}
      onDragOver={dropZone?.onDragOver}
      onDrop={dropZone?.onDrop}
    >
      <span class={COLLECTION_PANEL_STYLES.legend}>Supercollections</span>
      {supercollections.map((c) => (
        <div key={c.id} class={COLLECTION_PANEL_STYLES.badge}>
          #{c.label}
        </div>
      ))}
      <div class={COLLECTION_PANEL_STYLES.footer}>Glisser une collection depuis la barre latérale</div>
    </div>
  );
}
