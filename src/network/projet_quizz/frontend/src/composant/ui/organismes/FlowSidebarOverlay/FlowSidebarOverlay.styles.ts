import { cn } from "../../../../lib/cn";

export const FLOW_SIDEBAR_OVERLAY_STYLES = {
  overlayWrapper:
    "pointer-events-none absolute inset-0 z-50 flex items-start gap-4 p-4",
  rail: "pointer-events-auto flex flex-col gap-2 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl",
  railButton: "btn btn-square btn-ghost",
  railButtonActiveCollections: "btn-active text-warning",
  railButtonActiveQuestions: "btn-active text-primary",
  railButtonActivePersonalities: "btn-active text-success",
  railButtonActiveCreate: "btn-active text-accent",
  railButtonActiveCollectionSubtree: "btn-active text-secondary",
  panel: cn(
    "pointer-events-auto flex h-[80vh] w-80 flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl transition-all duration-300",
  ),
  panelHeader:
    "flex shrink-0 items-center justify-between border-b border-base-300 bg-base-200/50 p-4",
  panelTitle: "text-xs font-bold uppercase tracking-wider opacity-60",
  /** Corps du panneau : hauteur contrainte ; le défilement est géré par chaque sous-panneau. */
  panelBody: "flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-3",
  searchLabel: "input input-bordered input-sm flex items-center gap-2",
  searchInput: "grow",
  levelRow: "mb-2 flex flex-wrap gap-1",
  dragItem: cn(
    "flex cursor-grab items-center gap-3 rounded-xl border-2 border-transparent bg-base-200 p-3 transition-all hover:border-flow/35 hover:bg-flow/8 active:cursor-grabbing",
  ),
  grip: "opacity-30",
  collectionLabel: "min-w-0 flex-1 text-sm font-medium text-base-content",
  questionTitle: "text-[11px] leading-tight",
  /**
   * Accordéon natif (`<details>`) : évite le `collapse` Daisy + checkbox, fragile avec overflow / grilles internes.
   */
  questionCollectionDetails: "group mb-1.5 overflow-hidden rounded-lg bg-base-200",
  questionCollectionSummary:
    "flex cursor-pointer list-none items-center gap-2 px-2 py-2 text-sm font-bold outline-none marker:content-none [&::-webkit-details-marker]:hidden focus-visible:ring-2 focus-visible:ring-primary/30",
  /**
   * Défilement des questions : plafond de hauteur pour ne pas masquer les autres collections.
   */
  questionListScrollInner:
    "flex max-h-[min(50vh,20rem)] min-h-0 flex-col gap-2 overflow-y-auto overscroll-y-contain px-1 pb-2 pt-1",
} as const;
