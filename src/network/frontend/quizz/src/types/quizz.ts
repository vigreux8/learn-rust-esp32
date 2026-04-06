/** Types alignés sur l’API Nest `/api` et le schéma Prisma. */

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
  reponses: ReponseUi[];
}

export interface CollectionUi {
  id: number;
  user_id: number;
  create_at: string;
  update_at: string;
  nom: string;
  questions: QuestionUi[];
  createur_pseudot: string;
}

export interface QuizzQuestionRow {
  id: number;
  user_id: number;
  create_at: string;
  question: string;
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
