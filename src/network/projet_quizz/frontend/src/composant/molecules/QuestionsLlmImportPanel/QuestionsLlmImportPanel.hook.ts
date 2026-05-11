import type { QuestionsLlmImportPanelProps } from "./QuestionsLlmImportPanel.types";

export function useQuestionsLlmImportPanel(props: QuestionsLlmImportPanelProps) {
  const { data, actions } = props;
  const { options, llmImportWorkflow } = data;
  const prompt = llmImportWorkflow.buildPrompt(options);

  return {
    optionsSection: {
      options,
      onOptionsChange: actions.onOptionsChange,
    },
    promptSection: {
      prompt,
      importFromJson: llmImportWorkflow.importFromJson,
    },
  };
}
