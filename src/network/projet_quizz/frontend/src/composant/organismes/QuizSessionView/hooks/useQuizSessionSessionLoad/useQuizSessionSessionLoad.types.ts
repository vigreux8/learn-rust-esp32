import type { Dispatch, StateUpdater } from "preact/hooks";
import type { SessionData } from "../../QuizSessionView.types";

/** Suivi synchrone du chargement réseau (hors état React de la session). */
export type QuizSessionLoadTrackers = {
  /** Réinitialiser compteurs / IDs servis avant le fetch. */
  onFetchBegins: () => void;
  /** Alimenter le suivi infinite une fois les questions calculées (avant setState session). */
  onDeckPrepared: (ctx: {
    infinite: boolean;
    initialServedQuestionIds: number[];
  }) => void;
  /** Réinitialiser l’index de jeu après commit du deck dans le store session. */
  onPlayCountersReady: () => void;
};

export type UseQuizSessionSessionLoadOptions = {
  route: {
    collectionId?: string;
  };
  deps: {
    routePath: string;
    userId: number;
  };
  /** Remplie de façon synchrone par useQuizSessionPlayState avant le premier effet réseau. */
  trackersRef: { current: QuizSessionLoadTrackers | null };
};

export type UseQuizSessionSessionLoadResult = {
  status: {
    loading: boolean;
    loadError: string | null;
  };
  data: {
    session: SessionData | null;
    setSession: Dispatch<StateUpdater<SessionData | null>>;
  };
};
