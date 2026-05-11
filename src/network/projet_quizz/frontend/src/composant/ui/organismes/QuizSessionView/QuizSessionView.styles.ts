export const QUIZ_SESSION_STYLES = {
  pageShell: "flex min-h-dvh flex-col",
  centeredMain:
    "fl-page-enter mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center",
  contentMain:
    "fl-page-enter mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-6 md:py-8 xl:max-w-6xl",
  topRow: "mb-6 flex items-center gap-2",
  badgesRow: "flex flex-wrap items-center gap-2",
  orderBadgeWrap: "max-w-[min(100%,18rem)] truncate",
  actionMessage:
    "mb-3 rounded-xl border border-flow/20 bg-flow/5 px-3 py-2 text-center text-sm text-base-content",
  bodyLayout:
    "flex flex-col gap-4 md:flex-row md:flex-nowrap md:items-stretch md:justify-center md:gap-5",
  aside: "flex shrink-0 flex-row flex-wrap gap-2 md:order-1 md:w-36 md:flex-col md:items-stretch",
  asideRight:
    "flex shrink-0 flex-row flex-wrap gap-2 md:order-3 md:w-36 md:flex-col md:items-stretch",
  actionButton: "btn-sm flex-1 gap-1 sm:flex-none",
  actionButtonText: "hidden sm:inline",
  verifierToggleBase:
    "btn btn-sm mt-1 flex h-auto min-h-0 w-full cursor-pointer flex-nowrap items-center justify-start gap-2 rounded-full border-2 py-2.5 pl-3 pr-4 text-left text-sm font-medium shadow-md transition-all duration-300 ease-out hover:shadow-lg active:scale-[0.97] md:mt-0",
  verifierToggleOn: "border-flow/40 bg-transparent text-flow hover:border-flow hover:bg-flow/5",
  verifierToggleOff: "border-error/50 bg-error/10 text-error hover:border-error hover:bg-error/15",
  categorieSectionWrap:
    "mt-3 flex flex-col gap-2 border-t border-base-content/15 pt-3",
  categorieResume: "text-xs font-medium text-base-content/70",
  categorieButtonRow: "flex flex-wrap gap-1.5",
  categorieChip:
    "btn btn-xs min-h-8 shrink-0 rounded-full border font-normal normal-case",
  categorieChipActive: "border-flow/50 bg-flow/15 text-flow",
  categorieChipInactive: "border-base-content/20 bg-base-100 text-base-content/80",
  scaleAsideTitle:
    "mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-base-content/55",
  scaleAsideStack: "flex w-full flex-col gap-1.5",
  scaleAsideBlock: "rounded-xl border border-base-content/10 bg-base-200/20 p-2.5",
  /** Dans l’unique encadré catégorie : espacement entre partie parente et sous-catégories */
  categorieBlockInner: "flex flex-col gap-2.5",
  categorieBlockSubDivider: "border-t border-base-content/10 pt-2.5",
  card: "min-w-0 flex-1 transition duration-300 md:order-2",
  questionMeta: "mb-4 text-xs font-medium uppercase tracking-wide text-base-content/45",
  questionTitle:
    "mb-6 text-lg font-semibold leading-snug text-base-content sm:text-xl md:text-2xl md:leading-snug",
  answers: "flex flex-col gap-2.5",
  revealBox:
    "fl-reveal-enter mt-8 space-y-5 rounded-[1.75rem] border border-base-content/8 bg-gradient-to-b from-base-100/95 to-base-200/40 p-6 shadow-inner",
  revealText: "text-center text-base leading-relaxed text-base-content/85",
  revealActions: "flex flex-col items-center justify-center gap-2 sm:flex-row",
  nextButton: "min-w-[11rem] px-8",
} as const;
