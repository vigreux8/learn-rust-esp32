import { QUIZZ_DND_PANEL_STYLES } from "../../molecules/QuizzDndQuestionPanels/QuizzDndQuestionPanels.styles";

export const SOUS_COLLECTIONS_VIEW_STYLES = {
  root: "min-h-screen bg-base-200/40",
  pageTitle: "text-2xl font-bold tracking-tight text-base-content",
  /** Colonne gauche + deux colonnes (ancien layout). */
  grid: "grid gap-4 lg:grid-cols-[minmax(14rem,18rem)_1fr] xl:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)_minmax(0,1fr)]",
  subGrid: "grid gap-4 lg:col-span-1 xl:col-span-2 xl:grid-cols-2",
  /** Sous-collections en bandeau, puis questions en dessous. */
  pageStack: "flex flex-col gap-4",
  topBand: "rounded-2xl border border-base-content/10 bg-base-100/90 p-4 shadow-sm shadow-flow/5",
  sousListRow: "flex flex-wrap items-center gap-2",
  bottomGrid: "grid grid-cols-1 gap-4 xl:grid-cols-2",
  listBtn: "btn btn-ghost btn-sm w-full justify-start rounded-xl",
  listBtnActive: "btn btn-primary btn-sm w-full justify-start rounded-xl",
  ...QUIZZ_DND_PANEL_STYLES,
} as const;
