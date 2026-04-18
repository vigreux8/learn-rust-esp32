import type { CollectionUi, QuizzModuleRow, QuizzQuestionRow } from "../../../types/quizz";

export type QuestionsActionBoutonsProps = {
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
