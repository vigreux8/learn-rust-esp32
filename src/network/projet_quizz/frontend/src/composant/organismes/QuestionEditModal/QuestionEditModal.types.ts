import type { QuizzQuestionDetail, RefCategorieRow } from "../../../types/quizz";

export type QuestionEditModalProps = {
  // Ce qui vient du parent
  settings: {
    open: boolean;
    onClose: () => void;
    variant?: "edit" | "create";
    modalTitle?: string;
  };
  
  // Les données brutes
  data: {
    questionDetail: QuizzQuestionDetail | null;
    categorieOptions: RefCategorieRow[];
    /** Liste pour le formulaire de création (liée à une collection). */
    sousCollectionsForCreate?: { id: number; nom: string }[];
  };

  // Les fonctions de mise à jour (State parent)
  actions: {
    onSave: () => void;
    onDraftQuestion: (v: string) => void;
    onDraftCommentaire: (v: string) => void;
    onDraftCategorieId: (id: number) => void;
    onDraftSousCollectionId?: (id: number | null) => void;
    onReponseUpdated: () => void | Promise<void>;
    onCreateSave?: (payload: QuestionCreateSavePayload) => void | Promise<void>;
  };

  // L'état de saisie actuel
  drafts: {
    question: string;
    commentaire: string;
    categorieId: number | null;
    /** Sélection pour rattacher la nouvelle question à une sous-collection. */
    sousCollectionId?: number | null;
  };

  // Les indicateurs d'UI
  status: {
    loading: boolean;
    saving: boolean;
    error: string | null;
  };
};

export type CreateReponseDraft = { 
  texte: string; 
  correcte: boolean; 
};

export type QuestionCreateSavePayload = {
  question: string;
  commentaire: string;
  categorie_id: number;
  reponses: CreateReponseDraft[];
  /** Après création : rattachement à cette sous-collection (question déjà dans la collection). */
  sous_collection_id?: number | null;
};