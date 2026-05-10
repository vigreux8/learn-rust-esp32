import { Card } from "../../../../atomes/Card";
import { QuestionsLlmImportOptionsPanel } from "../../../../atomes/QuestionsLlmImportOptionsPanel";
import { ActionImportLlm } from "../../../../molecules/ActionImportLlm";
import { QuestionsLlmImportPromptPanel } from "../../../../molecules/QuestionsLlmImportPromptPanel";
import { useCollectionReflexionLlmImportWidget } from "./CollectionReflexionLlmImportWidget.hook";
import { COLLECTION_REFLEXION_LLM_WIDGET_STYLES } from "./CollectionReflexionLlmImportWidget.styles";
import type { CollectionReflexionLlmImportWidgetProps } from "./CollectionReflexionLlmImportWidget.types";

export function CollectionReflexionLlmImportWidget(props: CollectionReflexionLlmImportWidgetProps) {
  const { state, actions } = useCollectionReflexionLlmImportWidget(props);

  return (
    <div class={COLLECTION_REFLEXION_LLM_WIDGET_STYLES.wrap}>
      <div class={COLLECTION_REFLEXION_LLM_WIDGET_STYLES.titleRow}>
        <p class={COLLECTION_REFLEXION_LLM_WIDGET_STYLES.title}>Import LLM (brouillon local)</p>
        <ActionImportLlm
          data={{ panneauImportOuvert: state.panelOpen, disabled: state.disabled }}
          actions={{ onBasculerPanneauImport: actions.togglePanel }}
        />
      </div>
      {state.panelOpen ? (
        <Card class="border-learn/15 bg-learn/[0.06]">
          <div class={COLLECTION_REFLEXION_LLM_WIDGET_STYLES.layout}>
            <QuestionsLlmImportOptionsPanel data={{ options: state.options }} actions={{ onOptionsChange: actions.setOptions }} />
            <QuestionsLlmImportPromptPanel
              data={{ prompt: state.prompt }}
              actions={{ importFromJson: actions.importFromJson }}
              settings={{
                disabled: state.disabled,
                pasteAreaInstruction:
                  'Colle le JSON au format racine { "user_id"?: number, "questions": [ ... ] } — les entrées vont dans « Questions brouillon » sans écrire en base.',
              }}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
