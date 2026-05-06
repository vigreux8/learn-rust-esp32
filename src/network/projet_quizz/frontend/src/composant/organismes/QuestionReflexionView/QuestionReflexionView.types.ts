import type { LlmImportQuestion } from "../../molecules/QuestionsLlmImportPanel";
import type { QuizzQuestionRow } from "../../../types/quizz";

/** Props injectées par preact-router. */
export type QuestionReflexionViewProps = {
  collectionId?: string;
};

/** Brouillon LLM uniquement côté navigateur (pas encore de ligne `quizz_question`). */
export type ReflexionLocalPoolDraft = {
  id: number;
  categorie_id: number;
  payload: LlmImportQuestion;
  row: QuizzQuestionRow;
};
