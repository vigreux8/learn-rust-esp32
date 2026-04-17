/**
 * Centralise les classes Tailwind pour `KpiCard`.
 */
export const KPI_CARD_STYLES = {
  wrapper: "relative overflow-hidden",
  glow: "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl",
  content: "relative flex items-start gap-3",
} as const;
