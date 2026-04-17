/**
 * Centralise les classes Tailwind pour `ProgressBar`.
 * Le composant garde des classes explicites et stables pour rester lisible
 * et parfaitement compatible avec la génération Tailwind.
 */
export const PROGRESS_BAR_STYLES = {
  wrapper: "w-full",
  progress: "flowlearn-progress progress h-3 w-full rounded-full bg-base-200/80",
  footer: "mt-1 flex justify-between text-xs text-base-content/60",
  value: "font-medium text-flow",
} as const;
