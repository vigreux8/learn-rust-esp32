export const QUESTIONS_VIEW_STYLES = {
  root: "flex min-h-dvh flex-col",
  operationError: "mb-6 rounded-box border border-error/20 bg-error/5 px-4 py-3 text-sm text-base-content",
  dismissLink: "link link-primary",
  filtersRow: "mb-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end",
  filterField: "flex min-w-0 flex-1 flex-col gap-2 sm:max-w-xs",
  filterFieldNarrow: "flex min-w-0 flex-col gap-2 sm:w-44",
  filterLabel: "text-sm font-medium text-base-content/80",
  select: "select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100",
  loadingHint: "text-sm text-base-content/60",
  fetchErrorCard: "border-base-content/15",
  fetchErrorText: "mb-3 text-sm text-base-content/70",
} as const;
