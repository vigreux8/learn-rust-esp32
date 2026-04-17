/**
 * Centralise les classes Tailwind pour `AnswerOption`.
 * Les variantes d'état sont explicites et statiques pour rester compatibles
 * avec l'extraction Tailwind et garder un JSX plus lisible.
 */
export const ANSWER_OPTION_STYLES = {
  base: "w-full rounded-full border-2 px-5 py-3.5 text-left text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  idle: "border-base-content/10 bg-base-200/45 hover:border-flow/40 hover:bg-flow/[0.07] hover:scale-[1.02]",
  dimmed: "scale-[0.98] border-transparent bg-base-200/25 opacity-50",
  correct: "border-flow/45 bg-flow/12 text-base-content shadow-md shadow-flow/10 ring-2 ring-flow/20",
  wrong: "border-learn/40 bg-learn/10 text-base-content ring-2 ring-learn/15",
} as const;
