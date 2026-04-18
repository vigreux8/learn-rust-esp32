import type { QuizzQuestionRow } from "../../../types/quizz";

export type QuestionsTableProps = {
  data: {
    questions: QuizzQuestionRow[];
  };
  actions: {
    onEdit: (question: QuizzQuestionRow) => void;
    onRemove: (id: number) => void;
  };
  status: {
    saving: boolean;
  };
};
