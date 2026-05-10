import { useCallback, useMemo, useState } from "preact/hooks";
import {
  deleteGroupeQuestions,
  patchGroupeQuestions,
  postCreateGroupeQuestions,
} from "../../../../../lib/api";
import { parseGroupeQuestionsPourFormulaire } from "../../QuestionReflexionView.metier";
import type { UseQuestionReflexionGroupeListeProps } from "./useQuestionReflexionGroupeListe.types";

type GroupeFormMode = "create" | "edit";

export function useQuestionReflexionGroupeListe({
  bootstrap,
  status,
  integrations,
}: UseQuestionReflexionGroupeListeProps) {
  const { setOperationError } = status;
  const { userId } = bootstrap.identity;
  const collectionIdNum = bootstrap.routing.collectionIdNum;
  const collection = bootstrap.data.collection;
  const groupes = bootstrap.data.groupes;
  const selectedGroupeId = bootstrap.data.selectedGroupeId;
  const applySelectedGroupeId = bootstrap.data.applySelectedGroupeId;
  const reloadAll = bootstrap.loaders.reloadAll;
  const { loadChainFor, reloadGroupesOnly } = integrations;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [groupeFormMode, setGroupeFormMode] = useState<GroupeFormMode>("create");
  const [createNom, setCreateNom] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [deleteGroupeBusy, setDeleteGroupeBusy] = useState(false);

  const selectedGroupe = useMemo(() => {
    if (selectedGroupeId == null) return null;
    return groupes.find((g) => g.id === selectedGroupeId) ?? null;
  }, [groupes, selectedGroupeId]);

  const isOwner = collection != null && collection.user_id === userId;

  const onOpenCreateGroupe = useCallback(() => {
    setGroupeFormMode("create");
    setCreateNom("");
    setCreateDescription("");
    setCreateModalOpen(true);
  }, []);

  const onOpenEditGroupe = useCallback(() => {
    if (selectedGroupe == null || collection == null || collection.user_id !== userId) {
      return;
    }
    setGroupeFormMode("edit");
    const parsed = parseGroupeQuestionsPourFormulaire(selectedGroupe);
    setCreateNom(parsed.nom);
    setCreateDescription(parsed.description);
    setCreateModalOpen(true);
  }, [selectedGroupe, collection, userId]);

  const onCloseGroupeModal = useCallback(() => {
    if (!createBusy) {
      setCreateModalOpen(false);
    }
  }, [createBusy]);

  const onSubmitGroupe = useCallback(() => {
    if (createNom.trim() === "" || collection == null || collection.user_id !== userId || collectionIdNum == null) {
      return;
    }
    setCreateBusy(true);
    setOperationError(null);
    const body = {
      user_id: userId,
      nom: createNom.trim(),
      description: createDescription.trim(),
    };
    if (groupeFormMode === "create") {
      postCreateGroupeQuestions(collectionIdNum, body)
        .then((created) => {
          setCreateModalOpen(false);
          setCreateNom("");
          setCreateDescription("");
          reloadGroupesOnly();
          applySelectedGroupeId(created.id);
          void loadChainFor(collectionIdNum, created.id);
        })
        .catch((e: Error) => {
          setOperationError(e.message ?? "Création impossible.");
        })
        .finally(() => setCreateBusy(false));
      return;
    }
    if (selectedGroupeId == null) {
      setCreateBusy(false);
      return;
    }
    patchGroupeQuestions(selectedGroupeId, body)
      .then(() => {
        setCreateModalOpen(false);
        setCreateNom("");
        setCreateDescription("");
        reloadGroupesOnly();
      })
      .catch((e: Error) => {
        setOperationError(e.message ?? "Modification impossible.");
      })
      .finally(() => setCreateBusy(false));
  }, [
    collection,
    collectionIdNum,
    createDescription,
    createNom,
    groupeFormMode,
    loadChainFor,
    reloadGroupesOnly,
    selectedGroupeId,
    setOperationError,
    userId,
    applySelectedGroupeId,
  ]);

  const onDeleteGroupe = useCallback(() => {
    if (
      collectionIdNum == null ||
      selectedGroupeId == null ||
      collection == null ||
      collection.user_id !== userId
    ) {
      return;
    }
    if (
      !window.confirm(
        "Supprimer cette suite logique ? Les liens d’ordre (réflexion) de cette suite seront effacés ; les questions restent dans la collection.",
      )
    ) {
      return;
    }
    const gid = selectedGroupeId;
    setDeleteGroupeBusy(true);
    setOperationError(null);
    void deleteGroupeQuestions(gid, userId)
      .then(() => {
        reloadAll();
      })
      .catch((e: Error) => {
        setOperationError(e.message ?? "Suppression impossible.");
      })
      .finally(() => {
        setDeleteGroupeBusy(false);
      });
  }, [collection, collectionIdNum, selectedGroupeId, setOperationError, userId, reloadAll]);

  return {
    modal: {
      createModalOpen,
      groupeFormMode,
      createNom,
      createDescription,
      createBusy,
      deleteGroupeBusy,
      onOpenCreate: onOpenCreateGroupe,
      onOpenEdit: onOpenEditGroupe,
      onCloseCreate: onCloseGroupeModal,
      onChangeCreateNom: setCreateNom,
      onChangeCreateDescription: setCreateDescription,
      onSubmitCreate: onSubmitGroupe,
      onDeleteSelected: onDeleteGroupe,
    },
    derived: {
      selectedGroupe,
      isOwner,
      selectedGroupeId,
    },
  };
}
