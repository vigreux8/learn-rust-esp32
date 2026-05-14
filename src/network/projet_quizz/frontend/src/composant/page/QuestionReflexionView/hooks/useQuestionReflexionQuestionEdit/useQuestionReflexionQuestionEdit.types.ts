import type { Dispatch, StateUpdater } from "preact/hooks";
import type { CollectionUi, QuizzQuestionRow, RefCategorieHierarchyRow, RefCategorieRow } from "../../../../../types/quizz";
import type { ReflexionLocalPoolDraft } from "../../QuestionReflexionView.types";

export type UseQuestionReflexionQuestionEditProps = {
  routing: { collectionIdNum: number | null };
  data: {
    collection: CollectionUi | null;
    setCollection: Dispatch<StateUpdater<CollectionUi | null>>;
  };
  refs: {
    localPoolDraftsRef: { current: ReflexionLocalPoolDraft[] };
    chainDirtyRef: { current: boolean };
    selectedGroupeIdRef: { current: number | null };
  };
  chain: {
    setOrdered: Dispatch<StateUpdater<QuizzQuestionRow[]>>;
    setPool: Dispatch<StateUpdater<QuizzQuestionRow[]>>;
    setLocalPoolDrafts: Dispatch<StateUpdater<ReflexionLocalPoolDraft[]>>;
    loadChainFor: (cid: number, gid: number | null) => Promise<void>;
  };
  refCategories: RefCategorieRow[];
  refCategoriesHierarchy: RefCategorieHierarchyRow[];
  categoryTypeForId: (id: number | null, fallback: string) => string;
  status: { setOperationError: (value: string | null) => void };
};
