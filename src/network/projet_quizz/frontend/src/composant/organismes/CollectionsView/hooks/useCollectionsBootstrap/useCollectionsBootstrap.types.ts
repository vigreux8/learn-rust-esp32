import type { Dispatch, StateUpdater } from "preact/hooks";
import type { CollectionUi, PersonalitePickerRowUi } from "../../../../../types/quizz";

export type UseCollectionsBootstrapOptions = {
  identity: {
    userId: number;
  };
};

export type UseCollectionsBootstrapResult = {
  data: {
    collections: CollectionUi[];
    setCollections: Dispatch<StateUpdater<CollectionUi[]>>;
    personalitesPicker: PersonalitePickerRowUi[];
    setPersonalitesPicker: Dispatch<StateUpdater<PersonalitePickerRowUi[]>>;
  };
  loaders: {
    loadBootstrap: () => Promise<{ list: CollectionUi[]; picker: PersonalitePickerRowUi[] }>;
  };
  status: {
    loading: boolean;
    error: string | null;
    setLoading: (v: boolean) => void;
    setError: (v: string | null) => void;
  };
};
