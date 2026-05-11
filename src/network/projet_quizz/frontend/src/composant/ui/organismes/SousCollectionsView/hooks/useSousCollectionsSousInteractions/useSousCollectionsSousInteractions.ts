import { useCallback, useState } from "preact/hooks";
import type { DragEndEvent } from "@dnd-kit/dom";
import {
  deleteDetachQuestionFromSousCollection,
  deleteSousCollection,
  patchSousCollection,
  postAttachQuestionToSousCollection,
  postCreateSousCollection,
} from "../../../../../../lib/api";
import type {
  SousFormMode,
  UseSousCollectionsSousInteractionsProps,
} from "./useSousCollectionsSousInteractions.types";

/**
 * Interactions sur les sous-collections et le pool : DnD d’attachement / détachement, CRUD sous-collection,
 * modales de formulaire et appels API associés.
 */
export function useSousCollectionsSousInteractions({
  routing,
  catalogue,
  core,
}: UseSousCollectionsSousInteractionsProps) {
  const { collectionIdNum } = routing;
  const { selectedSous, selectedSousId, setSelectedSousId } = catalogue;
  const {
    reloadAll,
    reloadSousOnly,
    setOperationError,
    selectedSousIdRef,
    collection,
    userIdentity: userId,
  } = core;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [sousFormMode, setSousFormMode] = useState<SousFormMode>("create");
  const [createNom, setCreateNom] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled === true) {
        return;
      }
      const sourceEntity = event.operation.source;
      const targetEntity = event.operation.target;
      if (sourceEntity == null) {
        return;
      }
      const raw = sourceEntity.data as { from?: string; questionId?: number } | undefined;
      if (raw?.from !== "pool" && raw?.from !== "assigned") {
        return;
      }
      const questionId = raw.questionId;
      if (questionId == null || !Number.isInteger(questionId)) {
        return;
      }
      const targetId = targetEntity?.id != null ? String(targetEntity.id) : "";

      const sid = selectedSousIdRef.current;
      if (sid == null) {
        return;
      }

      if (raw.from === "pool" && targetId === "drop-sous") {
        void postAttachQuestionToSousCollection(sid, { user_id: userId, question_id: questionId })
          .then(() => {
            setOperationError(null);
            reloadSousOnly();
          })
          .catch((e: Error) => {
            setOperationError(e.message ?? "Erreur lors de l’ajout.");
          });
        return;
      }

      if (raw.from === "assigned" && targetId === "drop-pool") {
        void deleteDetachQuestionFromSousCollection(sid, questionId, userId)
          .then(() => {
            setOperationError(null);
            reloadSousOnly();
          })
          .catch((e: Error) => {
            setOperationError(e.message ?? "Erreur lors du retrait.");
          });
      }
    },
    [userId, reloadSousOnly, setOperationError, selectedSousIdRef],
  );

  const onOpenCreate = useCallback(() => {
    setSousFormMode("create");
    setCreateNom("");
    setCreateDescription("");
    setCreateModalOpen(true);
  }, []);

  const onOpenEdit = useCallback(() => {
    if (selectedSous == null || collection == null || collection.user_id !== userId) {
      return;
    }
    setSousFormMode("edit");
    setCreateNom(selectedSous.nom);
    setCreateDescription(selectedSous.description ?? "");
    setCreateModalOpen(true);
  }, [selectedSous, collection, userId]);

  const onCloseCreate = useCallback(() => {
    if (!createBusy) {
      setCreateModalOpen(false);
    }
  }, [createBusy]);

  const onDeleteSelected = useCallback(() => {
    if (collectionIdNum == null || selectedSousId == null || collection == null || collection.user_id !== userId) {
      return;
    }
    if (
      !window.confirm(
        "Supprimer cette sous-collection (collection enfant) ? Les questions restent dans la collection parent ; seuls les liens vers cette enfant sont supprimés, puis la collection enfant est effacée.",
      )
    ) {
      return;
    }
    const sid = selectedSousId;
    setDeleteBusy(true);
    setOperationError(null);
    void deleteSousCollection(sid, userId)
      .then(() => {
        reloadAll();
      })
      .catch((e: Error) => {
        setOperationError(e.message ?? "Suppression impossible.");
      })
      .finally(() => {
        setDeleteBusy(false);
      });
  }, [collection, collectionIdNum, selectedSousId, userId, reloadAll, setOperationError]);

  const onSubmitCreate = useCallback(() => {
    if (createNom.trim() === "" || collection == null || collection.user_id !== userId) {
      return;
    }
    setCreateBusy(true);
    setOperationError(null);
    const body = {
      user_id: userId,
      nom: createNom.trim(),
      description: createDescription.trim(),
    };
    if (sousFormMode === "create") {
      if (collectionIdNum == null) {
        setCreateBusy(false);
        return;
      }
      postCreateSousCollection(collectionIdNum, body)
        .then((created) => {
          setCreateModalOpen(false);
          setCreateNom("");
          setCreateDescription("");
          reloadSousOnly();
          setSelectedSousId(created.id);
        })
        .catch((e: Error) => {
          setOperationError(e.message ?? "Création impossible.");
        })
        .finally(() => setCreateBusy(false));
      return;
    }
    if (selectedSousId == null) {
      setCreateBusy(false);
      return;
    }
    patchSousCollection(selectedSousId, body)
      .then(() => {
        setCreateModalOpen(false);
        setCreateNom("");
        setCreateDescription("");
        reloadSousOnly();
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
    selectedSousId,
    sousFormMode,
    userId,
    reloadSousOnly,
    setOperationError,
    setSelectedSousId,
  ]);

  const isOwner = collection != null && collection.user_id === userId;

  return {
    dragDrop: { onDragEnd },
    liste: {
      onSelectSous: (id: number) => setSelectedSousId(id),
      createModalOpen,
      sousFormMode,
      createNom,
      createDescription,
      createBusy,
      deleteBusy,
      canDeleteSelected: isOwner && selectedSousId != null,
      canEditSelected: isOwner && selectedSousId != null,
      onOpenCreate,
      onOpenEdit,
      onCloseCreate,
      onChangeCreateNom: setCreateNom,
      onChangeCreateDescription: setCreateDescription,
      onSubmitCreate,
      onDeleteSelected,
    },
  };
}
