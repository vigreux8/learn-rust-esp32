import type { CollectionUi, QuizzQuestionRow } from "../../../../../types/quizz";

export type NodeViewLlmImportModalProps = {
  open: boolean;
  collectionId: number | null;
  collections: CollectionUi[];
  questions: QuizzQuestionRow[];
  questionsLoading: boolean;
  questionsError: string | null;
  onClose: () => void;
  onImportSuccess: () => void;
};
