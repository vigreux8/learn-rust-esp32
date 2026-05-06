import type { CollectionUi } from "../../../types/quizz";

export type QuestionsCollectionContextBarProps = {
  targetCollectionNumeric: number | null;
  collections: CollectionUi[];
  importTargetTagCollectionId: number | null;
  setImportTargetTagCollectionId: (id: number | null) => void;
};
