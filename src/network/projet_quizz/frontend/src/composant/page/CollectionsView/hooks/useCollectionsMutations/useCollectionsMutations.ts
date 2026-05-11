import { useState } from "preact/hooks";
import { route } from "preact-router";
import {
  assignCollectionTag,
  assignPersonaliteToCollection,
  createEmptyCollection,
  createPersonaliteCollection,
  deleteCollection,
  fetchPersonalitesPicker,
  unassignCollectionTag,
  unassignPersonaliteFromCollection,
} from "../../../../../lib/api";
import type { CollectionUi } from "../../../../../types/quizz";
import type { PendingDelete } from "../../CollectionsView.types";
import type {
  UseCollectionsMutationsOptions,
  UseCollectionsMutationsResult,
} from "./useCollectionsMutations.types";

/**
 * Mutations collections (création, suppression, tags, personnalités) : appels API, navigation après création,
 * états de suppression en attente et rafraîchissement des listes locales.
 */
export function useCollectionsMutations(opts: UseCollectionsMutationsOptions): UseCollectionsMutationsResult {
  const {
    identity: { userId },
    data: { setCollections, setPersonalitesPicker },
  } = opts;

  const [assignBusyCollectionId, setAssignBusyCollectionId] = useState<number | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [deleteCollectionBusyId, setDeleteCollectionBusyId] = useState<number | null>(null);
  const [deleteCollectionError, setDeleteCollectionError] = useState<string | null>(null);
  const [newCollName, setNewCollName] = useState("");
  const [newCollTagId, setNewCollTagId] = useState<number | "">("");
  const [createCollBusy, setCreateCollBusy] = useState(false);
  const [createCollError, setCreateCollError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [newCollectionKind, setNewCollectionKind] = useState<"normale" | "personnalite">("normale");
  const [personnaliteModalOpen, setPersonnaliteModalOpen] = useState(false);
  const [personnaliteModalBusy, setPersonnaliteModalBusy] = useState(false);
  const [personnaliteModalError, setPersonnaliteModalError] = useState<string | null>(null);
  const [assignPersoBusyCollectionId, setAssignPersoBusyCollectionId] = useState<number | null>(null);
  const [assignPersoError, setAssignPersoError] = useState<string | null>(null);

  const confirmBusyFlag = pendingDelete != null && deleteCollectionBusyId !== null;

  const onAssignTag = async (collectionId: number, tagCollectionId: number) => {
    setAssignBusyCollectionId(collectionId);
    setAssignError(null);
    try {
      const updated = await assignCollectionTag(collectionId, tagCollectionId);
      setCollections((prev) => prev.map((coll) => (coll.id === collectionId ? updated : coll)));
    } catch (eRow) {
      setAssignError(eRow instanceof Error ? eRow.message : "Association etiquette impossible.");
    } finally {
      setAssignBusyCollectionId(null);
    }
  };

  const onUnassignTag = async (collectionId: number, tagCollectionId: number) => {
    setAssignBusyCollectionId(collectionId);
    setAssignError(null);
    try {
      const updated = await unassignCollectionTag(collectionId, tagCollectionId);
      setCollections((prev) => prev.map((coll) => (coll.id === collectionId ? updated : coll)));
    } catch (eRow) {
      setAssignError(eRow instanceof Error ? eRow.message : "Retrait etiquette impossible.");
    } finally {
      setAssignBusyCollectionId(null);
    }
  };

  const onAssignPersoToCollection = async (
    collectionId: number,
    personaliteId: number,
    importanceType: "" | "pionnier" | "important" | "secondaire",
  ) => {
    setAssignPersoBusyCollectionId(collectionId);
    setAssignPersoError(null);
    try {
      const updated = await assignPersonaliteToCollection(collectionId, {
        userId,
        personaliteId,
        importanceType: importanceType === "" ? null : importanceType,
      });
      setCollections((prev) => prev.map((coll) => (coll.id === collectionId ? updated : coll)));
    } catch (eRow) {
      setAssignPersoError(eRow instanceof Error ? eRow.message : "Association personnalité impossible.");
    } finally {
      setAssignPersoBusyCollectionId(null);
    }
  };

  const onUnassignPersoFromCollection = async (collectionId: number, personaliteId: number) => {
    setAssignPersoBusyCollectionId(collectionId);
    setAssignPersoError(null);
    try {
      const updated = await unassignPersonaliteFromCollection(collectionId, personaliteId, userId);
      setCollections((prev) => prev.map((coll) => (coll.id === collectionId ? updated : coll)));
    } catch (eRow) {
      setAssignPersoError(
        eRow instanceof Error ? eRow.message : "Dissociation personnalité impossible.",
      );
    } finally {
      setAssignPersoBusyCollectionId(null);
    }
  };

  const onSubmitPersonnaliteModal = async (payload: {
    nom: string;
    prenom: string;
    naissance: number;
    mort: number | null;
    resumer: string;
    tagCollectionId: number | "";
  }) => {
    setPersonnaliteModalBusy(true);
    setPersonnaliteModalError(null);
    try {
      const bodyRow = {
        userId,
        nom: payload.nom,
        prenom: payload.prenom,
        naissance: payload.naissance,
        mort: payload.mort,
        resumer: payload.resumer,
        ...(payload.tagCollectionId !== "" ? { tagCollectionId: Number(payload.tagCollectionId) } : {}),
      };
      const ui = await createPersonaliteCollection(bodyRow);
      setCollections((prev) => [...prev, ui].sort((a, b) => a.id - b.id));
      const picker = await fetchPersonalitesPicker().catch(() => []);
      setPersonalitesPicker(picker);
      setPersonnaliteModalOpen(false);
      const tagQRow =
        payload.tagCollectionId !== "" ? `?tagCollection=${Number(payload.tagCollectionId)}` : "";
      route(`/questions/${ui.id}${tagQRow}`);
    } catch (eRow) {
      setPersonnaliteModalError(
        eRow instanceof Error ? eRow.message : "Creation personnalité impossible.",
      );
    } finally {
      setPersonnaliteModalBusy(false);
    }
  };

  const onCreateCollection = async () => {
    const nom = newCollName.trim();
    if (!nom) return;
    setCreateCollBusy(true);
    setCreateCollError(null);
    try {
      const bodyPayload: { userId: number; nom: string; tagCollectionId?: number } = { userId, nom };
      if (newCollTagId !== "") bodyPayload.tagCollectionId = Number(newCollTagId);
      const uiRow = await createEmptyCollection(bodyPayload);
      setCollections((prev) => [...prev, uiRow].sort((a, b) => a.id - b.id));
      setNewCollName("");
      setNewCollTagId("");
      const tagQRow =
        bodyPayload.tagCollectionId != null ? `?tagCollection=${bodyPayload.tagCollectionId}` : "";
      route(`/questions/${uiRow.id}${tagQRow}`);
    } catch (eRow) {
      setCreateCollError(eRow instanceof Error ? eRow.message : "Creation impossible.");
    } finally {
      setCreateCollBusy(false);
    }
  };

  const runConfirmedDelete = async () => {
    if (pendingDelete == null) return;
    const cRow = pendingDelete.data;
    setDeleteCollectionBusyId(cRow.id);
    setDeleteCollectionError(null);
    try {
      await deleteCollection(cRow.id, userId);
      setCollections((prev) => prev.filter((xItem) => xItem.id !== cRow.id));
      setPendingDelete(null);
    } catch (eRow) {
      setDeleteCollectionError(
        eRow instanceof Error ? eRow.message : "Suppression de la collection impossible.",
      );
      setPendingDelete(null);
    } finally {
      setDeleteCollectionBusyId(null);
    }
  };

  const onOpenPersonnaliteModal = () => {
    setPersonnaliteModalError(null);
    setPersonnaliteModalOpen(true);
  };

  const onClosePersonnaliteModal = () => {
    if (!personnaliteModalBusy) setPersonnaliteModalOpen(false);
  };

  return {
    forms: {
      newCollName,
      newCollTagId,
      createCollBusy,
      createCollError,
      newCollectionKind,
      personnaliteModalOpen,
      personnaliteModalBusy,
      personnaliteModalError,
    },
    actions: {
      onChangeNewCollName: setNewCollName,
      onChangeNewCollTagId: setNewCollTagId,
      onChangeNewCollectionKind: setNewCollectionKind,
      onCreateCollection,
      onAssignTag,
      onUnassignTag,
      onAssignPersoToCollection,
      onUnassignPersoFromCollection,
      onOpenPersonnaliteModal,
      onClosePersonnaliteModal,
      onSubmitPersonnaliteModal,
      onRequestDeleteCollection: (coll: CollectionUi) =>
        setPendingDelete({ kind: "collection", data: coll }),
    },
    confirmations: {
      pendingDelete,
      deleteCollectionBusyId,
      deleteCollectionError,
      assignBusyCollectionId,
      assignError,
      assignPersoBusyCollectionId,
      assignPersoError,
      runConfirmedDelete,
      dismissPendingDelete: () => setPendingDelete(null),
      confirmBusy: confirmBusyFlag,
    },
  };
}
