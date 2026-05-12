import { COLLECTION_NODE_STYLES } from "../../CollectionNode.styles";

export const CREATOR_PANEL_STYLES = {
  root: COLLECTION_NODE_STYLES.panel,
  legend: COLLECTION_NODE_STYLES.panelLegend,
  row: COLLECTION_NODE_STYLES.creatorRow,
  rowInner: "flex min-w-0 flex-1 items-center gap-1.5",
  roleIcon: "h-3.5 w-3.5 shrink-0",
  chevron: COLLECTION_NODE_STYLES.creatorChevron,
  footer: COLLECTION_NODE_STYLES.footerHint,
} as const;
