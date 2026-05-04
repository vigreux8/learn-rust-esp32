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
  /** `ref_p_categorie.id` (stable entre exports/imports “app”). */
  categorie_id: number;
  /** `ref_p_categorie.type` (ex. histoire, pratique, connaissance). */
  categorie_type: string;
  /** Enfant `ref_e_categorie` (`relation_categorie`), ou `null`. */
  categorie_e_id: number | null;
  categorie_e_type: string | null;
  /** `ref_importance` (question). */
  importance_id: number | null;
  importance_lvl: string | null;
  /** `ref_difficulter`. */
  difficulter_id: number | null;
  difficulter_lvl: string | null;
  reponses: ReponseUi[];
}

/** `quizz_module` — supercollection regroupant des collections. */
export interface QuizzModuleRow {
  id: number;
  nom: string;
  create_at: string;
  update_at: string;
}

/** Comptage des questions de la collection par type de catégorie parent (toute la collection). */
export interface CollectionQuestionCountsByType {
  histoire: number;
  pratique: number;
  connaissance: number;
}

/** Collection enfant (`relation-collection`) — liste / jeu ciblé par `sousCollectionId`. */
export interface CollectionSousCollectionRef {
  id: number;
  nom: string;
}

/** Personnalité liée à une collection (affichage au-dessus de la carte). */
export interface CollectionPersonnaliteRef {
  id: number;
  nom: string;
  prenom: string;
  /** ex. pionnier, important, secondaire (`ref_importance_personalite.type`). */
  importance_type: string | null;
  /** Présente si la ligne peut être retirée (liaison `personnalité_collection`). */
  detachable?: boolean;
  /** Collection à ouvrir pour la fiche (questions / jeu). */
  fiche_collection_id: number;
}

/** Référentiel importance (boutons pionnier / important / secondaire). */
export interface RefImportancePersonaliteUi {
  id: number;
  type: string;
}

/** Liste des personnalités pour rattacher à une carte. */
export interface PersonalitePickerRowUi {
  id: number;
  nom: string;
  prenom: string;
  collection_id: number;
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
  /** v4 : enfants du parent (`relation-collection`) ; défaut `[]` si absent. */
  sous_collections?: CollectionSousCollectionRef[];
  /** v4 : parent si collection enfant ; défaut `null` si absent. */
  parent_collection_id?: number | null;
  /** Personnalités associées ; défaut `[]` si absent. */
  personnalites?: CollectionPersonnaliteRef[];
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
  categorie_e_id: number | null;
  categorie_e_type: string | null;
  importance_id: number | null;
  importance_lvl: string | null;
  difficulter_id: number | null;
  difficulter_lvl: string | null;
  collections: QuizzCollectionRef[];
}

export interface QuizzQuestionDetail extends QuizzQuestionRow {
  reponses: ReponseUi[];
}

export interface RefCategorieRow {
  id: number;
  type: string;
}

/** Parents `ref_p_categorie` avec enfants `ref_e_categorie` (`GET /quizz/categories/hierarchy`). */
export interface RefCategorieHierarchyRow {
  id: number;
  type: string;
  enfants: { id: number; type: string }[];
}

/** `ref_importance` / `ref_difficulter` (`GET /quizz/ref-question-importance` …). */
export interface RefQuestionScaleRow {
  id: number;
  lvl: string;
}

/** Question liée à la collection enfant (`question_collection` sur l’id enfant). */
export interface SousCollectionQuestionRef {
  relation_id: number;
  question_id: number;
  question: string;
  categorie_type: string;
}

/**
 * « Sous-collection » côté API : même JSON qu’avant ; en v4 `id` est l’id de la `quizz_collection` enfant.
 * Les questions y sont dupliquées par lien (`question_collection`) sans retirer le lien parent.
 */
export interface SousCollectionUi {
  id: number;
  /** Id de la collection parent. */
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
