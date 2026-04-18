import type { CollectionUi } from "../../../types/quizz";

export type ActionExportCollectionJsonProps = {
  data: {
    collections: CollectionUi[];
    targetCollectionNumeric: number | null;
  };
};
