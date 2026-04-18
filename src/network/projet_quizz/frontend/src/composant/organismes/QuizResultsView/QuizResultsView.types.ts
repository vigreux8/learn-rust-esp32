import type { LastQuizResult } from "../../../lib/lastQuizResult";

export type QuizResultsSummary = {
  good: number;
  total: number;
  percent: number;
  collectionName: string;
};

export type { LastQuizResult };
