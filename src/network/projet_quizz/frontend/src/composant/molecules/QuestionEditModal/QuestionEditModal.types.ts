import type { QuizzQuestionDetail, RefCategorieRow } from "../../../types/quizz";

export type CreateReponseDraft = { texte: string; correcte: boolean };

export type QuestionCreateSavePayload = {
  question: string;
  commentaire: string;
  categorie_id: number;
  reponses: CreateReponseDraft[];
};

export type QuestionEditModalProps = {
  open: boolean;
  variant?: "edit" | "create";
  modalTitle?: string;
  loading: boolean;
  loadError: string | null;
  detail: QuizzQuestionDetail | null;
  categorieOptions: RefCategorieRow[];
  draftQuestion: string;
  draftCommentaire: string;
  draftCategorieId: number | null;
  saving: boolean;
  onClose: () => void;
  onDraftQuestion: (v: string) => void;
  onDraftCommentaire: (v: string) => void;
  onDraftCategorieId: (id: number) => void;
  onSave: () => void;
  onReponseUpdated: () => void | Promise<void>;
  onCreateSave?: (payload: QuestionCreateSavePayload) => void | Promise<void>;
};
