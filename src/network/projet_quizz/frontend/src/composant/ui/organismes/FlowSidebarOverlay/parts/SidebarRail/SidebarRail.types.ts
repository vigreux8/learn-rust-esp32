import type { SidebarTab } from "../../FlowSidebarOverlay.types";

export type SidebarRailProps = {
  data: { activeTab: SidebarTab };
  actions: { toggleTab: (tab: Exclude<SidebarTab, null>) => void };
};
