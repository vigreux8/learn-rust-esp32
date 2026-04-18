import type { CollectionUi, QuizzModuleRow, QuizzQuestionRow } from "../../../types/quizz";

export type QuestionsLlmImportCardProps = {
  data: {
    targetCollectionNumeric: number | null;
    collections: CollectionUi[];
    allModules: QuizzModuleRow[];
    importTargetModuleId: number | null;
    questions: QuizzQuestionRow[];
  };
  actions: {
    onImportSuccess: () => void;
  };
};
