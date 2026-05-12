export const QUESTION_NODE_STYLES = {
  wrapper:
    "min-w-[180px] max-w-[260px] rounded-box border border-primary/30 bg-base-100 px-3 py-2 shadow-md",
  title: "text-xs font-semibold leading-snug text-primary",
  /** `nodrag` : le glisser repositionne via HTML5 sans déplacer tout le nœud XYFlow depuis la poignée. */
  dragGrip: "nodrag shrink-0 cursor-grab touch-none text-base-content/50 active:cursor-grabbing",
} as const;
