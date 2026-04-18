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
  /** Colonne SQL `verifier` : export/import app sous le nom `fakechecker`. */
  verifier: boolean;
  /** `ref_categorie.id` (utile pour export/import “app”). */
  categorie_id: number;
  /** `ref_categorie.type` (ex. histoire, pratique). */
  categorie_type: string;
  reponses: ReponseUi[];
};

export type CollectionModuleRef = {
  id: number;
  nom: string;
};

/** Sous-collection rattachée à une collection (liste légère pour l’UI). */
export type CollectionSousCollectionRef = {
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
  /** Sous-collections (`sous_collections`) pour sélection / jeu ciblé. */
  sous_collections: CollectionSousCollectionRef[];
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
  verifier: boolean;
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

/** Question rattachée à une sous-collection (UI drag-drop). */
export type SousCollectionQuestionRef = {
  relation_id: number;
  question_id: number;
  question: string;
  categorie_type: string;
};

export type SousCollectionUi = {
  id: number;
  collection_id: number;
  nom: string;
  description: string;
  questions: SousCollectionQuestionRef[];
};
