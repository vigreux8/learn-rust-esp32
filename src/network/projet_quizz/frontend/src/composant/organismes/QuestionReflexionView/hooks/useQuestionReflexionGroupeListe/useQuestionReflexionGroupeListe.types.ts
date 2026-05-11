import type { QuestionReflexionBootstrapSlice } from "../useQuestionReflexionBootstrap/useQuestionReflexionBootstrap";

export type UseQuestionReflexionGroupeListeProps = {
  bootstrap: QuestionReflexionBootstrapSlice;
  status: {
    setOperationError: (value: string | null) => void;
  };
  integrations: {
    loadChainFor: (cid: number, gid: number | null) => Promise<void>;
    reloadGroupesOnly: () => void;
  };
};
