import type { SessionDetail } from "../../../../types/quizz";

/** Entrées injectées par `preact-router` (`/dashboard/session/:sessionId`). */
export type SessionDetailsRouterInject = {
  sessionId?: string;
};

export type SessionDetailsViewProps = {
  route: {
    sessionId?: string;
  };
};

export type SessionDetailsState = {
  session: SessionDetail | null;
  loading: boolean;
  notFound: boolean;
};
