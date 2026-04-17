/**
 * Centralise les classes Tailwind pour `Card`.
 * Le mapping des paddings simplifie la lecture et conserve des classes statiques
 * compatibles avec l'extraction Tailwind.
 */
export const CARD_STYLES = {
  base: "rounded-[var(--radius-box)] bg-base-100/90 backdrop-blur-sm shadow-lg shadow-flow/5 border border-base-content/5 transition-all duration-300 ease-out",
  paddings: {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  },
} as const;
