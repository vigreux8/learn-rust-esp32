/**
 * Centralise les classes Tailwind pour `AppFooter`.
 * Les classes restent statiques pour conserver les bonnes pratiques Tailwind.
 */
export const APP_FOOTER_STYLES = {
  footer: "mt-auto border-t border-base-content/5 bg-base-100/50 py-4 text-center text-xs text-base-content/55",
  container: "mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4",
  separator: "hidden sm:inline text-base-content/25",
  badge: "inline-flex items-center gap-1.5 rounded-full bg-flow/10 px-2.5 py-0.5 text-flow",
} as const;
