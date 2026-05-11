import { COLLECTION_NODE_STYLES } from "../../CollectionNode.styles";

export const CREATOR_PANEL_STYLES = {
  root: COLLECTION_NODE_STYLES.panel,
  legend: COLLECTION_NODE_STYLES.panelLegend,
  row: COLLECTION_NODE_STYLES.creatorRow,
  chevron: COLLECTION_NODE_STYLES.creatorChevron,
  footer: COLLECTION_NODE_STYLES.footerHint,
} as const;
