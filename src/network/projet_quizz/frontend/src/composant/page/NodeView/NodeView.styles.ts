export const NODE_VIEW_STYLES = {
  /** Hauteur viewport : une colonne header + flux plein écran. */
  root: "flex h-dvh min-h-0 flex-col overflow-hidden",
  /** Pleine largeur, sans gouttière ni max-width — le canvas touche les bords. */
  pageMain: "flex min-h-0 flex-1 flex-col !max-w-none px-0 py-0 md:py-0",
  /** Colonne qui prend tout l’espace sous le header. */
  flowShell: "flex min-h-0 min-w-0 flex-1 flex-col",
  /** Conteneur dont la hauteur est celle du parent flex (obligatoire pour React Flow). */
  canvasInner: "h-full min-h-0 w-full min-w-0 flex-1",
} as const;
