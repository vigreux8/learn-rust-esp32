import type { FlowSidebarCollectionRow } from "../../FlowSidebarOverlay.types";

export type CollectionFilterPanelProps = {
  data: {
    search: string;
    rows: FlowSidebarCollectionRow[];
    isPaletteBucketActive: (bucket: number) => boolean;
  };
  actions: {
    setSearch: (value: string) => void;
    togglePaletteBucket: (bucket: number) => void;
    onDragStart: (event: DragEvent, nodeType: string, payload: unknown) => void;
  };
};
