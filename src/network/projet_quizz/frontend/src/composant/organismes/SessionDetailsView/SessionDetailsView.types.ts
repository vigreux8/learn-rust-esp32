import type { SessionDetail } from "../../../types/quizz";

export type SessionDetailsViewProps = {
  sessionId?: string;
};

export type SessionDetailsState = {
  session: SessionDetail | null;
  loading: boolean;
  notFound: boolean;
};
