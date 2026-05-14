import { SOUS_COLLECTIONS_VIEW_STYLES } from "../SousCollectionsView/SousCollectionsView.styles";

export const QUESTION_REFLEXION_VIEW_STYLES = {
  root: SOUS_COLLECTIONS_VIEW_STYLES.root,
  pageTitle: SOUS_COLLECTIONS_VIEW_STYLES.pageTitle,
  /** Enveloppe tout le contenu principal sous PageMain (titre, alertes, DnD). */
  pageContentOuter: "flex w-full min-w-0 max-w-full flex-col gap-6",
  backToNodeRow: "mb-3 flex",
  pageStack: SOUS_COLLECTIONS_VIEW_STYLES.pageStack,
  topBand: SOUS_COLLECTIONS_VIEW_STYLES.topBand,
  bottomGrid: SOUS_COLLECTIONS_VIEW_STYLES.bottomGrid,
  /**
   * Ligne « grille pool|ordonné » + palette : la palette commence au même niveau vertical que la grille
   * (pas sous le bandeau / liste des suites).
   */
  gridWithPaletteRow:
    "flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:gap-5",
  /**
   * Rail couleurs à droite de la grille : `sticky` avec top ≈ milieu du viewport pour rester centrée
   * sur la hauteur « canvas » quand on défile ; au début de page elle suit le flux (alignée sur la grille).
   */
  paletteRailAside:
    "flex w-full shrink-0 justify-center lg:z-10 lg:w-auto lg:max-w-[5rem] lg:justify-end lg:self-start lg:sticky lg:top-[max(0.5rem,calc(50vh-7rem))]",
  paletteRailCard:
    "flex max-h-[min(24rem,70vh)] w-full max-w-[20rem] flex-row flex-wrap items-center justify-center gap-2 overflow-y-auto rounded-2xl border border-base-content/15 bg-base-100/95 px-3 py-2 shadow-md shadow-base-300/15 backdrop-blur-sm lg:max-h-[min(28rem,75vh)] lg:w-auto lg:max-w-none lg:flex-col lg:items-center lg:gap-2 lg:px-2 lg:py-3",
} as const;
