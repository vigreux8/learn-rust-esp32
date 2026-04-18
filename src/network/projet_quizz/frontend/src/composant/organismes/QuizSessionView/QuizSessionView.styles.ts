export const QUIZ_SESSION_STYLES = {
  pageShell: "flex min-h-dvh flex-col",
  centeredMain:
    "fl-page-enter mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center",
  contentMain: "fl-page-enter mx-auto w-full max-w-2xl flex-1 px-4 py-6 md:py-8",
  topRow: "mb-6 flex items-center gap-2",
  badgesRow: "flex flex-wrap items-center gap-2",
  orderBadgeWrap: "max-w-[min(100%,18rem)] truncate",
  actionMessage:
    "mb-3 rounded-xl border border-flow/20 bg-flow/5 px-3 py-2 text-center text-sm text-base-content",
  bodyLayout: "flex flex-col gap-4 md:flex-row md:items-stretch",
  aside: "flex shrink-0 flex-row flex-wrap gap-2 md:w-36 md:flex-col md:items-stretch",
  actionButton: "btn-sm flex-1 gap-1 sm:flex-none",
  actionButtonText: "hidden sm:inline",
  verifierToggleBase:
    "btn btn-sm mt-1 flex h-auto min-h-0 w-full cursor-pointer flex-nowrap items-center justify-start gap-2 rounded-full border-2 py-2.5 pl-3 pr-4 text-left text-sm font-medium shadow-md transition-all duration-300 ease-out hover:shadow-lg active:scale-[0.97] md:mt-0",
  verifierToggleOn: "border-flow/40 bg-transparent text-flow hover:border-flow hover:bg-flow/5",
  verifierToggleOff: "border-error/50 bg-error/10 text-error hover:border-error hover:bg-error/15",
  card: "min-w-0 flex-1 transition duration-300",
  questionMeta: "mb-4 text-xs font-medium uppercase tracking-wide text-base-content/45",
  questionTitle: "mb-6 text-lg font-semibold leading-snug text-base-content sm:text-xl",
  answers: "flex flex-col gap-2.5",
  revealBox:
    "fl-reveal-enter mt-8 space-y-5 rounded-[1.75rem] border border-base-content/8 bg-gradient-to-b from-base-100/95 to-base-200/40 p-6 shadow-inner",
  revealText: "text-center text-base leading-relaxed text-base-content/85",
  revealActions: "flex flex-col items-center justify-center gap-2 sm:flex-row",
  nextButton: "min-w-[11rem] px-8",
} as const;
