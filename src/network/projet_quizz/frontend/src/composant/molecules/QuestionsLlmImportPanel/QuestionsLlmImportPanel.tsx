import { Card } from "../../atomes/Card";
import { QuestionsLlmImportOptionsPanel } from "../QuestionsLlmImportOptionsPanel";
import { QuestionsLlmImportPromptPanel } from "../QuestionsLlmImportPromptPanel";
import { QUESTIONS_LLM_IMPORT_PANEL_STYLES } from "./QuestionsLlmImportPanel.styles";
import type { QuestionsLlmImportPanelProps } from "./QuestionsLlmImportPanel.types";

export function QuestionsLlmImportPanel(props: QuestionsLlmImportPanelProps) {
  const { data, actions } = props;
  const { options, llmImportWorkflow } = data;
  const prompt = llmImportWorkflow.buildPrompt(options);

  return (
    <Card class={QUESTIONS_LLM_IMPORT_PANEL_STYLES.card}>
      <div class={QUESTIONS_LLM_IMPORT_PANEL_STYLES.layout}>
        <QuestionsLlmImportOptionsPanel
          data={{ options }}
          actions={{ onOptionsChange: actions.onOptionsChange }}
        />
        <QuestionsLlmImportPromptPanel
          data={{ prompt }}
          actions={{ importFromJson: llmImportWorkflow.importFromJson }}
        />
      </div>
    </Card>
  );
}
