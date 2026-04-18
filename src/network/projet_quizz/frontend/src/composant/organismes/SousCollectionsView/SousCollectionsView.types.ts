import type { SousCollectionLlmImportWidgetProps } from "../../molecules/SousCollectionLlmImportWidget";
import type { QuizzQuestionRow, SousCollectionUi } from "../../../types/quizz";

/** Props injectées par preact-router. */
export type SousCollectionsViewProps = {
  collectionId?: string;
};

export type SousCollectionsDndPayload = {
  from: "pool" | "assigned";
  questionId: number;
};

export type SousCollectionsListeSectionProps = {
  collectionNom: string | null;
  canEdit: boolean;
  sousCollections: SousCollectionUi[];
  selectedSousId: number | null;
  createModalOpen: boolean;
  /** Formulaire modal : création ou édition de la sous-collection sélectionnée. */
  sousFormMode: "create" | "edit";
  createNom: string;
  createDescription: string;
  createBusy: boolean;
  deleteBusy: boolean;
  canDeleteSelected: boolean;
  canEditSelected: boolean;
  onSelectSous: (id: number) => void;
  onOpenCreate: () => void;
  onOpenEdit: () => void;
  onCloseCreate: () => void;
  onChangeCreateNom: (v: string) => void;
  onChangeCreateDescription: (v: string) => void;
  onSubmitCreate: () => void;
  onDeleteSelected: () => void;
  /** Import LLM (sous-collection sélectionnée, propriétaire uniquement). */
  llmImport?: SousCollectionLlmImportWidgetProps;
};

export type SousCollectionsQuestionsPanelProps = {
  search: string;
  onSearchChange: (v: string) => void;
  poolQuestions: QuizzQuestionRow[];
  poolDroppableRef: (el: Element | null) => void;
  isPoolDropTarget: boolean;
  poolDraggableDisabled: boolean;
};

export type SousCollectionsAssignedPanelProps = {
  selectedSous: SousCollectionUi | null;
  assignedQuestions: SousCollectionUi["questions"];
  sousDroppableRef: (el: Element | null) => void;
  isSousDropTarget: boolean;
  assignedDraggableDisabled: boolean;
};
