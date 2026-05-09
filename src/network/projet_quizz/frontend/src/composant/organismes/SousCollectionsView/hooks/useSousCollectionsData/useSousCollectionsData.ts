import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  fetchCollection,
  fetchQuestions,
  fetchSousCollections,
} from "../../../../../lib/api";
import { useUserSession } from "../../../../../lib/userSession";
import type { CollectionUi, QuizzQuestionRow, SousCollectionUi } from "../../../../../types/quizz";
import { filterPoolExcludingAssigned, filterQuestionsBySearch } from "../../SousCollectionsView.metier";
import type {
  SousCollectionsDataSliceInternals,
  SousCollectionsDataSliceStatus,
  UseSousCollectionsDataProps,
} from "./useSousCollectionsData.types";

export function useSousCollectionsData({ routing }: UseSousCollectionsDataProps) {
  const { collectionIdNum } = routing;
  const { userId } = useUserSession();

  const [collection, setCollection] = useState<CollectionUi | null>(null);
  const [questions, setQuestions] = useState<QuizzQuestionRow[]>([]);
  const [sousCollections, setSousCollections] = useState<SousCollectionUi[]>([]);
  const [selectedSousId, setSelectedSousId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

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

  const dismissOperationError = useCallback(() => setOperationError(null), []);

  const internals: SousCollectionsDataSliceInternals = {
    reloadAll,
    reloadSousOnly,
    setOperationError,
    selectedSousIdRef,
    collection,
    userIdentity: userId,
  };

  const status: SousCollectionsDataSliceStatus = {
    loading,
    loadError,
    operationError,
    dismissOperationError,
    isOwner,
  };

  return {
    status,
    data: {
      collectionNom: collection?.nom ?? null,
      sousCollections,
      selectedSousId,
      selectedSous,
      poolQuestions,
      search,
      onSearchChange: setSearch,
      setSelectedSousId,
    },
    internals,
  };
}
