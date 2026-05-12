import type { FlowSidebarQuestionRow } from "../../FlowSidebarOverlay.types";

export type QuestionListGroup = {
  category: string;
  items: FlowSidebarQuestionRow[];
};

export type QuestionListPanelProps = {
  data: {
    search: string;
    groups: QuestionListGroup[];
    /** Déplié par défaut pour ce `collectionId` ; `null` = tout replié jusqu’au clic. */
    detailsExpandCollectionId: number | null;
  };
  actions: {
    setSearch: (value: string) => void;
    onDragStart: (event: DragEvent, nodeType: string, payload: unknown) => void;
  };
};
