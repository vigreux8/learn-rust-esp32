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

export type CollectionUi = {
  id: number;
  user_id: number;
  create_at: string;
  update_at: string;
  nom: string;
  questions: QuestionUi[];
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
  collections: QuizzCollectionRef[];
};

export type QuizzModuleRow = {
  id: number;
  nom: string;
  create_at: string;
  update_at: string;
};
