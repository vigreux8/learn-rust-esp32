import type { FlowSidebarMoveQuestionArgs, FlowSidebarQuestionRow } from "../../FlowSidebarOverlay.types";

export type QuestionListGroup = {
  collectionId: number;
  category: string;
  treeDepth: number;
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
    onMoveQuestionToCollection?: (args: FlowSidebarMoveQuestionArgs) => Promise<void>;
  };
};
