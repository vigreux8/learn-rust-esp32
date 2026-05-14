import type { RefObject } from "preact";

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

/** Déplacement persisté (`question_collection`) — ex. `/node`. */
export type FlowSidebarMoveQuestionArgs = {
  questionId: number;
  fromCollectionId: number;
  toCollectionId: number;
};

/** Mise en évidence temporaire dans le panneau Questions après un changement de collection. */
export type MovedQuestionHighlight = {
  questionId: number;
  collectionId: number;
  /** Incrémenté à chaque déplacement pour relancer scroll / animation. */
  token: number;
};

/** API côté page (`/node`) : fermeture au double clic sur le fond, ouverture d’onglet depuis le graphe. */
export type FlowSidebarHostApi = {
  activeTab: SidebarTab;
  closePanel: () => void;
  openTab: (tab: Exclude<SidebarTab, null>) => void;
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
    /** Dépôt d’une question sur l’en-tête d’une autre collection dans le panneau Questions. */
    onMoveQuestionToCollection?: (args: FlowSidebarMoveQuestionArgs) => Promise<void>;
  };
  presentation?: {
    /** Affiché sous le titre du panneau Questions lorsque la liste est restreinte au graphe. */
    questionsPanelHint?: string | null;
    /**
     * Sélection graphe (`/node`) : id de la collection dont le bloc accordéon est ouvert par défaut.
     * `null`/absent : tout replié jusqu’au clic. L’utilisateur peut toujours replier ou déplier d’autres blocs.
     */
    questionsDetailsExpandCollectionId?: number | null;
    /**
     * Si défini (ex. vue `/node`) : le panneau Questions ne liste que ces collections —
     * celles représentées sur le graphe (ordre = hiérarchie API parmi ces ids).
     * Tableau vide = aucune collection sur le graphe avec id API → liste vide.
     */
    questionsCanvasCollectionIds?: readonly number[];
    /**
     * Réf. du wrapper overlay (même nœud que la ref interne) pour coordonner le clic extérieur avec d’autres panneaux.
     */
    shellRef?: RefObject<HTMLDivElement | null>;
    /**
     * Clics à l’intérieur de ces éléments ne ferment pas l’onglet latéral (ex. panneau « Mode jeu » à droite sur `/node`).
     */
    clickOutsideIgnoreRefs?: ReadonlyArray<RefObject<HTMLElement | null>>;
    /**
     * Conteneur du `<ReactFlow />` (`/node`) : tant que l’onglet « Questions » est ouvert, les clics graphe
     * ne ferment pas le panneau (fermeture au 2ᵉ `onPaneClick` côté page).
     */
    reactFlowRootRef?: RefObject<HTMLElement | null>;
    /**
     * Mis à jour par la sidebar : onglet actif, fermeture, ouverture d’onglet (ex. double-clic nœud → Questions).
     */
    sidebarHostApiRef?: RefObject<FlowSidebarHostApi | null>;
    /** Surbrillance + scroll sur la ligne déplacée dans « Questions par collection ». */
    movedQuestionHighlight?: MovedQuestionHighlight | null;
  };
};
