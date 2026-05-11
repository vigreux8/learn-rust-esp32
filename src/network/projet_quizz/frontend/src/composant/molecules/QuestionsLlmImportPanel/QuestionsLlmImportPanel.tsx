import { Card } from "../../atomes/Card";
import { QuestionsLlmImportOptionsPanel } from "../../atomes/QuestionsLlmImportOptionsPanel";
import { QuestionsLlmImportPromptPanel } from "../QuestionsLlmImportPromptPanel";
import { useQuestionsLlmImportPanel } from "./QuestionsLlmImportPanel.hook";
import { QUESTIONS_LLM_IMPORT_PANEL_STYLES } from "./QuestionsLlmImportPanel.styles";
import type { QuestionsLlmImportPanelProps } from "./QuestionsLlmImportPanel.types";

export function QuestionsLlmImportPanel(props: QuestionsLlmImportPanelProps) {
  const { optionsSection, promptSection } = useQuestionsLlmImportPanel(props);

  return (
    <Card class={QUESTIONS_LLM_IMPORT_PANEL_STYLES.card}>
      <div class={QUESTIONS_LLM_IMPORT_PANEL_STYLES.layout}>
        <QuestionsLlmImportOptionsPanel
          data={{ options: optionsSection.options }}
          actions={{ onOptionsChange: optionsSection.onOptionsChange }}
        />
        <QuestionsLlmImportPromptPanel
          data={{ prompt: promptSection.prompt }}
          actions={{ importFromJson: promptSection.importFromJson }}
        />
      </div>
    </Card>
  );
}
