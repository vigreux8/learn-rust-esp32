import type { FlowSidebarCollectionRow } from "../../FlowSidebarOverlay.types";

export type CollectionFilterPanelProps = {
  data: {
    search: string;
    rows: FlowSidebarCollectionRow[];
    isLevelActive: (level: number) => boolean;
  };
  actions: {
    setSearch: (value: string) => void;
    toggleLevel: (level: number) => void;
    onDragStart: (event: DragEvent, nodeType: string, payload: unknown) => void;
  };
};
