import type { FlowSidebarPersonalityRow } from "../../FlowSidebarOverlay.types";

export type PersonalityFilterPanelProps = {
  data: {
    search: string;
    collectionSearch: string;
    rows: FlowSidebarPersonalityRow[];
    /** Libellés distincts pour autocomplétion (données brutes). */
    personalityLabelSuggestions: readonly string[];
    collectionLabelSuggestions: readonly string[];
  };
  actions: {
    setSearch: (value: string) => void;
    setCollectionSearch: (value: string) => void;
    onDragStart: (event: DragEvent, nodeType: string, payload: unknown) => void;
    onOpenQuestionsForPersonalityFiche?: (ficheCollectionId: number) => void;
  };
};
