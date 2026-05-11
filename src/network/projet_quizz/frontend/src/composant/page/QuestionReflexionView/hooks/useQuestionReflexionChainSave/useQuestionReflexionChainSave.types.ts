import type { Dispatch, StateUpdater } from "preact/hooks";
import type { GroupeQuestionsUi, QuizzQuestionRow } from "../../../../../types/quizz";
import type { ReflexionLocalPoolDraft } from "../../QuestionReflexionView.types";

export type UseQuestionReflexionChainSaveProps = {
  routing: {
    collectionIdNum: number | null;
  };
  identity: { userId: number };
  refs: {
    selectedGroupeIdRef: { current: number | null };
  };
  state: {
    ordered: QuizzQuestionRow[];
    localPoolDrafts: ReflexionLocalPoolDraft[];
    chainColorLevels: Record<number, number>;
  };
  setters: {
    setGroupes: (v: GroupeQuestionsUi[]) => void;
    setLocalPoolDrafts: Dispatch<StateUpdater<ReflexionLocalPoolDraft[]>>;
    setOperationError: (v: string | null) => void;
    setChainBusy: Dispatch<StateUpdater<boolean>>;
  };
  integrations: {
    applySelectedGroupeId: (id: number | null) => void;
    loadChainFor: (cid: number, gid: number | null) => Promise<void>;
  };
};
