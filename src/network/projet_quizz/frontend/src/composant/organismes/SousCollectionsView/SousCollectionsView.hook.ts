import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { DragEndEvent } from "@dnd-kit/dom";
import {
  deleteDetachQuestionFromSousCollection,
  fetchCollection,
  fetchQuestions,
  fetchSousCollections,
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
  const [createNom, setCreateNom] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

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
    setCreateNom("");
    setCreateDescription("");
    setCreateModalOpen(true);
  }, []);

  const onCloseCreate = useCallback(() => {
    if (!createBusy) {
      setCreateModalOpen(false);
    }
  }, [createBusy]);

  const onSubmitCreate = useCallback(() => {
    if (collectionIdNum == null || createNom.trim() === "" || collection == null || collection.user_id !== userId) {
      return;
    }
    setCreateBusy(true);
    setOperationError(null);
    postCreateSousCollection(collectionIdNum, {
      user_id: userId,
      nom: createNom.trim(),
      description: createDescription.trim(),
    })
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
  }, [collection, collectionIdNum, createDescription, createNom, userId, reloadSousOnly]);

  const dismissOperationError = useCallback(() => setOperationError(null), []);

  return {
    routing: { collectionIdNum },
    status: { loading, loadError, operationError, dismissOperationError, isOwner },
    data: {
      collectionNom: collection?.nom ?? null,
      sousCollections,
      selectedSousId,
      selectedSous,
      poolQuestions,
      assignedQuestions: selectedSous?.questions ?? [],
    },
    liste: {
      onSelectSous: setSelectedSousId,
      createModalOpen,
      createNom,
      createDescription,
      createBusy,
      onOpenCreate,
      onCloseCreate,
      onChangeCreateNom: setCreateNom,
      onChangeCreateDescription: setCreateDescription,
      onSubmitCreate,
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
