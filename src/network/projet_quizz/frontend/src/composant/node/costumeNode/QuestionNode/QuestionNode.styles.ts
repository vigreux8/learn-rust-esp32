import { cn } from "../../../../lib/cn";

export const QUESTION_NODE_STYLES = {
  wrapper:
    "min-w-[180px] max-w-[260px] rounded-box border border-primary/30 bg-base-100 px-3 py-2 shadow-md transition-transform duration-300",
  wrapperMoveFlash:
    "z-10 scale-[1.03] border-primary/70 shadow-lg shadow-primary/30 ring-4 ring-primary/40",
  title: "text-xs font-semibold leading-snug text-primary",
  /** Conteneur Markdown / KaTeX pour l'intitulé sur le nœud graphe. */
  titleMarkdown: cn(
    "nodrag min-w-0 flex-1",
    "[&_.prose]:prose-sm [&_.prose]:max-w-none [&_.prose]:my-0",
    "[&_.prose_p]:my-0.5 [&_.prose_p]:text-xs [&_.prose_p]:font-semibold [&_.prose_p]:leading-snug [&_.prose_p]:text-primary",
    "[&_.katex-display]:my-1 [&_.katex-display]:overflow-x-auto",
  ),
  /** `nodrag` : le glisser repositionne via HTML5 sans déplacer tout le nœud XYFlow depuis la poignée. */
  dragGrip: "nodrag shrink-0 cursor-grab touch-none text-base-content/50 active:cursor-grabbing",
} as const;
