export type StatsDashboardProps = {
  route?: Record<string, never>;
};

export type DayBar = { key: string; label: string; count: number; h: number };

export type WeekBarChartRow = DayBar & { barHeightPct: number };

export type KpisAgg = {
  total: number;
  good: number;
  ratio: number;
  avgSecLabel: string;
  uniqueQuestions: number;
  sessionsHint: string;
};
