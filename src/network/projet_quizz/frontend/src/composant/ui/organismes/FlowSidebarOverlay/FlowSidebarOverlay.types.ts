import type { RefObject } from "preact";
import type { RefCategorieHierarchyRow } from "../../../../types/quizz";

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
  /** `null` = collection sans parent en base (orpheline / racine détachée). */
  parentCollectionId: number | null;
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
  /** `ref_p_categorie.id` — filtre aligné sur la hiérarchie session quiz. */
  categorie_id: number;
  /** `ref_e_categorie.id` ou `null`. */
  categorie_e_id: number | null;
  /** `ref_p_categorie.type` (affichage / fallback filtre). */
  categorie_type: string;
  /** `ref_e_categorie.type` ou `null`. */
  categorie_e_type: string | null;
};

/** Ligne « suite logique » (`groupe_questions`) dans le panneau Questions par collection. */
export type FlowSidebarReflexionGroupeRow = {
  groupeId: number;
  label: string;
};

/** Chargé côté page `/node` : suites et ids des questions en chaîne ordonnée (données graphe / sidebar). */
export type FlowSidebarReflexionSuitesPayload = {
  collectionId: number;
  groupes: FlowSidebarReflexionGroupeRow[];
  orderedQuestionIdsInChains: readonly number[];
};

/** Bloc accordéon « une collection » dans le panneau Questions par collection. */
export type FlowSidebarQuestionListGroup = {
  collectionId: number;
  category: string;
  treeDepth: number;
  items: FlowSidebarQuestionRow[];
  /** Nombre de questions dans la collection (hors filtre recherche sur l’intitulé). */
  totalQuestionCount: number;
  /** Suites logiques de la collection (noms uniquement). */
  reflexionGroupes: FlowSidebarReflexionGroupeRow[];
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
  /** Déplacement groupé (sidebar : Maj+clic + glisser). */
  questionIds?: readonly number[];
};

/** Déplacement d’un `groupe_questions` vers une autre collection (sidebar `/node`). */
export type FlowSidebarMoveGroupeArgs = {
  groupeId: number;
  fromCollectionId: number;
  toCollectionId: number;
  groupeIds?: readonly number[];
};

/** Mise en évidence temporaire dans le panneau Questions après un changement de collection. */
export type MovedQuestionHighlight = {
  questionId: number;
  collectionId: number;
  /** Incrémenté à chaque déplacement pour relancer scroll / animation. */
  token: number;
  /** Toutes les lignes concernées reçoivent la même animation (déplacement groupé). */
  questionIds?: readonly number[];
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
    /** Hiérarchie `ref_p_categorie` + enfants (comme session quiz) pour filtrer les sous-types. */
    refCategoriesHierarchy?: RefCategorieHierarchyRow[];
    /**
     * Suites logiques par collection (ex. `/node` après chargement API).
     * Absent : pas de cartes suites dans le panneau.
     */
    reflexionSuites?: FlowSidebarReflexionSuitesPayload[];
  };
  actions: {
    onNodeCreate?: (type: string, position: { x: number; y: number }, data: unknown) => void;
    /** Affiche ancêtres + sous-arbre de la collection sur le canvas graphe (`/node`). */
    onShowCollectionSubtreeOnGraph?: (collectionId: number) => void;
    /** Dépôt d’une question sur l’en-tête d’une autre collection dans le panneau Questions. */
    onMoveQuestionToCollection?: (args: FlowSidebarMoveQuestionArgs) => Promise<void>;
    /** Dépôt d’une suite logique sur une autre collection (même flux que les questions). */
    onMoveGroupeToCollection?: (args: FlowSidebarMoveGroupeArgs) => Promise<void>;
    /** Édition depuis la liste Questions (ex. `/node`) : ouvre la modale métier. */
    onEditQuestionInSidebar?: (questionId: number) => void;
    /** Suppression depuis la liste Questions (ex. `/node`). */
    onDeleteQuestionInSidebar?: (questionId: number) => void | Promise<void>;
    /** Suppression d’une suite logique depuis la liste (ex. `/node`). */
    onDeleteGroupeInSidebar?: (groupeId: number) => void | Promise<void>;
    /** Liste personnalités : ouvre `/questions/:ficheCollectionId?from=node` (même retour graphe que le bouton Questions du nœud collection). */
    onOpenQuestionsForPersonalityFiche?: (ficheCollectionId: number) => void;
    /** Ouvre la vue suites logiques ; `groupeId` optionnel pour pré-sélectionner une suite (`?groupeId=`). */
    onOpenReflexionEditorForCollection?: (collectionId: number, groupeId?: number) => void;
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
