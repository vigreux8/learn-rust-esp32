/**
 * Centralise les classes Tailwind pour `Badge`.
 * Ce fichier évite la duplication de chaînes de classes et garde le JSX lisible,
 * sans contourner Tailwind (classes statiques, détectables au build).
 */
export const BADGE_STYLES = {
  base: "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium",
  tones: {
    flow: "bg-flow/15 text-flow border-flow/20",
    learn: "bg-learn/15 text-learn border-learn/20",
    neutral: "bg-base-200/80 text-base-content/70 border-base-content/10",
  },
} as const;
