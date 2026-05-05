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
    onDraftCreateLinkImplicit?: (value: boolean) => void;
    onReponseUpdated: () => void | Promise<void>;
    /** Édition locale d'une réponse (ex. brouillon non persisté). */
    onLocalDraftReponseSave?: (reponseId: number, reponse: string) => void | Promise<void>;
    onCreateSave?: (payload: QuestionCreateSavePayload) => void | Promise<void>;
    /** Supprimer une ligne `relation_question_implicite` puis recharger le détail. */
    onRemoveImplicitRelation?: (relationId: number) => void | Promise<void>;
  };

  // L'état de saisie actuel
  drafts: {
    question: string;
    commentaire: string;
    categorieId: number | null;
    /** Sélection pour rattacher la nouvelle question à une sous-collection. */
    sousCollectionId?: number | null;
    /**
     * Contrôle une case dans le formulaire création (session quiz) : lien implicite parent ↔ nouvelle question.
     * Si absent (`undefined`), la case n’est pas affichée.
     */
    createLinkImplicit?: boolean;
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
  /**
   * `false` : ne pas passer `parent_question_id` au backend — pas d’entrée dans `relation_question_implicite`.
   * Omit ou `true` : comportement par défaut (création liée depuis une question parent).
   */
  link_implicit_relation?: boolean;
};