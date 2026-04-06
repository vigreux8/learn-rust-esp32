/** Aligné sur doc/ddb/v1.sql — données de démo pour FlowLearn */

export type SqlBoolInt = 0 | 1;

export interface QuizzReponseRow {
  id: number;
  reponse: string;
  bonne_reponse: SqlBoolInt;
}

export interface QuizzQuestionRow {
  id: number;
  user_id: number;
  create_at: string;
  question: string;
}

export interface QuizzQuestionReponseRow {
  id: number;
  question_id: number;
  reponse_id: number;
}

export interface RefCollectionRow {
  id: number;
  user_id: number;
  create_at: string;
  update_at: string;
  nom: string;
}

export interface QuestionCollectionRow {
  id: number;
  collection_id: number;
  question_id: number;
}

export interface UserKpiRow {
  id: number;
  user_id: number;
  create_at: string;
  question_id: number;
  reponse_id: number;
  duree_session: string;
}

export const MOCK_USER_ID = 1;

export const mockRefCollections: RefCollectionRow[] = [
  {
    id: 1,
    user_id: MOCK_USER_ID,
    create_at: "2026-04-01T10:00:00Z",
    update_at: "2026-04-05T12:00:00Z",
    nom: "Le créateur de la casquette",
  },
  {
    id: 2,
    user_id: MOCK_USER_ID,
    create_at: "2026-04-02T09:00:00Z",
    update_at: "2026-04-06T08:30:00Z",
    nom: "Histoire de l'IA",
  },
];

export const mockQuestions: QuizzQuestionRow[] = [
  {
    id: 101,
    user_id: MOCK_USER_ID,
    create_at: "2026-04-01T10:05:00Z",
    question:
      "Quelle entreprise est surtout associée à la popularisation de la casquette de baseball auprès du grand public au XXe siècle ?",
  },
  {
    id: 102,
    user_id: MOCK_USER_ID,
    create_at: "2026-04-01T10:10:00Z",
    question:
      "À l'origine, la visière de la casquette de baseball servait surtout à…",
  },
  {
    id: 103,
    user_id: MOCK_USER_ID,
    create_at: "2026-04-01T10:15:00Z",
    question:
      "Le terme anglais « snapback » désigne surtout une casquette avec…",
  },
  {
    id: 201,
    user_id: MOCK_USER_ID,
    create_at: "2026-04-02T09:05:00Z",
    question: "Qui a popularisé l'expression « intelligence artificielle » en 1956 ?",
  },
  {
    id: 202,
    user_id: MOCK_USER_ID,
    create_at: "2026-04-02T09:10:00Z",
    question: "Le test de Turing vise à évaluer…",
  },
  {
    id: 203,
    user_id: MOCK_USER_ID,
    create_at: "2026-04-02T09:15:00Z",
    question: "Quel modèle a fortement popularisé les LLM grand public en 2022-2023 ?",
  },
];

export const mockReponses: QuizzReponseRow[] = [
  { id: 1, reponse: "New Era", bonne_reponse: 1 },
  { id: 2, reponse: "Nike (années 1960)", bonne_reponse: 0 },
  { id: 3, reponse: "Adidas Originals", bonne_reponse: 0 },
  { id: 4, reponse: "Supreme", bonne_reponse: 0 },
  { id: 5, reponse: "Protéger les yeux du soleil", bonne_reponse: 1 },
  { id: 6, reponse: "Tenir les lunettes", bonne_reponse: 0 },
  { id: 7, reponse: "Remplacer le chapeau melon", bonne_reponse: 0 },
  { id: 8, reponse: "Afficher un sponsor", bonne_reponse: 0 },
  { id: 9, reponse: "Une fermeture réglable à l'arrière", bonne_reponse: 1 },
  { id: 10, reponse: "Une visière en cuir", bonne_reponse: 0 },
  { id: 11, reponse: "Un filet respirant intégral", bonne_reponse: 0 },
  { id: 12, reponse: "Des oreillettes chauffantes", bonne_reponse: 0 },
  { id: 13, reponse: "John McCarthy", bonne_reponse: 1 },
  { id: 14, reponse: "Alan Turing", bonne_reponse: 0 },
  { id: 15, reponse: "Marvin Minsky", bonne_reponse: 0 },
  { id: 16, reponse: "Geoffrey Hinton", bonne_reponse: 0 },
  { id: 17, reponse: "Si une machine peut imiter l'intelligence humaine dans une conversation", bonne_reponse: 1 },
  { id: 18, reponse: "La vitesse d'un processeur", bonne_reponse: 0 },
  { id: 19, reponse: "La taille d'un dataset", bonne_reponse: 0 },
  { id: 20, reponse: "Le nombre de paramètres d'un modèle", bonne_reponse: 0 },
  { id: 21, reponse: "ChatGPT (GPT-3.5 / GPT-4)", bonne_reponse: 1 },
  { id: 22, reponse: "AlexNet", bonne_reponse: 0 },
  { id: 23, reponse: "Word2vec seul", bonne_reponse: 0 },
  { id: 24, reponse: "ResNet", bonne_reponse: 0 },
];

export const mockQuestionCollection: QuestionCollectionRow[] = [
  { id: 1, collection_id: 1, question_id: 101 },
  { id: 2, collection_id: 1, question_id: 102 },
  { id: 3, collection_id: 1, question_id: 103 },
  { id: 4, collection_id: 2, question_id: 201 },
  { id: 5, collection_id: 2, question_id: 202 },
  { id: 6, collection_id: 2, question_id: 203 },
];

export const mockQuizzQuestionReponse: QuizzQuestionReponseRow[] = [
  { id: 1, question_id: 101, reponse_id: 1 },
  { id: 2, question_id: 101, reponse_id: 2 },
  { id: 3, question_id: 101, reponse_id: 3 },
  { id: 4, question_id: 101, reponse_id: 4 },
  { id: 5, question_id: 102, reponse_id: 5 },
  { id: 6, question_id: 102, reponse_id: 6 },
  { id: 7, question_id: 102, reponse_id: 7 },
  { id: 8, question_id: 102, reponse_id: 8 },
  { id: 9, question_id: 103, reponse_id: 9 },
  { id: 10, question_id: 103, reponse_id: 10 },
  { id: 11, question_id: 103, reponse_id: 11 },
  { id: 12, question_id: 103, reponse_id: 12 },
  { id: 13, question_id: 201, reponse_id: 13 },
  { id: 14, question_id: 201, reponse_id: 14 },
  { id: 15, question_id: 201, reponse_id: 15 },
  { id: 16, question_id: 201, reponse_id: 16 },
  { id: 17, question_id: 202, reponse_id: 17 },
  { id: 18, question_id: 202, reponse_id: 18 },
  { id: 19, question_id: 202, reponse_id: 19 },
  { id: 20, question_id: 202, reponse_id: 20 },
  { id: 21, question_id: 203, reponse_id: 21 },
  { id: 22, question_id: 203, reponse_id: 22 },
  { id: 23, question_id: 203, reponse_id: 23 },
  { id: 24, question_id: 203, reponse_id: 24 },
];

export const mockUserKpi: UserKpiRow[] = [
  {
    id: 1,
    user_id: MOCK_USER_ID,
    create_at: "2026-04-05T14:00:00Z",
    question_id: 101,
    reponse_id: 1,
    duree_session: "4.2",
  },
  {
    id: 2,
    user_id: MOCK_USER_ID,
    create_at: "2026-04-05T14:01:00Z",
    question_id: 102,
    reponse_id: 6,
    duree_session: "8.1",
  },
  {
    id: 3,
    user_id: MOCK_USER_ID,
    create_at: "2026-04-05T14:03:00Z",
    question_id: 201,
    reponse_id: 13,
    duree_session: "3.5",
  },
  {
    id: 4,
    user_id: MOCK_USER_ID,
    create_at: "2026-04-06T09:00:00Z",
    question_id: 202,
    reponse_id: 17,
    duree_session: "5.0",
  },
  {
    id: 5,
    user_id: MOCK_USER_ID,
    create_at: "2026-04-06T09:05:00Z",
    question_id: 203,
    reponse_id: 22,
    duree_session: "6.7",
  },
];

/** Pour l’UI : réponse avec booléen pratique */
export interface ReponseUi {
  id: number;
  reponse: string;
  bonne_reponse: boolean;
}

export interface QuestionUi extends QuizzQuestionRow {
  reponses: ReponseUi[];
}

export interface CollectionUi extends RefCollectionRow {
  questions: QuestionUi[];
}

function toReponseUi(row: QuizzReponseRow): ReponseUi {
  return {
    id: row.id,
    reponse: row.reponse,
    bonne_reponse: row.bonne_reponse === 1,
  };
}

export function getCollectionUi(collectionId: number): CollectionUi | undefined {
  const col = mockRefCollections.find((c) => c.id === collectionId);
  if (!col) return undefined;

  const orderedQids = mockQuestionCollection
    .filter((qc) => qc.collection_id === collectionId)
    .sort((a, b) => a.id - b.id)
    .map((qc) => qc.question_id);

  const questions: QuestionUi[] = orderedQids.map((qid) => {
    const q = mockQuestions.find((x) => x.id === qid);
    if (!q) throw new Error(`Question manquante: ${qid}`);
    const rids = mockQuizzQuestionReponse
      .filter((j) => j.question_id === qid)
      .sort((a, b) => a.id - b.id)
      .map((j) => j.reponse_id);
    const reponses = rids
      .map((rid) => mockReponses.find((r) => r.id === rid))
      .filter((r): r is QuizzReponseRow => r != null)
      .map(toReponseUi);
    return { ...q, reponses };
  });

  return { ...col, questions };
}

export function listCollectionsUi(): CollectionUi[] {
  return mockRefCollections.map((c) => getCollectionUi(c.id)!);
}

/** Toutes les questions avec leurs réponses (pour le mode aléatoire). */
export function getAllQuestionsUi(): QuestionUi[] {
  return mockQuestions.map((q) => {
    const rids = mockQuizzQuestionReponse
      .filter((j) => j.question_id === q.id)
      .sort((a, b) => a.id - b.id)
      .map((j) => j.reponse_id);
    const reponses = rids
      .map((rid) => mockReponses.find((r) => r.id === rid))
      .filter((r): r is QuizzReponseRow => r != null)
      .map(toReponseUi);
    return { ...q, reponses };
  });
}

/** Mélange Fisher–Yates — nouvel ordre à chaque appel. */
export function buildRandomQuizOrder(): QuestionUi[] {
  const copy = [...getAllQuestionsUi()];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function isCorrectAnswer(reponseId: number): boolean {
  const r = mockReponses.find((x) => x.id === reponseId);
  return r?.bonne_reponse === 1;
}

/** Sessions fictives pour l’écran stats */
export interface MockSessionSummary {
  id: string;
  date: string;
  collectionName: string;
  scoreLabel: string;
  good: number;
  total: number;
}

export const mockSessionSummaries: MockSessionSummary[] = [
  {
    id: "s1",
    date: "2026-04-06",
    collectionName: "Histoire de l'IA",
    scoreLabel: "2 / 3",
    good: 2,
    total: 3,
  },
  {
    id: "s2",
    date: "2026-04-05",
    collectionName: "Le créateur de la casquette",
    scoreLabel: "3 / 3",
    good: 3,
    total: 3,
  },
  {
    id: "s3",
    date: "2026-04-04",
    collectionName: "Histoire de l'IA",
    scoreLabel: "1 / 3",
    good: 1,
    total: 3,
  },
];

export const APP_VERSION = "0.1.0";
