import type { Dispatch, StateUpdater } from "preact/hooks";
import type {
  QuestionCategorieKey,
} from "../../../../../lib/questionCategories";
import type {
  RefCategorieHierarchyRow,
  RefCategorieRow,
  RefQuestionScaleRow,
} from "../../../../../types/quizz";
import type { SessionData } from "../../QuizSessionView.types";

export type QuizAnnotationSyncPack = {
  syncVerifierIfNeeded: () => Promise<boolean>;
  syncDraftCategoriesIfNeeded: () => Promise<boolean>;
  syncDraftScalesIfNeeded: () => Promise<boolean>;
};

export type UseQuizSessionQuestionAnnotationsOptions = {
  data: {
    session: SessionData | null;
    index: number;
    setSession: Dispatch<StateUpdater<SessionData | null>>;
  };
  refsTables: {
    refCategoriesHierarchy: RefCategorieHierarchyRow[];
    refCategories: RefCategorieRow[];
    difficulteRows: RefQuestionScaleRow[];
    importanceRows: RefQuestionScaleRow[];
  };
  locks: {
    interactionLockedRef: { current: boolean };
  };
  feedback: {
    setMessage: Dispatch<StateUpdater<string | null>>;
  };
  syncRegistration: {
    register: (pack: QuizAnnotationSyncPack) => void;
  };
};

export type UseQuizSessionQuestionAnnotationsResult = {
  drafts: {
    verifier: boolean;
    setVerifier: Dispatch<StateUpdater<boolean>>;
    categorieParentId: number | null;
    categorieEnfantId: number | null;
    importanceId: number | null;
    difficulteId: number | null;
    handleParentCategory: (parentKey: QuestionCategorieKey) => void;
    handleChildCategory: (enfantId: number) => void;
    handleDraftDifficulte: (id: number) => void;
    handleDraftImportance: (id: number) => void;
  };
  refsForUi: {
    refCategoriesHierarchy: RefCategorieHierarchyRow[];
    refCategories: RefCategorieRow[];
    difficulteRows: RefQuestionScaleRow[];
    importanceRows: RefQuestionScaleRow[];
    resolveDraftParentKey: () => QuestionCategorieKey | null;
  };
};
