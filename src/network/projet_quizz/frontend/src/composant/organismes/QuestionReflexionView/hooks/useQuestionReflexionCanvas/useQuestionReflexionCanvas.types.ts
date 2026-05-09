import type { QuestionReflexionBootstrapSlice } from "../useQuestionReflexionBootstrap/useQuestionReflexionBootstrap";

export type UseQuestionReflexionCanvasProps = {
  bootstrap: QuestionReflexionBootstrapSlice;
  chainFlush: { current: ((cid: number, gid: number | null) => Promise<void>) | null };
};
