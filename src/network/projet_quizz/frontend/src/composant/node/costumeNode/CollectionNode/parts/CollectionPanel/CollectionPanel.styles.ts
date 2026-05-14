import { COLLECTION_NODE_STYLES } from "../../CollectionNode.styles";

export const COLLECTION_PANEL_STYLES = {
  root: COLLECTION_NODE_STYLES.panel,
  legend: COLLECTION_NODE_STYLES.panelLegend,
  tagRow: "flex max-w-full items-center justify-between gap-0.5 rounded-full border border-flow/25 bg-flow/10 pl-2 pr-0.5 text-xs font-medium text-flow",
  tagLabel: "min-w-0 flex-1 truncate py-0.5",
  tagRemove:
    "nodrag btn btn-ghost btn-xs min-h-0 h-5 w-5 shrink-0 rounded p-0 text-base-content/30 hover:bg-error/10 hover:text-error/70 disabled:opacity-25",
  footer: COLLECTION_NODE_STYLES.footerHint,
} as const;
