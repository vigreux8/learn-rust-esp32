import type { Dispatch, StateUpdater } from "preact/hooks";
import type { CollectionUi, PersonalitePickerRowUi } from "../../../../../types/quizz";
import type { PendingDelete } from "../../CollectionsView.types";

export type UseCollectionsMutationsOptions = {
  identity: {
    userId: number;
  };
  data: {
    setCollections: Dispatch<StateUpdater<CollectionUi[]>>;
    setPersonalitesPicker: Dispatch<StateUpdater<PersonalitePickerRowUi[]>>;
  };
};

export type UseCollectionsMutationsResult = {
  forms: {
    newCollName: string;
    newCollTagId: number | "";
    createCollBusy: boolean;
    createCollError: string | null;
    newCollectionKind: "normale" | "personnalite";
    personnaliteModalOpen: boolean;
    personnaliteModalBusy: boolean;
    personnaliteModalError: string | null;
  };
  actions: {
    onChangeNewCollName: Dispatch<StateUpdater<string>>;
    onChangeNewCollTagId: Dispatch<StateUpdater<number | "">>;
    onChangeNewCollectionKind: Dispatch<StateUpdater<"normale" | "personnalite">>;
    onCreateCollection: () => Promise<void>;
    onAssignTag: (collectionId: number, tagCollectionId: number) => Promise<void>;
    onUnassignTag: (collectionId: number, tagCollectionId: number) => Promise<void>;
    onAssignPersoToCollection: (
      collectionId: number,
      personaliteId: number,
      importanceType: "" | "pionnier" | "important" | "secondaire",
    ) => Promise<void>;
    onUnassignPersoFromCollection: (collectionId: number, personaliteId: number) => Promise<void>;
    onOpenPersonnaliteModal: () => void;
    onClosePersonnaliteModal: () => void;
    onSubmitPersonnaliteModal: (payload: {
      nom: string;
      prenom: string;
      naissance: number;
      mort: number | null;
      resumer: string;
      tagCollectionId: number | "";
    }) => Promise<void>;
    onRequestDeleteCollection: (collection: CollectionUi) => void;
  };
  confirmations: {
    pendingDelete: PendingDelete;
    deleteCollectionBusyId: number | null;
    deleteCollectionError: string | null;
    assignBusyCollectionId: number | null;
    assignError: string | null;
    assignPersoBusyCollectionId: number | null;
    assignPersoError: string | null;
    runConfirmedDelete: () => Promise<void>;
    dismissPendingDelete: () => void;
    confirmBusy: boolean;
  };
};
