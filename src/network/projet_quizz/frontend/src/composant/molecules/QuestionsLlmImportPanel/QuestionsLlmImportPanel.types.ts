import type { LlmImportOption } from "../../atomes/QuestionsLlmImportOptionsPanel";

export type LlmImportReponse = { texte: string; correcte: boolean };

export type LlmImportQuestion = {
  question: string;
  commentaire: string;
  reponses: [LlmImportReponse, LlmImportReponse, LlmImportReponse, LlmImportReponse];
};

export type LlmImportCollectionBlock = { nom: string; questions: LlmImportQuestion[] };

export type LlmImportPayload = {
  user_id?: number;
  collections: LlmImportCollectionBlock[];
  questions_sans_collection: LlmImportQuestion[];
};

export type LlmImportWorkflow = {
  buildPrompt: (options: LlmImportOption[]) => string;
  importFromJson: (importText: string) => Promise<string>;
};

export type QuestionsLlmImportPanelProps = {
  data: {
    options: LlmImportOption[];
    llmImportWorkflow: LlmImportWorkflow;
  };
  actions: {
    onOptionsChange: (options: LlmImportOption[]) => void;
  };
};
