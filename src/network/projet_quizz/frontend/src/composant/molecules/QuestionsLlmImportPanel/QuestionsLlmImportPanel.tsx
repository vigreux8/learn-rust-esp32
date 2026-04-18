import { Card } from "../../atomes/Card";
import { QuestionsLlmImportOptionsPanel } from "../QuestionsLlmImportOptionsPanel";
import { QuestionsLlmImportPromptPanel } from "../QuestionsLlmImportPromptPanel";
import { QUESTIONS_LLM_IMPORT_PANEL_STYLES } from "./QuestionsLlmImportPanel.styles";
import type { QuestionsLlmImportPanelProps } from "./QuestionsLlmImportPanel.types";

export function QuestionsLlmImportPanel({ options, setOptions, llmImportWorkflow }: QuestionsLlmImportPanelProps) {
  const llmPromptFull = llmImportWorkflow.buildPrompt(options);
  return (
    <Card class={QUESTIONS_LLM_IMPORT_PANEL_STYLES.card}>
      <div class={QUESTIONS_LLM_IMPORT_PANEL_STYLES.layout}>
        <QuestionsLlmImportOptionsPanel data={{ options }} actions={{ onOptionsChange: setOptions }} />
        <QuestionsLlmImportPromptPanel data={{ prompt: llmPromptFull }} actions={{ importFromJson: llmImportWorkflow.importFromJson }} />
      </div>
    </Card>
  );
}
