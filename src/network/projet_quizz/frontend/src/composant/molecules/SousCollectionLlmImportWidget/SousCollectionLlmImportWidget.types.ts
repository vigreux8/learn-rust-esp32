import type { SousCollectionUi } from "../../../types/quizz";

export type SousCollectionLlmImportWidgetProps = {
  data: {
    collectionId: number;
    sousCollectionId: number;
    collectionNom: string | null;
    selectedSous: SousCollectionUi;
    assignedQuestions: SousCollectionUi["questions"];
    disabled: boolean;
  };
  actions: {
    onImportSuccess: () => void;
  };
};
