export type SidebarTab = "collections" | "questions" | "personalities" | null;

export type FlowSidebarCollectionRow = {
  id: string;
  /** Identifiant API de la collection (pour drop enrichi). */
  collectionId: number;
  label: string;
  /** Profondeur dans l’arbre (parents remontés), comme `computeTreeDepth` / cartes Collections. */
  treeDepth: number;
};

export type FlowSidebarPersonalityRow = {
  id: string;
  personaliteId: number;
  /** Affichage « Prénom Nom ». */
  label: string;
  importanceType: string | null;
  /** Collection sur laquelle la personnalité est liée dans cette ligne. */
  collectionId: number;
  collectionLabel: string;
  ficheCollectionId: number;
};

export type FlowSidebarQuestionRow = {
  id: string;
  title: string;
  /** Libellé de regroupement (ex. nom de collection affiché dans le panneau Questions). */
  category: string;
  /** Identifiant API de la collection parente de la question. */
  collectionId: number;
};

export type FlowSidebarOverlayProps = {
  data: {
    collections: FlowSidebarCollectionRow[];
    questions: FlowSidebarQuestionRow[];
    personalities: FlowSidebarPersonalityRow[];
  };
  actions: {
    onNodeCreate?: (type: string, position: { x: number; y: number }, data: unknown) => void;
  };
  presentation?: {
    /** Affiché sous le titre du panneau Questions lorsque la liste est restreinte au graphe. */
    questionsPanelHint?: string | null;
  };
};
