import type { Dispatch, StateUpdater } from "preact/hooks";
import type { PlayQtype } from "../../../../../../lib/playOrder";
import type { CollectionUi } from "../../../../../../types/quizz";
import type { PlayModeSettings } from "../../../../atomes/PlayModePicker/PlayModePicker.types";
import type { CollectionFilter } from "../../CollectionsView.types";

export type UseCollectionsListingUiOptions = {
  identity: {
    userId: number;
  };
  data: {
    collections: CollectionUi[];
  };
};

export type UseCollectionsListingUiResult = {
  filters: {
    filter: CollectionFilter;
    setFilter: Dispatch<StateUpdater<CollectionFilter>>;
    tagFilter: number | "all";
    setTagFilter: Dispatch<StateUpdater<number | "all">>;
    tagFilterOptions: { id: number; nom: string }[];
  };
  playback: {
    playMode: PlayModeSettings;
    setPlayMode: Dispatch<StateUpdater<PlayModeSettings>>;
    playQtype: PlayQtype;
    setPlayQtype: Dispatch<StateUpdater<PlayQtype>>;
    playInfinite: boolean;
    setPlayInfinite: Dispatch<StateUpdater<boolean>>;
  };
  hierarchyViews: {
    hierarchySubtreeRootId: number | null;
    hierarchySubtreeRootNom: string;
    hierarchySubtreeSearch: string;
    setHierarchySubtreeSearch: Dispatch<StateUpdater<string>>;
    hierarchySuggestFocused: boolean;
    setHierarchySubtreeRootId: Dispatch<StateUpdater<number | null>>;
    setHierarchySuggestFocused: Dispatch<StateUpdater<boolean>>;
    hierarchySearchSuggestions: { id: number; nom: string }[];
    showHierarchySuggestPanel: boolean;
    clearHierarchySubtree: () => void;
    setHierarchyRootFromCard: (collectionId: number, enabled: boolean) => void;
  };
  listSearch: {
    collectionListSearch: string;
    setCollectionListSearch: Dispatch<StateUpdater<string>>;
    collectionListSuggestFocused: boolean;
    setCollectionListSuggestFocused: Dispatch<StateUpdater<boolean>>;
    collectionListSuggestions: { id: number; nom: string }[];
    showCollectionListSuggestPanel: boolean;
  };
  display: {
    tagPickerPool: { id: number; nom: string }[];
    filtered: CollectionUi[];
    filteredSourceCount: number;
    autresCreateurs: [number, string][];
    getTreeDepth: (collection: CollectionUi) => number;
  };
};
