import { cn } from "../../../../lib/cn";

/** Même ADN visuel que `Card` + `CollectionCard` : radius-box, ombre flow, bords discrets. */
const cardLike = cn(
  "rounded-[var(--radius-box)] border border-base-content/10 bg-base-100/95 shadow-lg shadow-flow/5 backdrop-blur-sm",
  "transition-all duration-300 ease-out",
);

export const COLLECTION_NODE_STYLES = {
  wrapper: "relative min-w-[280px] max-w-md overflow-visible font-sans sm:min-w-[320px]",
  coreColumn: "relative flex w-full flex-col",
  panelsFloating: cn(
    "absolute bottom-full left-0 right-0 z-10 mb-2 flex h-40 gap-3 sm:gap-4",
    "transition-opacity duration-200",
  ),
  /** Bandeau connexion entrée — discret, teinte flow comme le reste de l’app. */
  topStrip: "relative h-0.5 w-full shrink-0 rounded-full bg-flow/25",
  mainBar: cn("relative flex w-full items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3", cardLike),
  panel: cn(
    "flex flex-1 flex-col gap-2 overflow-y-auto rounded-[var(--radius-box)] border border-dashed border-base-content/12 bg-base-100/90 p-2.5 shadow-sm backdrop-blur-sm",
    "nowheel",
  ),
  panelLegend: "text-[11px] font-medium uppercase tracking-wide text-base-content/45",
  title: "min-w-0 flex-1 truncate text-center text-base font-semibold tracking-tight text-base-content",
  badge: cn(
    "inline-flex items-center rounded-full border border-flow/25 bg-flow/10 px-2.5 py-0.5 text-xs font-medium text-flow",
  ),
  creatorRow: "flex items-center justify-between border-b border-base-content/5 py-0.5 text-sm text-base-content",
  creatorChevron: "h-3 w-3 shrink-0 text-base-content/40",
  footerHint: "mt-auto text-center text-[10px] text-base-content/45",
  buttonIconCollections: cn(
    "btn btn-circle btn-ghost btn-xs shrink-0 nodrag text-flow",
    "transition duration-300 hover:bg-flow/12 active:scale-[0.97]",
  ),
  buttonIconCreators: cn(
    "btn btn-circle btn-ghost btn-xs shrink-0 nodrag text-learn",
    "transition duration-300 hover:bg-learn/12 active:scale-[0.97]",
  ),
  playButton: cn(
    "btn btn-circle btn-sm shrink-0 nodrag rounded-full border-0 bg-flow text-white shadow-md shadow-flow/20",
    "transition duration-300 ease-out hover:brightness-110 active:scale-[0.97]",
  ),
  bottomStrip: "relative mt-1.5 h-0.5 w-full shrink-0 rounded-full bg-learn/25",
  handleOnBar: cn(
    "!absolute !inset-0 !m-0 !h-full !w-full !max-w-none !min-h-0 !min-w-0",
    "!translate-x-0 !translate-y-0 !transform-none !rounded-none !border-0 !bg-transparent",
    "!opacity-0 hover:!bg-flow/15 hover:!opacity-100",
  ),
  handleOnBarHalf: cn(
    "!absolute !top-0 !m-0 !h-full !w-1/2 !max-w-none !min-h-0",
    "!translate-x-0 !translate-y-0 !transform-none !rounded-none !border-0 !bg-transparent",
    "!opacity-0 hover:!bg-flow/15 hover:!opacity-100",
  ),
} as const;
