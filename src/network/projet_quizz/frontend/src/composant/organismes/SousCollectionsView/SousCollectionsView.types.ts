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
  createNom: string;
  createDescription: string;
  createBusy: boolean;
  onSelectSous: (id: number) => void;
  onOpenCreate: () => void;
  onCloseCreate: () => void;
  onChangeCreateNom: (v: string) => void;
  onChangeCreateDescription: (v: string) => void;
  onSubmitCreate: () => void;
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
