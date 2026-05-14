import { cn } from "../../../../lib/cn";

/** Design modernisé avec glassmorphism, fond légèrement translucide et ombres douces. */
const cardLike = cn(
  "rounded-2xl border border-base-content/10 bg-base-100/90 shadow-lg shadow-base-content/5 backdrop-blur-md",
  "transition-all duration-300 ease-out",
);

export const COLLECTION_NODE_STYLES = {
  wrapper: "group relative min-w-[280px] max-w-md overflow-visible font-sans sm:min-w-[320px]",
  coreColumn: "relative flex w-full flex-col",

  panelsFloating: cn(
    "nopan nodrag absolute bottom-[calc(100%+0.5rem)] left-0 right-0 z-[110] flex h-40 gap-3 sm:gap-4",
    "animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 ease-out origin-bottom",
  ),
  
  /** Card globale pour regrouper entête et actions */
  nodeCard: cn(
    "relative flex w-full flex-col overflow-hidden",
    cardLike,
    "group-hover:shadow-xl group-hover:shadow-base-content/10 group-hover:-translate-y-0.5 ring-1 ring-transparent group-hover:ring-base-content/5",
  ),

  /** Carte en tons grisés quand la collection n’a pas de parent en base (lien parent supprimé ou racine seule). */
  nodeCardOrphan: "border-base-content/20 bg-base-200/45 shadow-inner",
  titleOrphan: "text-base-content/60",

  /** Bandeau connexion entrée — un liseré décoratif en haut */
  topStrip: "absolute top-0 left-0 right-0 h-1.5 w-full bg-flow/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl z-10",

  mainBar: "relative flex w-full items-center gap-3 px-4 py-3.5",
  playIncludeToggle: "nopan nodrag flex shrink-0 cursor-pointer items-center leading-none hover:scale-110 transition-transform duration-200",
  
  actionsRow: cn(
    "nopan nodrag nowheel flex w-full flex-wrap items-center justify-end gap-1.5 px-3 py-2.5",
    "bg-base-content/[0.02] border-t border-base-content/5",
  ),

  panel: cn(
    "nopan nodrag flex flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border border-base-content/10 bg-base-100/90 p-3 shadow-md backdrop-blur-md",
    "nowheel",
  ),
  
  creatorPanelShell: cn(
    "nopan nodrag nowheel flex min-h-0 flex-1 flex-col gap-2 overflow-visible rounded-2xl border border-base-content/10 bg-base-100/90 p-3 shadow-md backdrop-blur-md",
  ),
  creatorPanelBody: "nopan nodrag nowheel flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto",
  
  panelLegend: "text-[11px] font-bold uppercase tracking-wider text-base-content/50",
  title: "min-w-0 flex-1 truncate text-base font-bold tracking-tight text-base-content",
  
  badge: cn(
    "inline-flex items-center rounded-full border border-flow/20 bg-flow/10 px-2.5 py-0.5 text-xs font-semibold text-flow",
  ),
  
  creatorRow:
    "nopan nodrag flex items-center justify-between gap-1 border-b border-base-content/5 border-l-4 py-1 pl-2 pr-1 text-sm text-base-content hover:bg-base-content/5 transition-colors rounded-r-md",
  creatorChevron: "h-3.5 w-3.5 shrink-0 text-base-content/40",
  footerHint: "mt-auto text-center text-[10px] text-base-content/40",
  
  buttonIconCollections: cn(
    "btn btn-circle btn-ghost btn-sm shrink-0 nopan nodrag text-flow",
    "transition-all duration-300 hover:bg-flow/15 hover:scale-105 active:scale-95",
  ),
  buttonIconCreators: cn(
    "btn btn-circle btn-ghost btn-sm shrink-0 nopan nodrag text-learn",
    "transition-all duration-300 hover:bg-learn/15 hover:scale-105 active:scale-95",
  ),
  playButton: cn(
    "btn btn-circle btn-sm shrink-0 nopan nodrag rounded-full border-0 bg-flow text-white shadow-md shadow-flow/30",
    "transition-all duration-300 ease-out hover:brightness-110 hover:scale-110 active:scale-95 hover:shadow-flow/50 hover:shadow-lg",
  ),
  
  /** Bandeau décoratif en bas */
  bottomStrip: "absolute bottom-0 left-0 right-0 h-1.5 w-full bg-learn/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl z-10",
  
  /** Poignées React Flow par-dessus le reste, cliquables */
  handleOnBar: cn(
    "!absolute !bottom-0 !m-0 !h-2.5 !w-full !max-w-none !min-h-0 !min-w-0",
    "!translate-x-0 !translate-y-0 !transform-none !rounded-none !border-0 !bg-transparent",
    "!opacity-0 hover:!bg-learn/20 hover:!opacity-100 transition-colors z-20 cursor-crosshair",
  ),
  handleOnBarHalf: cn(
    "!absolute !top-0 !m-0 !h-2.5 !w-1/2 !max-w-none !min-h-0",
    "!translate-x-0 !translate-y-0 !transform-none !rounded-none !border-0 !bg-transparent",
    "!opacity-0 hover:!bg-flow/20 hover:!opacity-100 transition-colors z-20 cursor-crosshair",
  ),
} as const;

/**
 * Cotes graphe : alignées sur les classes du nœud.
 */
export const COLLECTION_NODE_LAYOUT_MAX_WIDTH_PX = 448; /** ≈ Tailwind `max-w-md` (28rem). */
export const COLLECTION_NODE_LAYOUT_EXPANDED_PANELS_HEIGHT_PX = 160; /** `h-40` région `#` + influenceurs. */
export const COLLECTION_NODE_LAYOUT_FLOATING_GAP_PX = 12; /** `mb-3` sous les panneaux flottants (ou top calc). */
/** Bandeau haut + `mainBar` + rangée actions + bandeau bas (voir `actionsRow`). */
export const COLLECTION_NODE_LAYOUT_MAIN_CHROME_HEIGHT_PX = 120;
export const COLLECTION_NODE_LAYOUT_GRAPH_CLEARANCE_PX = 40; /** air entre deux boîtes (ombre / confort). */

export function collectionNodeLayoutExpandedTotalHeightPx(): number {
  return (
    COLLECTION_NODE_LAYOUT_EXPANDED_PANELS_HEIGHT_PX +
    COLLECTION_NODE_LAYOUT_FLOATING_GAP_PX +
    COLLECTION_NODE_LAYOUT_MAIN_CHROME_HEIGHT_PX
  );
}

export function collectionNodeGraphHorizontalStepPx(): number {
  return COLLECTION_NODE_LAYOUT_MAX_WIDTH_PX + COLLECTION_NODE_LAYOUT_GRAPH_CLEARANCE_PX;
}

export function collectionNodeGraphVerticalStepPx(): number {
  return collectionNodeLayoutExpandedTotalHeightPx() + COLLECTION_NODE_LAYOUT_GRAPH_CLEARANCE_PX;
}
