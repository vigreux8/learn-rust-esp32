import type {
  FlowSidebarMoveQuestionArgs,
  FlowSidebarQuestionListGroup,
  MovedQuestionHighlight,
} from "../../FlowSidebarOverlay.types";

export type QuestionListGroup = FlowSidebarQuestionListGroup;

export type QuestionListPanelProps = {
  data: {
    search: string;
    groups: QuestionListGroup[];
    /** Déplié par défaut pour ce `collectionId` ; `null` = tout replié jusqu’au clic. */
    detailsExpandCollectionId: number | null;
    /** Après déplacement : surbrillance + scroll sur la ligne dans la collection cible. */
    movedQuestionHighlight?: MovedQuestionHighlight | null;
  };
  actions: {
    setSearch: (value: string) => void;
    onDragStart: (event: DragEvent, nodeType: string, payload: unknown) => void;
    onMoveQuestionToCollection?: (args: FlowSidebarMoveQuestionArgs) => Promise<void>;
    onEditQuestionInSidebar?: (questionId: number) => void;
    onDeleteQuestionInSidebar?: (questionId: number) => void | Promise<void>;
  };
};
