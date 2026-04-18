import type { PlayQtype } from "../../../lib/playOrder";
import type { CollectionUi, QuizzQuestionRow } from "../../../types/quizz";

/** Props injectées par preact-router (`/questions`, `/questions/:collectionId`). */
export type QuestionsViewProps = {
  collectionId?: string;
};

export type QuestionsViewFiltersSectionProps = {
  collectionFilter: string;
  collections: CollectionUi[];
  onCollectionFilterChange: (value: string) => void;
  listFilterQtype: PlayQtype;
  onListFilterQtypeChange: (value: PlayQtype) => void;
};

export type QuestionsViewQuestionsBodyProps = {
  loading: boolean;
  fetchError: boolean;
  onReload: () => void;
  questionsForTable: QuizzQuestionRow[];
  saving: boolean;
  onEdit: (q: QuizzQuestionRow) => void;
  onRemove: (id: number) => void | Promise<void>;
};
