/**
 * Centralise les classes Tailwind pour `Button`.
 * Les variantes restent statiques pour préserver l'analyse Tailwind et éviter
 * les concaténations dynamiques non détectées au build.
 */
export const BUTTON_STYLES = {
  base: "btn rounded-full border-0 shadow-md transition-all duration-300 ease-out hover:shadow-lg active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
  variants: {
    flow: "bg-flow text-white hover:brightness-110",
    learn: "bg-learn text-white hover:brightness-110",
    ghost: "bg-base-100/80 text-flow shadow-sm hover:bg-base-100",
    outline: "bg-transparent text-flow border-2 border-flow/40 hover:border-flow hover:bg-flow/5",
  },
} as const;
