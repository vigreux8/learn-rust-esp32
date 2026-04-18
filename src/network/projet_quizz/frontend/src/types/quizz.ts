/** Types alignés sur l’API Nest `/api` et le schéma Prisma. */

export type DeviceLookupResult =
  | { known: true; user: { id: number; pseudot: string } }
  | { known: false };

export interface ReponseUi {
  id: number;
  reponse: string;
  bonne_reponse: boolean;
}

export interface QuestionUi {
  id: number;
  user_id: number;
  create_at: string;
  question: string;
  /** Anecdote pédagogique (sans recopier mot pour mot la bonne réponse). */
  commentaire: string;
  /** Colonne `verifier` côté API ; champ JSON d’export/import app : `fakechecker`. */
  verifier: boolean;
  /** `ref_categorie.id` (stable entre exports/imports “app”). */
  categorie_id: number;
  /** `ref_categorie.type` (ex. histoire, pratique). */
  categorie_type: string;
  reponses: ReponseUi[];
}

/** `quizz_module` — supercollection regroupant des collections. */
export interface QuizzModuleRow {
  id: number;
  nom: string;
  create_at: string;
  update_at: string;
}

/** Comptage des questions de la collection par type de catégorie (toute la collection). */
export interface CollectionQuestionCountsByType {
  histoire: number;
  pratique: number;
}

export interface CollectionUi {
  id: number;
  user_id: number;
  create_at: string;
  update_at: string;
  nom: string;
  questions: QuestionUi[];
  question_counts_by_type: CollectionQuestionCountsByType;
  createur_pseudot: string;
  modules: { id: number; nom: string }[];
}

export interface QuizzCollectionRef {
  id: number;
  nom: string;
}

export interface QuizzQuestionRow {
  id: number;
  user_id: number;
  create_at: string;
  question: string;
  commentaire: string;
  verifier: boolean;
  categorie_id: number;
  categorie_type: string;
  collections: QuizzCollectionRef[];
}

export interface QuizzQuestionDetail extends QuizzQuestionRow {
  reponses: ReponseUi[];
}

export interface RefCategorieRow {
  id: number;
  type: string;
}

/** Aligné sur `SousCollectionUi` côté API Nest. */
export interface SousCollectionQuestionRef {
  relation_id: number;
  question_id: number;
  question: string;
  categorie_type: string;
}

export interface SousCollectionUi {
  id: number;
  collection_id: number;
  nom: string;
  description: string;
  questions: SousCollectionQuestionRef[];
}

export interface UserKpiRow {
  id: number;
  user_id: number;
  create_at: string;
  question_id: number;
  reponse_id: number;
  duree_session: string;
  correct: boolean;
}

export interface SessionSummary {
  id: string;
  date: string;
  collectionName: string;
  scoreLabel: string;
  good: number;
  total: number;
}

export interface SessionDetail extends SessionSummary {
  questionsPreview: { id: number; question: string }[];
}
