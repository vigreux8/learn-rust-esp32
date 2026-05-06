import { route } from "preact-router";
import type { DragEndEvent } from "@dnd-kit/dom";
import { isSortable } from "@dnd-kit/react/sortable";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  deleteGroupeQuestions,
  deleteQuestion,
  fetchCollection,
  fetchGroupeQuestions,
  fetchQuestionDetail,
  fetchRefCategories,
  fetchReflexionChain,
  patchGroupeQuestions,
  patchQuestion,
  patchReflexionChain,
  postCreateQuestion,
  postCreateGroupeQuestions,
} from "../../../lib/api";
import { useUserSession } from "../../../lib/userSession";
import type {
  CollectionUi,
  GroupeQuestionsUi,
  QuizzQuestionDetail,
  QuizzQuestionRow,
  RefCategorieRow,
} from "../../../types/quizz";
import type { QuestionCategorieKey } from "../../../lib/questionCategories";
import { filterQuestionsBySearch, normalizeCollectionIdParam } from "../SousCollectionsView/SousCollectionsView.metier";
import type { LlmImportPayload } from "../../molecules/QuestionsLlmImportPanel";
import {
  arrayMoveIds,
  buildReflexionLocalPoolDraftsFromImport,
  chainColorLevelsFromApi,
  chainColorLevelsRecordForApi,
  filterChainColorLevelsToOrderedIds,
  parseGroupeQuestionsPourFormulaire,
  parseReflexionColorTargetId,
  partitionRowsByOrderedIds,
  remapChainColorLevelsAfterDraftReplace,
  refCategorieIdForLlmKey,
  REFLEXION_DRAG_PALETTE_TYPE,
  REFLEXION_ORDERED_INSERT_PREFIX,
  REFLEXION_ORDERED_SORT_GROUP,
  resetReflexionLocalDraftIdCounter,
  serializeChainColorLevelsForDirty,
} from "./QuestionReflexionView.metier";
import type { QuestionReflexionViewProps, ReflexionLocalPoolDraft } from "./QuestionReflexionView.types";

type GroupeFormMode = "create" | "edit";

export function useQuestionReflexionViewState(props: QuestionReflexionViewProps) {
  const { userId } = useUserSession();
  const collectionIdNum = useMemo(() => normalizeCollectionIdParam(props.collectionId), [props.collectionId]);

  const [collection, setCollection] = useState<CollectionUi | null>(null);
  const [groupes, setGroupes] = useState<GroupeQuestionsUi[]>([]);
  const [selectedGroupeId, setSelectedGroupeId] = useState<number | null>(null);
  const [ordered, setOrdered] = useState<QuizzQuestionRow[]>([]);
  const [pool, setPool] = useState<QuizzQuestionRow[]>([]);
  /** Couleurs vignettes (indices 0..3), alignées sur `COLLECTION_TREE_LEVEL_BORDER_HEX`. */
  const [chainColorLevels, setChainColorLevels] = useState<Record<number, number>>({});
  const [savedChainColorLevelsJson, setSavedChainColorLevelsJson] = useState("");

  /** Dernière version enregistrée sur le serveur (pour détecter les changements locaux). */
  const [savedOrderedIds, setSavedOrderedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [chainBusy, setChainBusy] = useState(false);
  const [deleteBusyId, setDeleteBusyId] = useState<number | null>(null);
  /** Brouillons LLM uniquement navigateur (ids négatifs, pas de ligne `quizz_question`). */
  const [localPoolDrafts, setLocalPoolDrafts] = useState<ReflexionLocalPoolDraft[]>([]);

  /** Ids de questions « collection » affichées à gauche après les avoir retirées de la suite (drag vers le brouillon). */
  const [poolReturnedIds, setPoolReturnedIds] = useState<number[]>([]);

  const localPoolDraftsRef = useRef<ReflexionLocalPoolDraft[]>([]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [groupeFormMode, setGroupeFormMode] = useState<GroupeFormMode>("create");
  const [createNom, setCreateNom] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [deleteGroupeBusy, setDeleteGroupeBusy] = useState(false);

  const [refCategories, setRefCategories] = useState<RefCategorieRow[]>([]);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [editDetail, setEditDetail] = useState<QuizzQuestionDetail | null>(null);
  const [editDraftQuestion, setEditDraftQuestion] = useState("");
  const [editDraftCommentaire, setEditDraftCommentaire] = useState("");
  const [editDraftCategorieId, setEditDraftCategorieId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const orderedIdsRef = useRef<number[]>([]);
  const orderedRowsRef = useRef<QuizzQuestionRow[]>([]);
  const poolRowsRef = useRef<QuizzQuestionRow[]>([]);
  const selectedGroupeIdRef = useRef<number | null>(null);
  const chainDirtyRef = useRef(false);
  /** Promise en attente dans `confirmLeaveIfNeeded` tant que la modale « quitter sans enregistrer » est ouverte. */
  const pendingLeaveResolveRef = useRef<((value: boolean) => void) | null>(null);

  const [unsavedLeaveModalOpen, setUnsavedLeaveModalOpen] = useState(false);
  const [leaveDiscardBusy, setLeaveDiscardBusy] = useState(false);

  const applySelectedGroupeId = useCallback((id: number | null) => {
    selectedGroupeIdRef.current = id;
    setSelectedGroupeId(id);
  }, []);

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

  useEffect(() => {
    selectedGroupeIdRef.current = selectedGroupeId;
  }, [selectedGroupeId]);

  const loadChainFor = useCallback(async (cid: number, groupeId: number | null) => {
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
  }, [applySelectedGroupeId]);

  const reloadGroupesOnly = useCallback(() => {
    if (collectionIdNum == null) return;
    fetchGroupeQuestions(collectionIdNum)
      .then(setGroupes)
      .catch(() => setOperationError("Impossible de recharger les suites logiques."));
  }, [collectionIdNum]);

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
            : groupesList[0]?.id ?? null;
        applySelectedGroupeId(nextId);
        return loadChainFor(collectionIdNum, nextId);
      })
      .catch(() => setLoadError("fetch"))
      .finally(() => setLoading(false));
  }, [collectionIdNum, loadChainFor, applySelectedGroupeId]);

  useEffect(() => {
    fetchRefCategories().then(setRefCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (collectionIdNum == null) {
      setLoading(false);
      setLoadError("invalid");
      setCollection(null);
      setGroupes([]);
      applySelectedGroupeId(null);
      setOrdered([]);
      setPool([]);
      setSavedOrderedIds([]);
      setChainColorLevels({});
      setSavedChainColorLevelsJson("");
      setLocalPoolDrafts([]);
      setPoolReturnedIds([]);
      resetReflexionLocalDraftIdCounter();
      return;
    }
    reloadAll();
  }, [collectionIdNum, reloadAll, applySelectedGroupeId]);

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

  const selectedGroupe = useMemo(() => {
    if (selectedGroupeId == null) return null;
    return groupes.find((g) => g.id === selectedGroupeId) ?? null;
  }, [groupes, selectedGroupeId]);

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
    [collection, collectionIdNum, refCategories, userId],
  );

  const saveChainDraft = useCallback(async (): Promise<boolean> => {
    if (collectionIdNum == null) return true;
    if (ordered.length === 0) {
      setOperationError("La suite ordonnée est vide : rien à enregistrer.");
      return true;
    }

    let gid = selectedGroupeIdRef.current;
    /** Rempli après matérialisation des brouillons ; utilisé pour le retry « groupe stale ». */
    let finalOrderedIds: number[] = [];
    let remappedLevels: Record<number, number> = chainColorLevels;

    setChainBusy(true);
    setOperationError(null);
    try {
      const idReplace = new Map<number, number>();
      let nextDrafts = localPoolDrafts;

      for (const q of ordered) {
        if (q.id >= 0) continue;
        const draft = nextDrafts.find((d) => d.id === q.id);
        if (draft == null) {
          throw new Error(
            `Brouillon introuvable (id ${q.id}). Ré-importe depuis LLM ou retire cette carte de la suite.`,
          );
        }
        const reps = draft.payload.reponses.map((r) => ({
          texte: r.texte.trim(),
          correcte: r.correcte,
        }));
        const created = await postCreateQuestion({
          user_id: userId,
          categorie_id: draft.categorie_id,
          question: draft.payload.question.trim(),
          commentaire: (draft.payload.commentaire ?? "").trim(),
          reponses: reps,
          collection_id: collectionIdNum,
        });
        idReplace.set(q.id, created.id);
        nextDrafts = nextDrafts.filter((d) => d.id !== q.id);
      }

      finalOrderedIds = ordered.map((q) => {
        if (q.id > 0) return q.id;
        const nid = idReplace.get(q.id);
        if (nid == null || nid <= 0) {
          throw new Error("Erreur après création : identifiant de question invalide.");
        }
        return nid;
      });

      remappedLevels =
        idReplace.size > 0
          ? remapChainColorLevelsAfterDraftReplace(chainColorLevels, idReplace)
          : chainColorLevels;

      if (idReplace.size > 0) {
        setLocalPoolDrafts(nextDrafts);
      }

      await patchReflexionChain(collectionIdNum, {
        user_id: userId,
        ordered_question_ids: finalOrderedIds,
        groupe_questions_id: gid ?? undefined,
        chain_color_levels: chainColorLevelsRecordForApi(remappedLevels),
      });
      await loadChainFor(collectionIdNum, gid);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Enregistrement de la suite impossible.";
      const staleGroupe =
        msg.includes("groupe_questions") &&
        (msg.includes("introuvable") || msg.includes("not found") || msg.includes("400"));
      if (staleGroupe && finalOrderedIds.length > 0) {
        try {
          const groupesFresh = await fetchGroupeQuestions(collectionIdNum);
          setGroupes(groupesFresh);
          const validId = gid != null && groupesFresh.some((g) => g.id === gid) ? gid : (groupesFresh[0]?.id ?? null);
          applySelectedGroupeId(validId);
          gid = validId;
          await patchReflexionChain(collectionIdNum, {
            user_id: userId,
            ordered_question_ids: finalOrderedIds,
            groupe_questions_id: gid ?? undefined,
            chain_color_levels: chainColorLevelsRecordForApi(remappedLevels),
          });
          await loadChainFor(collectionIdNum, gid);
          return true;
        } catch (retryError: unknown) {
          const retryMsg =
            retryError instanceof Error ? retryError.message : "Enregistrement de la suite impossible.";
          setOperationError(retryMsg);
          return false;
        }
      }
      setOperationError(msg);
      return false;
    } finally {
      setChainBusy(false);
    }
  }, [
    collectionIdNum,
    userId,
    loadChainFor,
    chainColorLevels,
    ordered,
    localPoolDrafts,
    applySelectedGroupeId,
  ]);

  const resolveLeavePrompt = useCallback((proceed: boolean) => {
    setUnsavedLeaveModalOpen(false);
    const resolve = pendingLeaveResolveRef.current;
    pendingLeaveResolveRef.current = null;
    resolve?.(proceed);
  }, []);

  const confirmLeaveIfNeeded = useCallback((): Promise<boolean> => {
    if (!chainDirtyRef.current) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      pendingLeaveResolveRef.current = resolve;
      setUnsavedLeaveModalOpen(true);
    });
  }, []);

  const onUnsavedLeaveCancel = useCallback(() => {
    resolveLeavePrompt(false);
  }, [resolveLeavePrompt]);

  const onUnsavedLeaveSave = useCallback(async () => {
    const ok = await saveChainDraft();
    if (ok) resolveLeavePrompt(true);
  }, [saveChainDraft, resolveLeavePrompt]);

  const onUnsavedLeaveDiscard = useCallback(async () => {
    setLeaveDiscardBusy(true);
    try {
      if (collectionIdNum != null) {
        await loadChainFor(collectionIdNum, selectedGroupeIdRef.current);
      }
      resolveLeavePrompt(true);
    } finally {
      setLeaveDiscardBusy(false);
    }
  }, [collectionIdNum, loadChainFor, resolveLeavePrompt]);

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

      const paletteRaw = sourceEntity.data as { type?: string; level?: number | null } | undefined;
      if (paletteRaw?.type === REFLEXION_DRAG_PALETTE_TYPE) {
        const tid = targetEntity?.id != null ? String(targetEntity.id) : "";
        const qid = parseReflexionColorTargetId(tid);
        if (qid == null || !orderedIdsRef.current.includes(qid)) {
          return;
        }
        const lvl = paletteRaw.level;
        setChainColorLevels((prev) => {
          const next = { ...prev };
          if (lvl === null || lvl === undefined) {
            delete next[qid];
          } else {
            next[qid] = lvl;
          }
          return next;
        });
        return;
      }

      const raw = sourceEntity.data as { from?: string; questionId?: number } | undefined;
      const questionId = raw?.questionId;
      const targetId = targetEntity?.id != null ? String(targetEntity.id) : "";
      const cur = orderedIdsRef.current;

      if (targetId.startsWith(REFLEXION_ORDERED_INSERT_PREFIX)) {
        if (questionId == null || !Number.isInteger(questionId)) {
          return;
        }
        if (raw?.from !== "pool" && raw?.from !== "ordered") {
          return;
        }
        const g = Number(targetId.slice(REFLEXION_ORDERED_INSERT_PREFIX.length));
        if (!Number.isInteger(g) || g < 0) {
          return;
        }
        if (raw.from === "pool") {
          if (cur.includes(questionId)) return;
          const insertAt = Math.min(g, cur.length);
          applyLocalChainIds([...cur.slice(0, insertAt), questionId, ...cur.slice(insertAt)]);
          return;
        }
        if (raw.from === "ordered") {
          const from = cur.indexOf(questionId);
          if (from === -1) return;
          const n = cur.length;
          if (n === 0) return;
          const dest = Math.min(g, n - 1);
          if (from === dest) return;
          applyLocalChainIds(arrayMoveIds(cur, from, dest));
          return;
        }
      }

      if (isSortable(sourceEntity)) {
        const s = sourceEntity.sortable;
        if (s.group === REFLEXION_ORDERED_SORT_GROUP && s.initialIndex !== s.index) {
          const copy = [...orderedIdsRef.current];
          applyLocalChainIds(arrayMoveIds(copy, s.initialIndex, s.index));
          return;
        }
      }

      if (raw?.from !== "pool" && raw?.from !== "ordered") {
        return;
      }
      if (questionId == null || !Number.isInteger(questionId)) {
        return;
      }

      if (raw.from === "pool" && targetEntity != null && isSortable(targetEntity)) {
        const t = targetEntity.sortable;
        if (t.group === REFLEXION_ORDERED_SORT_GROUP) {
          if (cur.includes(questionId)) return;
          const insertAt = Math.min(Math.max(0, t.index), cur.length);
          applyLocalChainIds([...cur.slice(0, insertAt), questionId, ...cur.slice(insertAt)]);
          return;
        }
      }

      if (raw.from === "pool" && targetId === "drop-ordered") {
        if (cur.includes(questionId)) return;
        applyLocalChainIds([...cur, questionId]);
        return;
      }

      if (raw.from === "ordered" && targetId === "drop-pool") {
        applyLocalChainIds(cur.filter((id) => id !== questionId));
        if (questionId >= 0) {
          setPoolReturnedIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
        }
      }
    },
    [applyLocalChainIds],
  );

  const moveOrdered = useCallback(
    (index: number, delta: -1 | 1) => {
      const cur = [...orderedIdsRef.current];
      const j = index + delta;
      if (j < 0 || j >= cur.length) return;
      const t = cur[index]!;
      cur[index] = cur[j]!;
      cur[j] = t;
      applyLocalChainIds(cur);
    },
    [applyLocalChainIds],
  );

  const dismissOperationError = useCallback(() => setOperationError(null), []);

  const onSelectGroupe = useCallback(
    (id: number) => {
      if (id === selectedGroupeId) return;
      void confirmLeaveIfNeeded().then((ok) => {
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
    [collectionIdNum, loadChainFor, confirmLeaveIfNeeded, selectedGroupeId],
  );

  const navigateAwayToCollections = useCallback(() => {
    void confirmLeaveIfNeeded().then((ok) => {
      if (!ok) return;
      route("/collections");
    });
  }, [confirmLeaveIfNeeded]);

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
    userId,
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
  }, [collection, collectionIdNum, selectedGroupeId, userId, reloadAll]);

  const closeQuestionModal = useCallback(() => {
    setQuestionModalOpen(false);
    setEditModalLoading(false);
    setEditModalError(null);
    setEditDetail(null);
  }, []);

  const openEditModal = useCallback((q: QuizzQuestionRow) => {
    if (q.id < 0) {
      const localDraft = localPoolDraftsRef.current.find((d) => d.id === q.id) ?? null;
      const draftReponses = (localDraft?.payload.reponses ?? []).map((r, idx) => ({
        id: q.id * 100 - idx - 1,
        reponse: r.texte,
        bonne_reponse: r.correcte,
      }));
      setQuestionModalOpen(true);
      setEditModalLoading(false);
      setEditModalError(null);
      setEditDetail({
        ...q,
        reponses: draftReponses,
        implicit_relations: [],
      });
      setEditDraftQuestion(q.question);
      setEditDraftCommentaire(q.commentaire);
      setEditDraftCategorieId(q.categorie_id);
      return;
    }
    setQuestionModalOpen(true);
    setEditModalLoading(true);
    setEditModalError(null);
    setEditDetail(null);
    void fetchQuestionDetail(q.id)
      .then((d) => {
        setEditDetail(d);
        setEditDraftQuestion(d.question);
        setEditDraftCommentaire(d.commentaire);
        setEditDraftCategorieId(d.categorie_id);
      })
      .catch(() => setEditModalError("fetch"))
      .finally(() => setEditModalLoading(false));
  }, []);

  const refreshEditDetail = useCallback(async () => {
    if (editDetail == null) return;
    if (editDetail.id < 0) return;
    try {
      const d = await fetchQuestionDetail(editDetail.id);
      setEditDetail(d);
    } catch {
      /* ignore */
    }
  }, [editDetail]);

  const saveEditModal = useCallback(async () => {
    if (editDetail == null) return;
    setSaving(true);
    try {
      const payload: { question?: string; commentaire?: string; categorie_id?: number } = {};
      if (editDraftQuestion !== editDetail.question) payload.question = editDraftQuestion;
      if (editDraftCommentaire !== editDetail.commentaire) payload.commentaire = editDraftCommentaire;
      if (editDraftCategorieId != null && editDraftCategorieId !== editDetail.categorie_id) {
        payload.categorie_id = editDraftCategorieId;
      }
      if (Object.keys(payload).length === 0) {
        closeQuestionModal();
        return;
      }
      if (editDetail.id < 0) {
        const nextCategorieId = editDraftCategorieId ?? editDetail.categorie_id;
        const nextCategorieType = categoryTypeForId(nextCategorieId, editDetail.categorie_type);
        const nextReponses = editDetail.reponses.map((r) => ({
          texte: r.reponse,
          correcte: r.bonne_reponse,
        })) as ReflexionLocalPoolDraft["payload"]["reponses"];
        setOrdered((rows) =>
          rows.map((q) =>
            q.id === editDetail.id
              ? {
                  ...q,
                  question: editDraftQuestion,
                  commentaire: editDraftCommentaire,
                  categorie_id: nextCategorieId,
                  categorie_type: nextCategorieType,
                }
              : q,
          ),
        );
        setPool((rows) =>
          rows.map((q) =>
            q.id === editDetail.id
              ? {
                  ...q,
                  question: editDraftQuestion,
                  commentaire: editDraftCommentaire,
                  categorie_id: nextCategorieId,
                  categorie_type: nextCategorieType,
                }
              : q,
          ),
        );
        setLocalPoolDrafts((prev) =>
          prev.map((d) =>
            d.id === editDetail.id
              ? {
                  ...d,
                  categorie_id: nextCategorieId,
                  payload: {
                    ...d.payload,
                    question: editDraftQuestion,
                    commentaire: editDraftCommentaire,
                    reponses: nextReponses,
                  },
                  row: {
                    ...d.row,
                    question: editDraftQuestion,
                    commentaire: editDraftCommentaire,
                    categorie_id: nextCategorieId,
                    categorie_type: nextCategorieType,
                  },
                }
              : d,
          ),
        );
        closeQuestionModal();
        return;
      }
      await patchQuestion(editDetail.id, payload);
      if (collectionIdNum != null) {
        if (!chainDirtyRef.current) {
          await loadChainFor(collectionIdNum, selectedGroupeIdRef.current);
        } else {
          setOrdered((rows) =>
            rows.map((q) =>
              q.id === editDetail.id
                ? {
                    ...q,
                    question: editDraftQuestion,
                    commentaire: editDraftCommentaire,
                    categorie_id: editDraftCategorieId ?? q.categorie_id,
                  }
                : q,
            ),
          );
          setPool((rows) =>
            rows.map((q) =>
              q.id === editDetail.id
                ? {
                    ...q,
                    question: editDraftQuestion,
                    commentaire: editDraftCommentaire,
                    categorie_id: editDraftCategorieId ?? q.categorie_id,
                  }
                : q,
            ),
          );
        }
        void fetchCollection(collectionIdNum).then(setCollection).catch(() => {});
      }
      closeQuestionModal();
    } catch {
      setOperationError("Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }, [
    categoryTypeForId,
    closeQuestionModal,
    editDetail,
    editDraftCategorieId,
    editDraftCommentaire,
    editDraftQuestion,
    loadChainFor,
    collectionIdNum,
  ]);

  const saveLocalDraftReponse = useCallback((reponseId: number, reponseTexte: string) => {
    if (editDetail == null || editDetail.id >= 0) return;
    const nextText = reponseTexte.trim();
    setEditDetail((cur) => {
      if (cur == null || cur.id !== editDetail.id) return cur;
      return {
        ...cur,
        reponses: cur.reponses.map((r) => (r.id === reponseId ? { ...r, reponse: nextText } : r)),
      };
    });
    setLocalPoolDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== editDetail.id) return d;
        const nextPayloadReponses = d.payload.reponses.map((r, idx) => {
          const expectedId = editDetail.id * 100 - idx - 1;
          return expectedId === reponseId ? { ...r, texte: nextText } : r;
        }) as ReflexionLocalPoolDraft["payload"]["reponses"];
        return {
          ...d,
          payload: {
            ...d.payload,
            reponses: nextPayloadReponses,
          },
        };
      }),
    );
  }, [editDetail]);

  const removeQuestion = useCallback(
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
        if (editDetail?.id === id) closeQuestionModal();
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
    [applyLocalChainIds, closeQuestionModal, editDetail?.id, loadChainFor, collectionIdNum],
  );

  return {
    routing: { collectionIdNum },
    status: {
      loading,
      loadError,
      operationError,
      dismissOperationError,
      isOwner,
      chainBusy,
      chainDirty,
      chainSaveBlockedByDrafts,
      deleteBusyId,
    },
    data: {
      collectionNom: collection?.nom ?? null,
      orderedQuestions: ordered,
      chainColorLevels,
      poolQuestions,
      search,
      refCategories,
      groupes,
      selectedGroupeId,
    },
    liste: {
      onSelectGroupe,
      createModalOpen,
      groupeFormMode,
      createNom,
      createDescription,
      createBusy,
      deleteBusy: deleteGroupeBusy,
      canDeleteSelected: isOwner && selectedGroupeId != null,
      canEditSelected: isOwner && selectedGroupeId != null,
      onOpenCreate: onOpenCreateGroupe,
      onOpenEdit: onOpenEditGroupe,
      onCloseCreate: onCloseGroupeModal,
      onChangeCreateNom: setCreateNom,
      onChangeCreateDescription: setCreateDescription,
      onSubmitCreate: onSubmitGroupe,
      onDeleteSelected: onDeleteGroupe,
    },
    filtres: {
      onSearchChange: setSearch,
    },
    dragDrop: {
      onDragEnd,
    },
    chain: {
      onMoveOrdered: moveOrdered,
    },
    actions: {
      reload: reloadAll,
      openEditModal,
      removeQuestion,
      saveChainDraft,
      confirmLeaveIfNeeded,
      navigateAwayToCollections,
    },
    unsavedLeaveModal: {
      open: unsavedLeaveModalOpen,
      saveBusy: chainBusy,
      discardBusy: leaveDiscardBusy,
      onCancel: onUnsavedLeaveCancel,
      onSave: onUnsavedLeaveSave,
      onDiscard: onUnsavedLeaveDiscard,
    },
    llmImport:
      isOwner && collectionIdNum != null
        ? {
            data: {
              collectionId: collectionIdNum,
              collectionNom: collection?.nom ?? null,
              poolQuestions: llmPromptPoolStems,
              disabled: chainBusy,
            },
            actions: {
              onImportLocalPayload: ingestLlmImportLocally,
            },
          }
        : undefined,
    editModal: {
      settings: {
        open: questionModalOpen,
        onClose: closeQuestionModal,
        variant: "edit" as const,
      },
      actions: {
        onSave: () => void saveEditModal(),
        onDraftQuestion: setEditDraftQuestion,
        onDraftCommentaire: setEditDraftCommentaire,
        onDraftCategorieId: setEditDraftCategorieId,
        onReponseUpdated: () => void refreshEditDetail(),
        onLocalDraftReponseSave: saveLocalDraftReponse,
      },
      data: {
        questionDetail: editDetail,
        categorieOptions: refCategories,
      },
      drafts: {
        question: editDraftQuestion,
        commentaire: editDraftCommentaire,
        categorieId: editDraftCategorieId,
      },
      status: {
        loading: editModalLoading,
        saving,
        error: editModalError,
      },
    },
  };
}
