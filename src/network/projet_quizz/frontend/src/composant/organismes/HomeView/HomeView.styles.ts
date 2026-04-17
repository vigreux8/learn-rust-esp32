/**
 * Centralise les classes Tailwind principales pour `HomeView`.
 * Les classes restent statiques pour rester compatibles avec l'extraction Tailwind.
 */
export const HOME_VIEW_STYLES = {
  root: "flex min-h-dvh flex-col",
  main: "fl-page-enter flex flex-1 flex-col items-center justify-center px-4 py-16",
} as const;
