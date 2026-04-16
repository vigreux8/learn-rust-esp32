import { Card } from "../atomes/Card";
import { QuestionsLlmImportOptionsPanel } from "./QuestionsLlmImportOptionsPanel";
import { QuestionsLlmImportPromptPanel } from "./QuestionsLlmImportPromptPanel";
import type { LlmImportOption } from "./QuestionsLlmImportOptionsPanel";

/** Réponse importable validée côté frontend. */
export type LlmImportReponse = {
  texte: string;
  correcte: boolean;
};

/** Question importable validée côté frontend. */
export type LlmImportQuestion = {
  question: string;
  commentaire: string;
  reponses: [LlmImportReponse, LlmImportReponse, LlmImportReponse, LlmImportReponse];
};

/** Bloc collection importable validé côté frontend. */
export type LlmImportCollectionBlock = {
  nom: string;
  questions: LlmImportQuestion[];
};

/**
 * Payload JSON normalisé envoyé au backend.
 * Le frontend transforme le format court `{ questions: [...] }` vers `questions_sans_collection`.
 */
export type LlmImportPayload = {
  user_id?: number;
  collections: LlmImportCollectionBlock[];
  questions_sans_collection: LlmImportQuestion[];
};

/** Stratégie injectée : prompt à partir des options + import du JSON collé. */
export type LlmImportWorkflow = {
  buildPrompt: (options: LlmImportOption[]) => string;
  importFromJson: (importText: string) => Promise<string>;
};

export type QuestionsLlmImportPanelProps = {
  options: LlmImportOption[];
  setOptions: (options: LlmImportOption[]) => void;
  llmImportWorkflow: LlmImportWorkflow;
};

export function QuestionsLlmImportPanel({
  options,
  setOptions,
  llmImportWorkflow,
}: QuestionsLlmImportPanelProps) {
  const llmPromptFull = llmImportWorkflow.buildPrompt(options);

  return (
    <Card class="fl-reveal-enter mb-6 border-learn/15 bg-learn/[0.06]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <QuestionsLlmImportOptionsPanel options={options} onOptionsChange={setOptions} />
        <QuestionsLlmImportPromptPanel
          prompt={llmPromptFull}
          importFromJson={llmImportWorkflow.importFromJson}
        />
      </div>
    </Card>
  );
}
