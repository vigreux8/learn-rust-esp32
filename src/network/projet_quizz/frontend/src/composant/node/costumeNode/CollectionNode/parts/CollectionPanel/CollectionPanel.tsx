import { Minus } from "lucide-preact";
import { COLLECTION_PANEL_STYLES } from "./CollectionPanel.styles";
import type { CollectionPanelProps } from "./CollectionPanel.types";

export function CollectionPanel(props: CollectionPanelProps) {
  const { data, settings, status, actions } = props;

  return (
    <div class={COLLECTION_PANEL_STYLES.root}>
      <span class={COLLECTION_PANEL_STYLES.legend}>Supercollections</span>
      {data.supercollections.map((c) => {
        const tagId = Number(c.id);
        const rowBusy = Number.isFinite(tagId) && status.savingTagCollectionId === tagId;
        return (
          <div key={c.id} class={COLLECTION_PANEL_STYLES.tagRow}>
            <span class={COLLECTION_PANEL_STYLES.tagLabel}>#{c.label}</span>
            {settings.tagRemoveEnabled ? (
              <button
                type="button"
                class={COLLECTION_PANEL_STYLES.tagRemove}
                title={`Retirer « ${c.label} »`}
                aria-label={`Retirer l’étiquette ${c.label}`}
                disabled={rowBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  if (Number.isFinite(tagId)) {
                    actions.onRemoveTag(tagId);
                  }
                }}
              >
                <Minus class="h-2.5 w-2.5 stroke-[2.5]" aria-hidden />
              </button>
            ) : null}
          </div>
        );
      })}
      <div class={COLLECTION_PANEL_STYLES.footer}>Glisser une collection depuis la barre latérale</div>
    </div>
  );
}
