import type { QuestionReflexionBootstrapSlice } from "../useQuestionReflexionBootstrap/useQuestionReflexionBootstrap";

export type UseQuestionReflexionChainDraftProps = {
  bootstrap: QuestionReflexionBootstrapSlice;
  chainFlush: { current: ((cid: number, gid: number | null) => Promise<void>) | null };
  status: {
    setOperationError: (value: string | null) => void;
  };
  integrations: {
    getConfirmLeave: () => Promise<boolean>;
  };
};
