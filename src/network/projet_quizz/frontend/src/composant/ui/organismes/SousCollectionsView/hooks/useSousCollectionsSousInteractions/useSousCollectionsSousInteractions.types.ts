import type { SousCollectionUi } from "../../../../../../types/quizz";
import type { SousCollectionsDataSliceInternals } from "../useSousCollectionsData/useSousCollectionsData.types";

export type UseSousCollectionsSousInteractionsProps = {
  routing: {
    collectionIdNum: number | null;
  };
  catalogue: {
    selectedSous: SousCollectionUi | null;
    selectedSousId: number | null;
    setSelectedSousId: (value: number | ((prev: number | null) => number | null)) => void;
  };
  core: SousCollectionsDataSliceInternals;
};

export type SousFormMode = "create" | "edit";
