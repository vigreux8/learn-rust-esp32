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
  /** `ref_e_categorie.id` via `relation_categorie`, ou `null`. */
  categorie_e_id: number | null;
  categorie_e_type: string | null;
  /** `ref_importance` (question). */
  importance_id: number | null;
  importance_lvl: string | null;
  /** `ref_difficulter` (question). */
  difficulter_id: number | null;
  difficulter_lvl: string | null;
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
  /** Retrait possible seulement via une ligne `personnalité_collection`. */
  detachable: boolean;
  /** Collection dédiée à la fiche personnalité (`personalite.collection_id`). */
  fiche_collection_id: number;
};

export type RefImportancePersonaliteDto = {
  id: number;
  type: string;
};

/** Liste pour rattacher une personnalité à une collection (hors exclusions). */
export type PersonalitePickerRowDto = {
  id: number;
  nom: string;
  prenom: string;
  collection_id: number;
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
  /** `ref_e_categorie.id`, ou `null`. */
  categorie_e_id: number | null;
  categorie_e_type: string | null;
  importance_id: number | null;
  importance_lvl: string | null;
  difficulter_id: number | null;
  difficulter_lvl: string | null;
  collections: QuizzCollectionRef[];
};

/** Ligne `relation_question_implicite` où la question courante participe avec une autre question. */
export type ImplicitRelatedQuestionUi = {
  relation_id: number;
  linked_question_id: number;
  linked_question_preview: string;
};

export type QuizzQuestionDetail = QuizzQuestionRow & {
  reponses: ReponseUi[];
  /** Paires implicitites (sans ordre métier forcé dans l’affichage). */
  implicit_relations: ImplicitRelatedQuestionUi[];
};

export type RefCategorieRow = {
  id: number;
  type: string;
};

/** Parents `ref_p_categorie` avec enfants `ref_e_categorie` (`GET /quizz/categories/hierarchy`). */
export type RefCategorieHierarchyRow = {
  id: number;
  type: string;
  enfants: { id: number; type: string }[];
};

/** Ligne `ref_importance` / `ref_difficulter` pour les questions. */
export type RefQuestionScaleRow = {
  id: number;
  lvl: string;
};

export type QuizzModuleRow = {
  id: number;
  nom: string;
  create_at: string;
  update_at: string;
};

