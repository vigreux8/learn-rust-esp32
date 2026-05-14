import type { SidebarTab } from "../../FlowSidebarOverlay.types";

export type SidebarRailProps = {
  data: {
    activeTab: SidebarTab;
    graphCollectionPanelsToolbar?: {
      collectionNodeCount: number;
      anySidePanelOpen: boolean;
      onToggleAll: () => void;
    };
  };
  actions: { toggleTab: (tab: Exclude<SidebarTab, null>) => void };
};
