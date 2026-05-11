import { route as routeNavigate } from "preact-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { deleteQuestion, fetchGroupeQuestions, fetchRefCategories, fetchReflexionChain } from "../../../../../../lib/api";
import type { QuestionCategorieKey } from "../../../../../../lib/questionCategories";
import type { QuizzQuestionRow, RefCategorieRow } from "../../../../../../types/quizz";
import { filterQuestionsBySearch } from "../../../SousCollectionsView/SousCollectionsView.metier";
import type { LlmImportPayload } from "../../../../molecules/QuestionsLlmImportPanel";
import {
  buildReflexionLocalPoolDraftsFromImport,
  chainColorLevelsFromApi,
  filterChainColorLevelsToOrderedIds,
  partitionRowsByOrderedIds,
  refCategorieIdForLlmKey,
  resetReflexionLocalDraftIdCounter,
  serializeChainColorLevelsForDirty,
} from "../../QuestionReflexionView.metier";
import type { ReflexionLocalPoolDraft } from "../../QuestionReflexionView.types";
import { useQuestionReflexionChainDrag } from "../useQuestionReflexionChainDrag";
import { useQuestionReflexionChainSave } from "../useQuestionReflexionChainSave";
import type { UseQuestionReflexionChainDraftProps } from "./useQuestionReflexionChainDraft.types";

/**
 * Cœur « suite logique » : état de la chaîne ordonnée, du pool, des couleurs et des brouillons LLM ;
 * chargement `loadChainFor`, filtres, import local LLM, navigation, suppression de question côté chaîne,
 * et exposition des setters / refs pour les autres sous-hooks (édition, garde de sortie).
 */
export function useQuestionReflexionChainDraft({
  bootstrap,
  chainFlush,
  status,
  integrations,
}: UseQuestionReflexionChainDraftProps) {
  const { setOperationError } = status;
  const { getConfirmLeave } = integrations;
  const { userId } = bootstrap.identity;
  const collectionIdNum = bootstrap.routing.collectionIdNum;
  const collection = bootstrap.data.collection;
  const setCollection = bootstrap.data.setCollection;
  const groupes = bootstrap.data.groupes;
  const setGroupes = bootstrap.data.setGroupes;
  const selectedGroupeId = bootstrap.data.selectedGroupeId;
  const selectedGroupeIdRef = bootstrap.data.selectedGroupeIdRef;
  const applySelectedGroupeId = bootstrap.data.applySelectedGroupeId;

  const [ordered, setOrdered] = useState<QuizzQuestionRow[]>([]);
  const [pool, setPool] = useState<QuizzQuestionRow[]>([]);
  const [chainColorLevels, setChainColorLevels] = useState<Record<number, number>>({});
  const [savedChainColorLevelsJson, setSavedChainColorLevelsJson] = useState("");

  const [savedOrderedIds, setSavedOrderedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [chainBusy, setChainBusy] = useState(false);
  const [deleteBusyId, setDeleteBusyId] = useState<number | null>(null);
  const [localPoolDrafts, setLocalPoolDrafts] = useState<ReflexionLocalPoolDraft[]>([]);

  const [poolReturnedIds, setPoolReturnedIds] = useState<number[]>([]);

  const localPoolDraftsRef = useRef<ReflexionLocalPoolDraft[]>([]);

  const [refCategories, setRefCategories] = useState<RefCategorieRow[]>([]);

  const orderedIdsRef = useRef<number[]>([]);
  const orderedRowsRef = useRef<QuizzQuestionRow[]>([]);
  const poolRowsRef = useRef<QuizzQuestionRow[]>([]);
  const chainDirtyRef = useRef(false);

  useEffect(() => {
    localPoolDraftsRef.current = localPoolDrafts;
  }, [localPoolDrafts]);

  useEffect(() => {
    orderedIdsRef.current = ordered.map((q) => q.id);
  }, [ordered]);

  useEffect(() => {
    orderedRowsRef.current = ordered;
  }, [ordered]);

  useEffect(() => {
    const ordIds = new Set(ordered.map((q) => q.id));
    const draftRowsInPoolOnly = localPoolDrafts.filter((d) => !ordIds.has(d.id)).map((d) => d.row);
    poolRowsRef.current = [...pool, ...draftRowsInPoolOnly];
  }, [pool, localPoolDrafts, ordered]);

  const loadChainFor = useCallback(
    async (cid: number, groupeId: number | null) => {
      setPoolReturnedIds([]);
      const r = await fetchReflexionChain(cid, groupeId ?? undefined);
      const ids = r.ordered_questions.map((q) => q.id);
      const loadedColors = chainColorLevelsFromApi(r.chain_color_levels);
      setChainColorLevels(loadedColors);
      setSavedChainColorLevelsJson(serializeChainColorLevelsForDirty(loadedColors));
      setOrdered(r.ordered_questions);
      setPool(r.pool_questions);
      setSavedOrderedIds(ids);
      if (groupeId == null) {
        applySelectedGroupeId(r.groupe_id ?? null);
      } else if (r.groupe_id !== groupeId) {
        applySelectedGroupeId(r.groupe_id ?? null);
      }
      void fetchGroupeQuestions(cid).then(setGroupes).catch(() => {});
    },
    [applySelectedGroupeId, setGroupes],
  );

  const reloadGroupesOnly = useCallback(() => {
    if (collectionIdNum == null) return;
    fetchGroupeQuestions(collectionIdNum)
      .then(setGroupes)
      .catch(() => setOperationError("Impossible de recharger les suites logiques."));
  }, [collectionIdNum, setGroupes, setOperationError]);

  useEffect(() => {
    fetchRefCategories().then(setRefCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (collectionIdNum != null) return;
    setOrdered([]);
    setPool([]);
    setSavedOrderedIds([]);
    setChainColorLevels({});
    setSavedChainColorLevelsJson("");
    setLocalPoolDrafts([]);
    setPoolReturnedIds([]);
    resetReflexionLocalDraftIdCounter();
  }, [collectionIdNum]);

  useEffect(() => {
    if (collectionIdNum == null) return;
    setLocalPoolDrafts([]);
    setPoolReturnedIds([]);
    resetReflexionLocalDraftIdCounter();
  }, [collectionIdNum]);

  useEffect(() => {
    const ids = new Set(pool.map((q) => q.id));
    setPoolReturnedIds((prev) => prev.filter((id) => ids.has(id)));
  }, [pool]);

  const poolQuestions = useMemo(() => {
    const ordIds = new Set(ordered.map((q) => q.id));
    const draftRowsInPoolOnly = localPoolDrafts.filter((d) => !ordIds.has(d.id)).map((d) => d.row);
    const returnedFromSuite = pool.filter((q) => poolReturnedIds.includes(q.id));
    const merged = [...draftRowsInPoolOnly, ...returnedFromSuite];
    return filterQuestionsBySearch(merged, search);
  }, [pool, localPoolDrafts, ordered, poolReturnedIds, search]);

  const chainSaveBlockedByDrafts = useMemo(() => ordered.some((q) => q.id < 0), [ordered]);

  const llmPromptPoolStems = useMemo(() => {
    const seen = new Set<number>();
    const out: { question: string }[] = [];
    for (const row of [...ordered, ...pool, ...localPoolDrafts.map((d) => d.row)]) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      out.push({ question: row.question });
    }
    return out;
  }, [ordered, pool, localPoolDrafts]);

  const chainDirty = useMemo(() => {
    const cur = ordered.map((q) => q.id);
    const orderDirty =
      cur.length !== savedOrderedIds.length || cur.some((id, i) => id !== savedOrderedIds[i]);
    const colorDirty =
      serializeChainColorLevelsForDirty(chainColorLevels) !== savedChainColorLevelsJson;
    return orderDirty || colorDirty;
  }, [ordered, savedOrderedIds, chainColorLevels, savedChainColorLevelsJson]);

  useEffect(() => {
    chainDirtyRef.current = chainDirty;
  }, [chainDirty]);

  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (chainDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, []);

  const isOwner = collection != null && collection.user_id === userId;

  const categoryTypeForId = useCallback(
    (id: number | null, fallback: string): string => {
      if (id == null) return fallback;
      return refCategories.find((c) => c.id === id)?.type ?? fallback;
    },
    [refCategories],
  );

  const applyLocalChainIds = useCallback((nextIds: number[]) => {
    const { ordered: no, pool: np } = partitionRowsByOrderedIds(
      nextIds,
      orderedRowsRef.current,
      poolRowsRef.current,
    );
    setOrdered(no);
    setPool(np);
    setChainColorLevels((prev) => filterChainColorLevelsToOrderedIds(prev, nextIds));
  }, []);

  const ingestLlmImportLocally = useCallback(
    (payload: LlmImportPayload, categorieKey: QuestionCategorieKey) => {
      if (collectionIdNum == null || collection == null || collection.user_id !== userId) return;
      const categorieId =
        refCategorieIdForLlmKey(refCategories, categorieKey) ??
        refCategories.find((c) => c.type.trim().toLowerCase() === "histoire")?.id ??
        refCategories[0]?.id;
      if (categorieId == null) {
        setOperationError("Référentiel des catégories indisponible : réessaie dans un instant.");
        return;
      }
      const qs = payload.questions_sans_collection;
      if (qs.length === 0) return;
      const drafts = buildReflexionLocalPoolDraftsFromImport({
        questions: qs,
        userId,
        categorieKey,
        categorieId,
        collectionId: collectionIdNum,
        collectionNom: collection.nom ?? null,
      });
      setLocalPoolDrafts((prev) => [...prev, ...drafts]);
    },
    [collection, collectionIdNum, refCategories, userId, setOperationError],
  );

  const { saveChainDraft } = useQuestionReflexionChainSave({
    routing: { collectionIdNum },
    identity: { userId },
    refs: { selectedGroupeIdRef },
    state: { ordered, localPoolDrafts, chainColorLevels },
    setters: { setGroupes, setLocalPoolDrafts, setOperationError, setChainBusy },
    integrations: { applySelectedGroupeId, loadChainFor },
  });

  const { onDragEnd, moveOrdered } = useQuestionReflexionChainDrag({
    refs: { orderedIdsRef },
    applyLocalChainIds,
    setChainColorLevels,
    setPoolReturnedIds,
  });

  const dismissOperationError = useCallback(() => setOperationError(null), [setOperationError]);

  const onSelectGroupe = useCallback(
    (id: number) => {
      if (id === selectedGroupeId) return;
      void getConfirmLeave().then((ok) => {
        if (!ok) return;
        setLocalPoolDrafts([]);
        resetReflexionLocalDraftIdCounter();
        setPoolReturnedIds([]);
        applySelectedGroupeId(id);
        if (collectionIdNum != null) {
          void loadChainFor(collectionIdNum, id);
        }
      });
    },
    [collectionIdNum, getConfirmLeave, loadChainFor, selectedGroupeId, applySelectedGroupeId],
  );

  const navigateAwayToCollections = useCallback(() => {
    void getConfirmLeave().then((ok) => {
      if (!ok) return;
      routeNavigate("/collections");
    });
  }, [getConfirmLeave]);

  const removeQuestionFromChain = useCallback(
    async (id: number) => {
      if (id < 0) {
        if (!window.confirm("Retirer ce brouillon de l’éditeur ?")) {
          return;
        }
        setDeleteBusyId(id);
        setOperationError(null);
        try {
          setLocalPoolDrafts((prev) => prev.filter((d) => d.id !== id));
          const ids = orderedIdsRef.current;
          if (ids.includes(id)) {
            applyLocalChainIds(ids.filter((x) => x !== id));
          }
        } finally {
          setDeleteBusyId(null);
        }
        return;
      }
      if (!window.confirm("Supprimer définitivement cette question de la base ?")) {
        return;
      }
      setDeleteBusyId(id);
      setOperationError(null);
      try {
        await deleteQuestion(id);
        if (collectionIdNum != null) {
          await loadChainFor(collectionIdNum, selectedGroupeIdRef.current);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Suppression impossible.";
        setOperationError(msg);
      } finally {
        setDeleteBusyId(null);
      }
    },
    [applyLocalChainIds, collectionIdNum, loadChainFor, selectedGroupeIdRef, setOperationError],
  );

  chainFlush.current = loadChainFor;

  return {
    routing: { collectionIdNum },
    chainDirtyRef,
    reloadGroupesOnly,
    loadChainFor,
    saveChainDraft,
    refCategories,
    categoryTypeForId,
    localPoolDraftsRef,
    setCollection,
    setOrdered,
    setPool,
    setLocalPoolDrafts,
    dismissOperationError,
    chainBusy,
    ordered,
    pool,
    chainColorLevels,
    localPoolDrafts,
    bootstrap,
    loading: bootstrap.status.loading,
    loadError: bootstrap.status.loadError,
    isOwner,
    collectionNom: collection?.nom ?? null,
    orderedQuestions: ordered,
    poolQuestions,
    search,
    setSearch,
    groupes,
    selectedGroupeId,
    chainDirty,
    chainSaveBlockedByDrafts,
    deleteBusyId,
    onDragEnd,
    moveOrdered,
    llmPromptPoolStems,
    ingestLlmImportLocally,
    onSelectGroupe,
    navigateAwayToCollections,
    removeQuestionFromChain,
    reloadAll: bootstrap.loaders.reloadAll,
  };
}
