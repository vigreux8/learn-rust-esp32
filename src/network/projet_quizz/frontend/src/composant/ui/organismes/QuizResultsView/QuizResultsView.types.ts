import type { LastQuizResult } from "../../../../lib/lastQuizResult";

export type QuizResultsViewProps = {
  route?: Record<string, never>;
};

export type QuizResultsSummary = {
  good: number;
  total: number;
  percent: number;
  collectionName: string;
};

export type { LastQuizResult };
