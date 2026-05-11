import type { Dispatch, StateUpdater } from "preact/hooks";
import type {
  QuestionCreateSavePayload,
} from "../../../../ui/organismes/QuestionEditModal/QuestionEditModal.types";
import type {
  QuestionUi,
  QuizzQuestionDetail,
  RefCategorieRow,
} from "../../../../../types/quizz";
import type { SessionData } from "../../QuizSessionView.types";

export type UseQuizSessionEditModalOptions = {
  navigation: {
    viewingIndex: number;
  };
  identity: {
    userId: number;
  };
  session: SessionData | null;
  refs: {
    refCategories: RefCategorieRow[];
  };
  feedback: {
    setMessage: Dispatch<StateUpdater<string | null>>;
  };
  dataDeps: {
    setSession: Dispatch<StateUpdater<SessionData | null>>;
  };
};

export type UseQuizSessionEditModalResult = {
  modal: {
    settings: {
      open: boolean;
      onClose: () => void;
      variant: "edit" | "create";
      modalTitle?: string;
    };
    actions: {
      onSave: () => void;
      onDraftQuestion: Dispatch<StateUpdater<string>>;
      onDraftCommentaire: Dispatch<StateUpdater<string>>;
      onDraftCategorieId: Dispatch<StateUpdater<number | null>>;
      onDraftSousCollectionId: Dispatch<StateUpdater<number | null>>;
      onDraftCreateLinkImplicit: Dispatch<StateUpdater<boolean>>;
      onReponseUpdated: () => void;
      onCreateSave: (payload: QuestionCreateSavePayload) => Promise<void>;
      onRemoveImplicitRelation: (relationId: number) => void;
    };
    status: {
      loading: boolean;
      saving: boolean;
      error: string | null;
    };
    data: {
      questionDetail: QuizzQuestionDetail | null;
      categorieOptions: RefCategorieRow[];
      sousCollectionsForCreate: { id: number; nom: string }[];
    };
    drafts: {
      question: string;
      commentaire: string;
      categorieId: number | null;
      sousCollectionId: number | null;
      createLinkImplicit: boolean | undefined;
    };
  };
  internals: {
    questionDetail: QuizzQuestionDetail | null;
    closeQuestionModal: () => void;
    openEditQuestionModal: (q: QuestionUi) => void;
    openCreateLinkedQuestionModal: (q: QuestionUi) => void;
  };
};
