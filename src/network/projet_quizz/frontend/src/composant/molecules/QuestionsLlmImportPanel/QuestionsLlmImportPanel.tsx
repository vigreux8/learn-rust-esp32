import { Card } from "../../atomes/Card";
import { QuestionsLlmImportOptionsPanel } from "../QuestionsLlmImportOptionsPanel";
import { QuestionsLlmImportPromptPanel } from "../QuestionsLlmImportPromptPanel";
import type { LlmImportOption } from "../QuestionsLlmImportOptionsPanel";
import { QUESTIONS_LLM_IMPORT_PANEL_STYLES } from "./QuestionsLlmImportPanel.styles";

export type LlmImportReponse = { texte: string; correcte: boolean };
export type LlmImportQuestion = { question: string; commentaire: string; reponses: [LlmImportReponse, LlmImportReponse, LlmImportReponse, LlmImportReponse] };
export type LlmImportCollectionBlock = { nom: string; questions: LlmImportQuestion[] };
export type LlmImportPayload = { user_id?: number; collections: LlmImportCollectionBlock[]; questions_sans_collection: LlmImportQuestion[] };
export type LlmImportWorkflow = { buildPrompt: (options: LlmImportOption[]) => string; importFromJson: (importText: string) => Promise<string> };
export type QuestionsLlmImportPanelProps = { options: LlmImportOption[]; setOptions: (options: LlmImportOption[]) => void; llmImportWorkflow: LlmImportWorkflow };

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
