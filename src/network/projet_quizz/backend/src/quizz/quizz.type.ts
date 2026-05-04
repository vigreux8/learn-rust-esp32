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
  /** `ref_p_categorie.id` (API inchangée : champ toujours nommé categorie_id). */
  categorie_id: number;
  /** `ref_p_categorie.type` (ex. histoire, pratique). */
  categorie_type: string;
  reponses: ReponseUi[];
};

export type CollectionModuleRef = {
  id: number;
  nom: string;
};

/** Enfant d’une collection (`relation-collection.e_collection`) — liste légère pour l’UI. */
export type CollectionSousCollectionRef = {
  id: number;
  nom: string;
};

/** Personnalité affichée au-dessus d’une carte collection (lien direct ou `personnalite_collection`). */
export type CollectionPersonnaliteRef = {
  id: number;
  nom: string;
  prenom: string;
  /** `ref_importance_personalite.type` si présent (ex. pionnier, important, secondaire). */
  importance_type: string | null;
};

/** Question rattachée à une collection enfant (`question_collection`). */
export type SousCollectionQuestionRef = {
  relation_id: number;
  question_id: number;
  question: string;
  categorie_type: string;
};

/**
 * Même forme JSON qu’en v3 : une « sous-collection » est une `quizz_collection` enfant,
 * liée au parent par `relation-collection` ; les questions y sont liées par `question_collection`
 * (sans retirer le lien parent).
 */
export type SousCollectionUi = {
  id: number;
  /** Identifiant de la collection parent. */
  collection_id: number;
  nom: string;
  description: string;
  questions: SousCollectionQuestionRef[];
};

/** Comptage des questions liées à la collection, par `ref_p_categorie.type` (toutes les questions, hors filtre `qtype`). */
export type CollectionQuestionCountsByType = {
  histoire: number;
  pratique: number;
  connaissance: number;
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
  /** v4 : collections enfants (`relation-collection` + `quizz_collection` enfant). */
  sous_collections: CollectionSousCollectionRef[];
  /** v4 : id parent si cette collection est enfant ; sinon `null`. */
  parent_collection_id: number | null;
  /** Personnalités associées à cette collection (affichage au-dessus de la carte). */
  personnalites: CollectionPersonnaliteRef[];
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
  /** `ref_p_categorie.id` (nom API inchangé). */
  categorie_id: number;
  /** `ref_p_categorie.type` (ex. histoire, pratique). */
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

