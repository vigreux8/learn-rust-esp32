export type ReponseUi = {
  id: number;
  reponse: string;
  bonne_reponse: boolean;
};

export type QuestionUi = {
  id: number;
  user_id: number;
  create_at: string;
  question: string;
  commentaire: string;
  reponses: ReponseUi[];
};

export type CollectionModuleRef = {
  id: number;
  nom: string;
};

/** Comptage des questions liées à la collection, par `ref_categorie.type` (toutes les questions, hors filtre `qtype`). */
export type CollectionQuestionCountsByType = {
  histoire: number;
  pratique: number;
};

export type CollectionUi = {
  id: number;
  user_id: number;
  create_at: string;
  update_at: string;
  nom: string;
  questions: QuestionUi[];
  /** Effectifs par type de catégorie (toute la collection). */
  question_counts_by_type: CollectionQuestionCountsByType;
  createur_pseudot: string;
  /** Super-collections (`quizz_module`) liées via `quizz_module_collection`. */
  modules: CollectionModuleRef[];
};

export type QuizzCollectionRef = {
  id: number;
  nom: string;
};

export type QuizzQuestionRow = {
  id: number;
  user_id: number;
  create_at: string;
  question: string;
  commentaire: string;
  /** `ref_categorie.id` */
  categorie_id: number;
  /** `ref_categorie.type` (ex. histoire, pratique) */
  categorie_type: string;
  collections: QuizzCollectionRef[];
};

export type QuizzQuestionDetail = QuizzQuestionRow & {
  reponses: ReponseUi[];
};

export type RefCategorieRow = {
  id: number;
  type: string;
};

export type QuizzModuleRow = {
  id: number;
  nom: string;
  create_at: string;
  update_at: string;
};
