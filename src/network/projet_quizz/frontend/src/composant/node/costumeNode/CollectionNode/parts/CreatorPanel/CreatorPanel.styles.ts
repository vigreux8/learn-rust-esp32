import { cn } from "../../../../../../lib/cn";
import { COLLECTION_NODE_STYLES } from "../../CollectionNode.styles";

export const CREATOR_PANEL_STYLES = {
  root: COLLECTION_NODE_STYLES.creatorPanelShell,
  body: COLLECTION_NODE_STYLES.creatorPanelBody,
  legend: COLLECTION_NODE_STYLES.panelLegend,
  row: COLLECTION_NODE_STYLES.creatorRow,
  rowInner: "flex min-w-0 flex-1 items-center gap-1.5",
  roleIcon: "h-3.5 w-3.5 shrink-0",
  chevron: COLLECTION_NODE_STYLES.creatorChevron,
  footer: COLLECTION_NODE_STYLES.footerHint,
  roleMenuRoot: "relative shrink-0",
  roleMenuButton:
    "btn btn-circle btn-ghost btn-xs nodrag text-base-content/50 hover:text-base-content disabled:opacity-40",
  roleMenuList: cn(
    "nodrag nowheel fixed z-[6000] min-w-[12.5rem] rounded-xl border-2 border-base-content/20 bg-base-100 py-2 text-sm font-medium text-base-content shadow-2xl",
  ),
  roleMenuItem:
    "flex w-full px-3 py-2.5 text-left text-sm leading-snug hover:bg-base-200 disabled:opacity-40",
  roleMenuItemActive: "bg-learn/15 font-semibold text-learn",
  rowActions: "nodrag flex shrink-0 items-center gap-px",
  removeButton:
    "btn btn-ghost btn-xs min-h-0 h-5 w-5 shrink-0 rounded p-0 text-base-content/30 hover:bg-error/10 hover:text-error/70 disabled:opacity-25",
} as const;
