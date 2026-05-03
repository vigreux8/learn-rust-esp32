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
  /** Chaque question importée avec `collectionId` est aussi rattachée à cette sous-collection. */
  llmImportExtras?: { sousCollectionId?: number };
  /** Personnalise le titre / sous-titre du bloc (écran Questions par défaut). */
  presentation?: { title: string; subtitle?: string };
};
