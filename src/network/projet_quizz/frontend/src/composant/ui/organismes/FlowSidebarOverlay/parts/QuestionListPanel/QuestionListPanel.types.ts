import type { FlowSidebarQuestionRow } from "../../FlowSidebarOverlay.types";

export type QuestionListGroup = {
  category: string;
  items: FlowSidebarQuestionRow[];
};

export type QuestionListPanelProps = {
  data: { search: string; groups: QuestionListGroup[] };
  actions: {
    setSearch: (value: string) => void;
    onDragStart: (event: DragEvent, nodeType: string, payload: unknown) => void;
  };
};
