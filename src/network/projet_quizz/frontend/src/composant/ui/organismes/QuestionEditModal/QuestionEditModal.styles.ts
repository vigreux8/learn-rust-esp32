export const QUESTION_EDIT_MODAL_STYLES = {
  overlay: "fixed inset-0 z-100 flex items-center justify-center p-4",
  backdrop: "absolute inset-0 border-0 bg-base-content/40 p-0",
  dialog: "relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-base-content/10 bg-base-100 p-6 shadow-2xl",
  implicitSection:
    "mt-6 space-y-2 rounded-xl border border-base-content/10 bg-base-200/35 p-3",
  implicitTitle: "text-xs font-semibold uppercase tracking-wide text-base-content/55",
  implicitList: "space-y-1.5",
  implicitRow: "flex items-start gap-2 rounded-lg bg-base-100/80 px-2 py-1.5 text-sm",
  implicitPreview: "min-w-0 flex-1 text-base-content/85",
  implicitRemove: "btn btn-ghost btn-xs shrink-0 min-h-7 h-7 w-7 px-0 text-base-content/50 hover:text-error",
  createLinkCheckbox: "mb-4 flex cursor-pointer items-start gap-2 rounded-xl border border-base-content/15 bg-base-200/25 p-3 text-sm leading-snug",
  categorieSectionWrap: "mb-4 rounded-xl border border-base-content/10 bg-base-200/30 p-3",
  categorieResume: "mb-2 text-xs text-base-content/60",
  categorieBlockInner: "space-y-3",
  categorieAsideTitle: "mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-base-content/50",
  categorieButtonRow: "flex flex-wrap gap-1.5",
  categorieBlockSubDivider: "border-t border-base-content/10 pt-3",
  categorieChip:
    "btn btn-xs h-auto min-h-8 shrink-0 rounded-lg border px-2.5 py-1.5 font-normal normal-case",
  categorieChipActive: "border-flow/50 bg-flow/15 text-flow",
  categorieChipInactive: "border-base-content/20 bg-base-100 text-base-content/80",
} as const;
