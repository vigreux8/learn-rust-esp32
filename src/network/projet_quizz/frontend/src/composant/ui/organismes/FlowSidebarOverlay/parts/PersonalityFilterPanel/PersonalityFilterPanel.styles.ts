import { cn } from "../../../../../../lib/cn";

export const PERSONALITY_FILTER_PANEL_STYLES = {
  emptyState:
    "rounded-lg border border-base-content/10 bg-base-200/40 px-3 py-6 text-center text-xs text-base-content/60",
  bucketChip: (active: boolean) =>
    cn(
      "btn btn-xs gap-1.5 border font-normal",
      active ? "border-base-content/25 bg-base-100 shadow-sm" : "btn-ghost border-base-300",
    ),
  bucketDot: "h-2.5 w-2.5 shrink-0 rounded-full border border-base-content/15",
  rowLeftAccent: "border-l-4 border-solid border-y-2 border-r-2 border-y-transparent border-r-transparent pl-2",
} as const;
