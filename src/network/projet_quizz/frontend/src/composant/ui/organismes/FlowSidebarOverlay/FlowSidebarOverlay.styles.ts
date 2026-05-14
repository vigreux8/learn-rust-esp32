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
  railButtonActiveSettings: "btn-active text-info",
  panel: cn(
    "pointer-events-auto flex h-[80vh] min-h-0 min-w-0 w-80 flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl transition-all duration-300",
  ),
  panelHeader:
    "flex shrink-0 items-center justify-between border-b border-base-300 bg-base-200/50 p-4",
  panelTitle: "text-xs font-bold uppercase tracking-wider opacity-60",
  /** Corps du panneau : hauteur contrainte ; le défilement est géré par chaque sous-panneau. */
  panelBody: "flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden p-3",
  searchLabel: "input input-bordered input-sm flex items-center gap-2",
  searchInput: "grow",
  /** Filtre type / sous-type (liste Questions par collection), aligné session quiz. */
  questionCategoryFilterBlock: "flex shrink-0 flex-col gap-1.5",
  questionCategoryFilterSectionTitle:
    "text-[10px] font-semibold uppercase tracking-wide text-base-content/50",
  questionCategoryFilterChipRow: "flex flex-wrap items-center gap-1",
  questionCategoryFilterChip:
    "btn btn-ghost btn-xs h-6 min-h-6 shrink-0 border border-base-content/12 px-1.5 py-0 text-[10px] font-semibold normal-case tracking-tight text-base-content/80 hover:border-base-content/25 hover:bg-base-content/6",
  questionCategoryFilterChipActive: "border-primary/70 bg-primary/12 text-primary hover:bg-primary/18",
  reflexionSuiteSectionTitle:
    "px-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-base-content/50",
  reflexionSuiteCard:
    "nodrag mb-1.5 flex items-center justify-between gap-2 rounded-lg border border-base-content/12 bg-base-100/90 px-2 py-1.5",
  reflexionSuiteCardLabel: "min-w-0 flex-1 truncate text-[11px] font-medium text-base-content/90",
  reflexionSuiteEditBtn:
    "btn btn-ghost btn-xs h-6 shrink-0 border-0 px-1.5 text-[10px] font-semibold normal-case text-primary hover:bg-primary/10",
  levelRow: "mb-2 flex flex-wrap gap-1",
  dragItem: cn(
    "flex cursor-grab items-start gap-2 rounded-xl border-2 border-transparent bg-base-200 p-3 transition-all hover:border-flow/35 hover:bg-flow/8 active:cursor-grabbing",
  ),
  /** Ligne question juste après déplacement de collection (sidebar). */
  questionRowPostMove: cn(
    "border-primary/70 bg-primary/15 shadow-md shadow-primary/15 ring-2 ring-primary/35 transition-[box-shadow,background-color,border-color] duration-500",
  ),
  /** Ligne sélectionnée (Maj+clic plage) avant déplacement. */
  questionRowSelected: cn(
    "border-flow/50 bg-flow/12 ring-1 ring-flow/30 hover:border-flow/55 hover:bg-flow/15",
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
  /** Ligne question : zone titre + actions (ne pas capturer le drag du grip). */
  questionRowMain: "nodrag flex min-w-0 flex-1 items-start gap-1.5",
  questionRowActions: "flex shrink-0 flex-row items-center gap-0.5 self-start pt-0.5",
  questionRowActionBtn:
    "btn btn-square btn-ghost btn-xs h-6 w-6 min-h-0 border-0 bg-transparent p-0 text-base-content/35 hover:bg-base-content/8 hover:text-base-content/80",
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
   * Colonne liste (scroll masqué) : le défilement visible se fait via `questionListScrollGutter` à droite.
   */
  questionListMainColumn: cn(
    "nodrag flex min-h-0 min-w-0 flex-1 flex-col gap-2 touch-pan-y overflow-y-auto overscroll-y-contain",
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  ),
  /**
   * Rail droit synchronisé avec la colonne liste : la molette / la barre ici ne chevauche pas le drag des questions.
   */
  questionListScrollGutter: cn(
    "nodrag w-3 shrink-0 overflow-y-auto overscroll-y-contain border-l border-base-content/15 bg-base-200/50 py-1",
    "[scrollbar-width:thin]",
  ),
  /**
   * Défilement des questions dans une collection : hauteur plafonnée pour pouvoir glisser-déposer tout en scrollant
   * dans le bloc (molette séparée du rail droit « entre collections »).
   */
  questionListScrollInner:
    "flex max-h-[min(50vh,20rem)] min-h-0 flex-col gap-2 overflow-y-auto overscroll-y-contain px-1 pb-2 pt-1 [overscroll-behavior-y:contain]",
  /** Zone de liste vide : garde une hauteur minimale pour pouvoir déposer une question sur la collection. */
  questionListScrollInnerEmptyDropTarget: "min-h-[4.5rem] justify-center",
} as const;
