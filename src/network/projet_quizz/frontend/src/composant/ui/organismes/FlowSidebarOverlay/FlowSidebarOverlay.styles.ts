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
  /** Ligne question juste après déplacement de collection (sidebar). */
  questionRowPostMove: cn(
    "border-primary/70 bg-primary/15 shadow-md shadow-primary/15 ring-2 ring-primary/35 transition-[box-shadow,background-color,border-color] duration-500",
  ),
  grip: "opacity-30",
  collectionLabel: "min-w-0 flex-1 text-sm font-medium text-base-content",
  questionTitle: "text-[11px] leading-tight",
  /** Conteneur Markdown / KaTeX pour les intitulés dans la liste Questions (sidebar). */
  questionTitleMarkdown: cn(
    "[&_.prose]:prose-sm [&_.prose]:max-w-none [&_.prose]:my-0 [&_.prose]:leading-snug",
    "[&_.prose_p]:my-0.5 [&_.prose_p]:text-[11px] [&_.prose_p]:leading-tight",
    "[&_.katex-display]:my-1 [&_.katex-display]:overflow-x-auto",
  ),
  /**
   * Accordéon natif (`<details>`) : `shrink-0` évite que plusieurs blocs ouverts soient écrasés en colonne flex
   * (sinon flex-shrink: 1 compresse les titres au lieu de faire défiler le conteneur).
   */
  questionCollectionDetails: "group mb-1.5 shrink-0 overflow-hidden rounded-lg bg-base-200",
  /**
   * Même lecture que les lignes « Filtrer collections » : bord gauche colorée par `treeDepth`
   * (`borderLeftColor` inline sur le `<details>`).
   */
  questionListCollectionDepthStripe:
    "border-l-[4px] border-solid border-y border-y-base-content/[0.12] border-r border-r-base-content/[0.12]",
  questionCollectionSummary:
    "flex cursor-pointer list-none items-center gap-2 px-2 py-2 text-sm font-bold outline-none marker:content-none [&::-webkit-details-marker]:hidden focus-visible:ring-2 focus-visible:ring-primary/30",
  /**
   * Cible de dépôt (tout le bloc collection : en-tête + liste) quand une question est glissée au-dessus.
   */
  questionCollectionDropOver:
    "border border-dashed border-primary/60 bg-primary/10 ring-2 ring-primary/25",
  /**
   * Défilement des questions : plafond de hauteur pour ne pas masquer les autres collections.
   */
  questionListScrollInner:
    "flex max-h-[min(50vh,20rem)] min-h-0 flex-col gap-2 overflow-y-auto overscroll-y-contain px-1 pb-2 pt-1",
  /** Zone de liste vide : garde une hauteur minimale pour pouvoir déposer une question sur la collection. */
  questionListScrollInnerEmptyDropTarget: "min-h-[4.5rem] justify-center",
} as const;
