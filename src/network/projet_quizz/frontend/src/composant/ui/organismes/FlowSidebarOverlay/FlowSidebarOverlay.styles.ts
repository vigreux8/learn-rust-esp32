import { cn } from "../../../../lib/cn";

export const FLOW_SIDEBAR_OVERLAY_STYLES = {
  overlayWrapper:
    "pointer-events-none absolute inset-0 z-50 flex items-start gap-4 p-4",
  rail: "pointer-events-auto flex flex-col gap-2 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl",
  railButton: "btn btn-square btn-ghost",
  railButtonActiveCollections: "btn-active text-warning",
  railButtonActiveQuestions: "btn-active text-primary",
  panel: cn(
    "pointer-events-auto flex h-[80vh] w-80 flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl transition-all duration-300",
  ),
  panelHeader:
    "flex items-center justify-between border-b border-base-300 bg-base-200/50 p-4",
  panelTitle: "text-xs font-bold uppercase tracking-wider opacity-60",
  panelBody: "flex min-h-0 flex-col gap-4 overflow-y-auto p-3",
  searchLabel: "input input-bordered input-sm flex items-center gap-2",
  searchInput: "grow",
  levelRow: "mb-2 flex flex-wrap gap-1",
  dragItem: cn(
    "flex cursor-grab items-center gap-3 rounded-xl border-2 border-transparent bg-base-200 p-3 transition-all hover:border-orange-400 hover:bg-base-300 active:cursor-grabbing",
  ),
  grip: "opacity-30",
  collectionLabel: "text-sm font-medium text-warning",
  questionTitle: "text-[11px] leading-tight",
  collapse: "collapse collapse-arrow bg-base-200",
  collapseTitle: "collapse-title text-sm font-bold text-primary",
  collapseContent: "collapse-content flex flex-col gap-2",
} as const;

export function flowSidebarLevelBadgeClass(level: number): string {
  return cn(
    "badge badge-sm font-bold",
    level === 1 && "badge-warning",
    level === 2 && "badge-outline border-warning text-warning",
    level === 3 && "badge-ghost border-warning",
  );
}

export function flowSidebarLevelFilterButtonClass(active: boolean): string {
  return cn("btn btn-xs gap-1", active ? "btn-warning" : "btn-ghost border border-base-300");
}
