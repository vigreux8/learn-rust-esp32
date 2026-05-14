import { cn } from "../../../../../../lib/cn";
import { COLLECTION_NODE_STYLES } from "../../CollectionNode.styles";

export const CREATOR_PANEL_STYLES = {
  root: COLLECTION_NODE_STYLES.creatorPanelShell,
  body: COLLECTION_NODE_STYLES.creatorPanelBody,
  legend: COLLECTION_NODE_STYLES.panelLegend,
  row: COLLECTION_NODE_STYLES.creatorRow,
  rowInner: "nopan nodrag flex min-w-0 flex-1 items-center gap-1.5",
  roleIcon: "h-3.5 w-3.5 shrink-0",
  chevron: cn(COLLECTION_NODE_STYLES.creatorChevron, "shrink-0 opacity-70"),
  footer: COLLECTION_NODE_STYLES.footerHint,
  /** Libellé de rôle + chevron : zone unique cliquable (évite de viser seulement l’icône). */
  rolePickTrigger: cn(
    "nopan nodrag flex max-w-[11rem] shrink-0 items-center gap-0.5 rounded-md border border-transparent px-1.5 py-0.5",
    "text-left text-xs font-medium hover:border-base-content/12 hover:bg-base-200/70",
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-transparent disabled:hover:bg-transparent",
  ),
  rolePickLabel: "min-w-0 truncate",
  roleMenuList: cn(
    "nopan nodrag nowheel fixed z-[6000] min-w-[12.5rem] rounded-xl border-2 border-base-content/20 bg-base-100 py-2 text-sm font-medium text-base-content shadow-2xl",
  ),
  roleMenuItem:
    "nopan nodrag flex w-full items-center px-3 py-2.5 text-left text-sm leading-snug hover:bg-base-200 disabled:opacity-40",
  roleMenuItemActive: "bg-learn/15 font-semibold text-learn",
  rowActions: "nopan nodrag flex shrink-0 items-center gap-px",
  removeButton:
    "nopan btn btn-ghost btn-xs min-h-0 h-5 w-5 shrink-0 rounded p-0 text-base-content/30 hover:bg-error/10 hover:text-error/70 disabled:opacity-25",
} as const;
