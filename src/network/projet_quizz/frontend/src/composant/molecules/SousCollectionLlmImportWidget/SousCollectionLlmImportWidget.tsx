import { Card } from "../../atomes/Card";
import { QuestionsLlmImportOptionsPanel } from "../../atomes/QuestionsLlmImportOptionsPanel";
import { ActionImportLlm } from "../ActionImportLlm";
import { QuestionsLlmImportPromptPanel } from "../QuestionsLlmImportPromptPanel";
import { useSousCollectionLlmImportWidget } from "./SousCollectionLlmImportWidget.hook";
import { SOUS_COLLECTION_LLM_WIDGET_STYLES } from "./SousCollectionLlmImportWidget.styles";
import type { SousCollectionLlmImportWidgetProps } from "./SousCollectionLlmImportWidget.types";

export function SousCollectionLlmImportWidget(props: SousCollectionLlmImportWidgetProps) {
  const { state, actions } = useSousCollectionLlmImportWidget(props);

  return (
    <div class={SOUS_COLLECTION_LLM_WIDGET_STYLES.wrap}>
      <div class={SOUS_COLLECTION_LLM_WIDGET_STYLES.titleRow}>
        <p class={SOUS_COLLECTION_LLM_WIDGET_STYLES.title}>Import LLM pour cette sous-collection</p>
        <ActionImportLlm
          data={{ panneauImportOuvert: state.panelOpen, disabled: state.disabled }}
          actions={{ onBasculerPanneauImport: actions.togglePanel }}
        />
      </div>
      {state.panelOpen ? (
        <Card class="border-learn/15 bg-learn/[0.06]">
          <div class={SOUS_COLLECTION_LLM_WIDGET_STYLES.layout}>
            <QuestionsLlmImportOptionsPanel data={{ options: state.options }} actions={{ onOptionsChange: actions.setOptions }} />
            <QuestionsLlmImportPromptPanel
              data={{ prompt: state.prompt }}
              actions={{ importFromJson: actions.importFromJson }}
              settings={{
                disabled: state.disabled,
                pasteAreaInstruction:
                  'Colle le JSON au format racine { "user_id"?: number, "questions": [ ... ] } — chaque entrée sera ajoutée à la collection et rattachée à cette sous-collection.',
              }}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
