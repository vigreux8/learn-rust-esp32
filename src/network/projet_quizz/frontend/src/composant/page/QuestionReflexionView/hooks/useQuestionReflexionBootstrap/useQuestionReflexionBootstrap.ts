import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { fetchCollection, fetchGroupeQuestions } from "../../../../../lib/api";
import { useUserSession } from "../../../../../lib/userSession";
import type { CollectionUi, GroupeQuestionsUi } from "../../../../../types/quizz";
import { normalizeCollectionIdParam } from "../../../SousCollectionsView/SousCollectionsView.metier";
import type { UseQuestionReflexionBootstrapProps } from "./useQuestionReflexionBootstrap.types";

/**
 * Chargement initial et navigation « collection » : id normalisé, collection, liste des groupes, sélection,
 * erreurs de chargement et `reloadAll` (synchronisé avec le flush chaîne pour recharger l’ordre réflexion).
 */
export function useQuestionReflexionBootstrap({ route, chainFlush }: UseQuestionReflexionBootstrapProps) {
  const { userId } = useUserSession();
  const collectionIdNum = useMemo(() => normalizeCollectionIdParam(route.collectionId), [route.collectionId]);

  const [collection, setCollection] = useState<CollectionUi | null>(null);
  const [groupes, setGroupes] = useState<GroupeQuestionsUi[]>([]);
  const [selectedGroupeId, setSelectedGroupeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const selectedGroupeIdRef = useRef<number | null>(null);

  const applySelectedGroupeId = useCallback((id: number | null) => {
    selectedGroupeIdRef.current = id;
    setSelectedGroupeId(id);
  }, []);

  useEffect(() => {
    selectedGroupeIdRef.current = selectedGroupeId;
  }, [selectedGroupeId]);

  const reloadAll = useCallback(() => {
    if (collectionIdNum == null) {
      return;
    }
    setLoading(true);
    setLoadError(null);
    Promise.all([fetchCollection(collectionIdNum), fetchGroupeQuestions(collectionIdNum)])
      .then(([col, groupesList]) => {
        setCollection(col);
        setGroupes(groupesList);
        const nextId =
          selectedGroupeIdRef.current != null && groupesList.some((g) => g.id === selectedGroupeIdRef.current)
            ? selectedGroupeIdRef.current
            : route.groupeId != null && groupesList.some((g) => g.id === route.groupeId)
              ? route.groupeId
              : groupesList[0]?.id ?? null;
        applySelectedGroupeId(nextId);
        const flush = chainFlush.current;
        return flush?.(collectionIdNum, nextId) ?? Promise.resolve();
      })
      .catch(() => setLoadError("fetch"))
      .finally(() => setLoading(false));
  }, [collectionIdNum, route.groupeId, applySelectedGroupeId, chainFlush]);

  useEffect(() => {
    if (collectionIdNum == null) {
      setLoading(false);
      setLoadError("invalid");
      setCollection(null);
      setGroupes([]);
      applySelectedGroupeId(null);
      return;
    }
    reloadAll();
  }, [collectionIdNum, reloadAll, applySelectedGroupeId]);

  const slice = {
    identity: { userId },
    routing: { collectionIdNum },
    data: {
      collection,
      setCollection,
      groupes,
      setGroupes,
      selectedGroupeId,
      selectedGroupeIdRef,
      applySelectedGroupeId,
    },
    loaders: { reloadAll },
    status: { loading, loadError },
  };
  return slice;
}

export type QuestionReflexionBootstrapSlice = ReturnType<typeof useQuestionReflexionBootstrap>;
