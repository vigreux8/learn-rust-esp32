import type { FlowSidebarPersonalityRow } from "../../FlowSidebarOverlay.types";

export type PersonalityCollectionOption = {
  id: number;
  label: string;
};

export type PersonalityFilterPanelProps = {
  data: {
    search: string;
    rows: FlowSidebarPersonalityRow[];
    /** Collections pour le filtre branche (parent + enfants). */
    collectionOptions: PersonalityCollectionOption[];
    /** `null` = toutes les personnalités. */
    branchRootCollectionId: number | null;
  };
  actions: {
    setSearch: (value: string) => void;
    setBranchRootCollectionId: (value: number | null) => void;
    onDragStart: (event: DragEvent, nodeType: string, payload: unknown) => void;
  };
};
