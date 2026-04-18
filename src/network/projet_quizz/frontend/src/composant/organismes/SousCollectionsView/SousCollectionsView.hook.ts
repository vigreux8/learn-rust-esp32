import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { DragEndEvent } from "@dnd-kit/dom";
import {
  deleteDetachQuestionFromSousCollection,
  deleteSousCollection,
  fetchCollection,
  fetchQuestions,
  fetchSousCollections,
  patchSousCollection,
  postAttachQuestionToSousCollection,
  postCreateSousCollection,
} from "../../../lib/api";
import { useUserSession } from "../../../lib/userSession";
import type { CollectionUi, QuizzQuestionRow, SousCollectionUi } from "../../../types/quizz";
import {
  filterPoolExcludingAssigned,
  filterQuestionsBySearch,
  normalizeCollectionIdParam,
} from "./SousCollectionsView.metier";
import type { SousCollectionsViewProps } from "./SousCollectionsView.types";

type SousFormMode = "create" | "edit";

export function useSousCollectionsViewState(props: SousCollectionsViewProps) {
  const { userId } = useUserSession();
  const collectionIdNum = useMemo(() => normalizeCollectionIdParam(props.collectionId), [props.collectionId]);

  const [collection, setCollection] = useState<CollectionUi | null>(null);
  const [questions, setQuestions] = useState<QuizzQuestionRow[]>([]);
  const [sousCollections, setSousCollections] = useState<SousCollectionUi[]>([]);
  const [selectedSousId, setSelectedSousId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [sousFormMode, setSousFormMode] = useState<SousFormMode>("create");
  const [createNom, setCreateNom] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const selectedSousIdRef = useRef<number | null>(null);
  useEffect(() => {
    selectedSousIdRef.current = selectedSousId;
  }, [selectedSousId]);

  const reloadAll = useCallback(() => {
    if (collectionIdNum == null) {
      return;
    }
    setLoading(true);
    setLoadError(null);
    Promise.all([
      fetchCollection(collectionIdNum),
      fetchQuestions(collectionIdNum),
      fetchSousCollections(collectionIdNum),
    ])
      .then(([col, qs, sous]) => {
        setCollection(col);
        setQuestions(qs);
        setSousCollections(sous);
        setSelectedSousId((prev) => {
          if (prev != null && sous.some((s) => s.id === prev)) {
            return prev;
          }
          return sous[0]?.id ?? null;
        });
      })
      .catch(() => setLoadError("fetch"))
      .finally(() => setLoading(false));
  }, [collectionIdNum]);

  useEffect(() => {
    if (collectionIdNum == null) {
      setLoading(false);
      setLoadError("invalid");
      setCollection(null);
      setQuestions([]);
      setSousCollections([]);
      setSelectedSousId(null);
      return;
    }
    reloadAll();
  }, [collectionIdNum, reloadAll]);

  const reloadSousOnly = useCallback(() => {
    if (collectionIdNum == null) return;
    fetchSousCollections(collectionIdNum)
      .then(setSousCollections)
      .catch(() => setOperationError("Impossible de recharger les sous-collections."));
  }, [collectionIdNum]);

  const selectedSous = useMemo(() => {
    if (selectedSousId == null) return null;
    return sousCollections.find((s) => s.id === selectedSousId) ?? null;
  }, [sousCollections, selectedSousId]);

  const assignedIds = useMemo(() => {
    if (selectedSous == null) return new Set<number>();
    return new Set(selectedSous.questions.map((q) => q.question_id));
  }, [selectedSous]);

  const poolQuestions = useMemo(() => {
    const searched = filterQuestionsBySearch(questions, search);
    return filterPoolExcludingAssigned(searched, assignedIds);
  }, [questions, search, assignedIds]);

  const isOwner = collection != null && collection.user_id === userId;

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
    [userId, reloadSousOnly],
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
        "Supprimer cette sous-collection ? Les questions restent dans la collection ; seuls les rattachements à cette sous-collection sont retirés.",
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
  }, [collection, collectionIdNum, selectedSousId, userId, reloadAll]);

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
  ]);

  const dismissOperationError = useCallback(() => setOperationError(null), []);

  return {
    routing: { collectionIdNum },
    status: { loading, loadError, operationError, dismissOperationError, isOwner },
    data: {
      collectionNom: collection?.nom ?? null,
      collection,
      questions,
      sousCollections,
      selectedSousId,
      selectedSous,
      poolQuestions,
      assignedQuestions: selectedSous?.questions ?? [],
    },
    liste: {
      onSelectSous: setSelectedSousId,
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
    filtres: {
      search,
      onSearchChange: setSearch,
    },
    dragDrop: {
      onDragEnd,
    },
    reload: reloadAll,
  };
}
