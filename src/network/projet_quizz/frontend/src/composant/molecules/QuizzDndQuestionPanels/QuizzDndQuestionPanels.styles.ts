/** Styles partagés entre les vues à deux zones (sous-collections, réflexion / suite logique). */
export const QUIZZ_DND_PANEL_STYLES = {
  panel: "rounded-2xl border border-base-content/10 bg-base-100/90 p-4 shadow-sm shadow-flow/5",
  panelTitle: "mb-3 text-sm font-semibold text-base-content",
  searchInput: "input input-bordered input-sm mb-3 w-full rounded-xl border-base-content/15 bg-base-100",
  dropZone: "min-h-48 rounded-xl border-2 border-dashed border-base-content/20 bg-base-200/30 p-3 transition-colors",
  dropZoneActive: "min-h-48 rounded-xl border-2 border-dashed border-learn/50 bg-learn/10 p-3 transition-colors",
  questionRow: "mb-2 flex cursor-grab items-start gap-2 rounded-xl border border-base-content/10 bg-base-100 px-3 py-2 text-sm active:cursor-grabbing",
  badge: "badge badge-sm shrink-0",
} as const;
