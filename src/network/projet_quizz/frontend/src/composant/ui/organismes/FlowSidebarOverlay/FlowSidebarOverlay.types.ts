export type SidebarTab = "collections" | "questions" | null;

export type FlowSidebarCollectionRow = {
  id: string;
  label: string;
  level: number;
};

export type FlowSidebarQuestionRow = {
  id: string;
  title: string;
  /** Libellé de regroupement (ex. nom de collection affiché dans le panneau Questions). */
  category: string;
};

export type FlowSidebarOverlayProps = {
  data: {
    collections: FlowSidebarCollectionRow[];
    questions: FlowSidebarQuestionRow[];
  };
  actions: {
    onNodeCreate?: (type: string, position: { x: number; y: number }, data: unknown) => void;
  };
};
