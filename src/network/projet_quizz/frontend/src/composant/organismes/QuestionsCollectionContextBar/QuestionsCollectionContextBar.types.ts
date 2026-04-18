import type { CollectionUi, QuizzModuleRow } from "../../../types/quizz";

export type QuestionsCollectionContextBarProps = {
  targetCollectionNumeric: number | null;
  collections: CollectionUi[];
  allModules: QuizzModuleRow[];
  importTargetModuleId: number | null;
  setImportTargetModuleId: (id: number | null) => void;
};
