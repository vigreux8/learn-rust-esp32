import type { PersonaliteImportanceBucket } from "../../../../../../lib/collectionHierarchyVis";
import type { FlowSidebarPersonalityRow } from "../../FlowSidebarOverlay.types";

export type PersonalityFilterPanelProps = {
  data: {
    search: string;
    rows: FlowSidebarPersonalityRow[];
    isBucketActive: (bucket: PersonaliteImportanceBucket) => boolean;
  };
  actions: {
    setSearch: (value: string) => void;
    toggleBucket: (bucket: PersonaliteImportanceBucket) => void;
    onDragStart: (event: DragEvent, nodeType: string, payload: unknown) => void;
  };
};
