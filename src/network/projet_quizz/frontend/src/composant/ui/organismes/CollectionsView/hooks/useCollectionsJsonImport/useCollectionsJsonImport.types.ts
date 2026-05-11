import type { Dispatch, StateUpdater } from "preact/hooks";
import type { CollectionUi, PersonalitePickerRowUi } from "../../../../../../types/quizz";

export type UseCollectionsJsonImportOptions = {
  identity: {
    userId: number;
  };
  integrations: {
    loadBootstrap: () => Promise<{ list: CollectionUi[]; picker: PersonalitePickerRowUi[] }>;
    setCollections: Dispatch<StateUpdater<CollectionUi[]>>;
    setPersonalitesPicker: Dispatch<StateUpdater<PersonalitePickerRowUi[]>>;
    deleteCollection: (id: number, userId: number) => Promise<void>;
  };
};

export type UseCollectionsJsonImportPanel = {
  inputRef: { current: HTMLInputElement | null };
  panel: {
    open: boolean;
    mode: "app" | "llm";
    categorie: "histoire" | "pratique" | "connaissance";
    busy: boolean;
    text: string;
    error: string | null;
    message: string | null;
    onChangeCategorie: Dispatch<StateUpdater<"histoire" | "pratique" | "connaissance">>;
    onOpenFilePicker: () => void;
    onChangeText: Dispatch<StateUpdater<string>>;
    onRun: () => void;
    onFileChange: (event: Event) => void;
  };
  chrome: {
    headerJsonImportOpen: boolean;
    headerJsonImportMode: "app" | "llm";
    onHeaderOpenFlowLearnImport: () => void;
    setChromeOpen: (open: boolean) => void;
    setChromeMode: (mode: "app" | "llm") => void;
  };
};
