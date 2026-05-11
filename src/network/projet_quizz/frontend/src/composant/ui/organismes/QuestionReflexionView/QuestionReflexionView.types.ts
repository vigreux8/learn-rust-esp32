import type { LlmImportQuestion } from "../../molecules/QuestionsLlmImportPanel";
import type { QuizzQuestionRow } from "../../../../types/quizz";

/** Entrées injectées par `preact-router` (`/collections/:collectionId/reflexion`). */
export type QuestionReflexionRouterInject = {
  collectionId?: string;
};

export type QuestionReflexionViewProps = {
  route: {
    collectionId?: string;
  };
};

/** Brouillon LLM uniquement côté navigateur (pas encore de ligne `quizz_question`). */
export type ReflexionLocalPoolDraft = {
  id: number;
  categorie_id: number;
  payload: LlmImportQuestion;
  row: QuizzQuestionRow;
};
