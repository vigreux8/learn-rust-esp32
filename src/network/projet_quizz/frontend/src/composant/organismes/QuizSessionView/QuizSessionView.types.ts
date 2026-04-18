import type { PlayOrder, PlayQtype } from "../../../lib/playOrder";
import type { QuestionUi } from "../../../types/quizz";

export type QuizSessionViewProps = {
  collectionId?: string;
};

export type SessionData = {
  mode: "collection" | "random";
  collectionId: number | null;
  nom: string;
  questions: QuestionUi[];
  playOrders: PlayOrder[];
  playQtype: PlayQtype;
  playInfinite: boolean;
  playUserId?: number;
  useServerPlayModes: boolean;
};

export type QuizSessionHeaderProps = {
  data: SessionData;
  backTarget: string;
};

export type QuizSessionQuestionCardProps = {
  data: SessionData;
  index: number;
  total: number;
  q: QuestionUi;
  pickedId: number | null;
  revealed: boolean;
  anecdote: string;
  correct: boolean;
  draftVerifier: boolean;
  nextBusy: boolean;
  fetchingMore: boolean;
  onPick: (reponseId: number) => void;
  onOpenCreateLinkedQuestionModal: (q: QuestionUi) => void;
  onOpenEditQuestionModal: (q: QuestionUi) => void;
  onCopyCurrentQuestionJson: (q: QuestionUi) => Promise<void>;
  onDraftVerifier: (value: boolean) => void;
  onNext: () => void;
  onEndInfiniteSession: () => void;
};

export type QuizSessionProgressProps = {
  playInfinite: boolean;
  progressValue: number;
  total: number;
};
