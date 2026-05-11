import type { CollectionUi } from "../../../../../../types/quizz";

export type UseSousCollectionsDataProps = {
  routing: {
    collectionIdNum: number | null;
  };
};

export type SousCollectionsDataSliceStatus = {
  loading: boolean;
  loadError: string | null;
  operationError: string | null;
  dismissOperationError: () => void;
  isOwner: boolean;
};

export type SousCollectionsDataSliceInternals = {
  reloadAll: () => void;
  reloadSousOnly: () => void;
  setOperationError: (value: string | null) => void;
  selectedSousIdRef: { current: number | null };
  collection: CollectionUi | null;
  userIdentity: number;
};
