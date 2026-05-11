import type { Dispatch, StateUpdater } from "preact/hooks";
import type { QuestionUi } from "../../../../../types/quizz";
import type { QuizSessionLoadTrackers } from "../useQuizSessionSessionLoad/useQuizSessionSessionLoad.types";
import type { QuizAnnotationSyncPack } from "../useQuizSessionQuestionAnnotations/useQuizSessionQuestionAnnotations.types";
import type { SessionData } from "../../QuizSessionView.types";

export type UseQuizSessionPlayStateOptions = {
  route: {
    collectionId?: string;
  };
  trackersRef: {
    current: QuizSessionLoadTrackers | null;
  };
  session: SessionData | null;
  identity: {
    userId: number;
  };
  feedback: {
    setMessage: Dispatch<StateUpdater<string | null>>;
  };
  mutations: {
    setSession: Dispatch<StateUpdater<SessionData | null>>;
  };
  locks: {
    interactionLockedRef: { current: boolean };
  };
  annotationSyncPackRef: {
    current: QuizAnnotationSyncPack | null;
  };
  edition: {
    questionDetailIdRef: { current: number | null };
    closeQuestionModalRef: { current: (() => void) | null };
  };
};

export type UseQuizSessionPlayStateResult = {
  navigation: {
    index: number;
  };
  actions: {
    pick: (reponseId: number) => void;
    advance: () => void;
    endInfiniteEarly: () => void;
    copyQuestionJson: (current: QuestionUi) => Promise<void>;
    deleteCurrentQuestion: (current: QuestionUi) => Promise<void>;
  };
  status: {
    pickedId: number | null;
    goodAnswers: number;
    nextBusy: boolean;
    fetchingMore: boolean;
    deleteBusy: boolean;
    revealed: boolean;
    correctAnswer: boolean;
  };
};
