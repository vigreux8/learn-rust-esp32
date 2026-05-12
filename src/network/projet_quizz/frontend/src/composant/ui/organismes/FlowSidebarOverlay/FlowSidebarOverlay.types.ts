export type SidebarTab =
  | "collections"
  | "collectionSubtree"
  | "questions"
  | "personalities"
  | "create"
  | null;

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
  /** Profondeur d’arbre de la collection (`computeTreeDepth`) ; couleur comme les filtres collections. */
  treeDepth?: number;
};

/** Hiérarchie plate pour filtre personnalités (parent → enfants). */
export type FlowSidebarCollectionHierarchyRef = {
  id: number;
  parent_collection_id: number | null;
};

export type FlowSidebarOverlayProps = {
  data: {
    collections: FlowSidebarCollectionRow[];
    questions: FlowSidebarQuestionRow[];
    personalities: FlowSidebarPersonalityRow[];
    collectionHierarchy: FlowSidebarCollectionHierarchyRef[];
  };
  actions: {
    onNodeCreate?: (type: string, position: { x: number; y: number }, data: unknown) => void;
    /** Affiche ancêtres + sous-arbre de la collection sur le canvas graphe (`/node`). */
    onShowCollectionSubtreeOnGraph?: (collectionId: number) => void;
  };
  presentation?: {
    /** Affiché sous le titre du panneau Questions lorsque la liste est restreinte au graphe. */
    questionsPanelHint?: string | null;
    /**
     * Sélection graphe (`/node`) : id de la collection dont le bloc accordéon est ouvert par défaut.
     * `null`/absent : tout replié jusqu’au clic. L’utilisateur peut toujours replier ou déplier d’autres blocs.
     */
    questionsDetailsExpandCollectionId?: number | null;
  };
};
