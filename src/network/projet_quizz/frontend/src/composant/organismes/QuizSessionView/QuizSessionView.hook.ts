import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { route } from "preact-router";
import {
  fetchCollection,
  fetchQuestionDetail,
  deleteQuestion,
  fetchRandomQuiz,
  fetchRefCategories,
  fetchRefCategoriesHierarchy,
  fetchRefQuestionDifficulte,
  fetchRefQuestionImportance,
  fetchSousCollections,
  deleteImplicitQuestionRelation,
  patchQuestion,
  postAttachQuestionToSousCollection,
  postCreateQuestion,
  postQuizKpi,
  type HttpError,
} from "../../../lib/api";
import {
  playFetchParamsFromSearch,
  playOrdersRequireUserId,
  shuffleQuestions,
} from "../../../lib/playOrder";
import { saveLastQuizResult } from "../../../lib/lastQuizResult";
import { useRoutePath } from "../../../lib/routePathContext";
import { useUserSession } from "../../../lib/userSession";
import {
  formatSessionDraftCategorieResume,
  getSupportedQuestionCategories,
  isQuestionCategorieKey,
  type QuestionCategorieKey,
} from "../../../lib/questionCategories";
import type {
  QuestionUi,
  QuizzQuestionDetail,
  RefCategorieHierarchyRow,
  RefCategorieRow,
  RefQuestionScaleRow,
} from "../../../types/quizz";
import type { QuestionCreateSavePayload } from "../QuestionEditModal/QuestionEditModal";
import {
  buildQuestionCopyJson,
  isPickedCorrect,
  mergeQuizSessionQuestionFromRow,
  shuffleQuestionsAnswers,
  sortRefDifficulteForQuizSession,
  sortRefImportanceForQuizSession,
} from "./QuizSessionView.metier";
import type { QuizSessionViewProps, SessionData } from "./QuizSessionView.types";

function ensureQuestionQuizUiFields(q: QuestionUi): QuestionUi {
  return {
    ...q,
    categorie_e_id: q.categorie_e_id ?? null,
    categorie_e_type: q.categorie_e_type ?? null,
    importance_id: q.importance_id ?? null,
    importance_lvl: q.importance_lvl ?? null,
    difficulter_id: q.difficulter_id ?? null,
    difficulter_lvl: q.difficulter_lvl ?? null,
  };
}

function mapQuestionsCategories(questions: QuestionUi[]): QuestionUi[] {
  return questions.map(ensureQuestionQuizUiFields);
}

export function useQuizSessionView(props: QuizSessionViewProps) {
  const { collectionId } = props;
  const { userId } = useUserSession();
  const routePath = useRoutePath();
  const questionStartedAtMs = useRef(0);
  const allServedQuestionIdsRef = useRef<number[]>([]);
  const playedTowardResultsRef = useRef(0);

  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [pickedId, setPickedId] = useState<number | null>(null);
  const [good, setGood] = useState(0);

  const [refCategories, setRefCategories] = useState<RefCategorieRow[]>([]);
  const [refCategoriesHierarchy, setRefCategoriesHierarchy] = useState<RefCategorieHierarchyRow[]>(
    [],
  );
  const [draftCategoriePid, setDraftCategoriePid] = useState<number | null>(null);
  const [draftCategorieEid, setDraftCategorieEid] = useState<number | null>(null);
  const [refImportanceQuestion, setRefImportanceQuestion] = useState<RefQuestionScaleRow[]>([]);
  const [refDifficulteQuestion, setRefDifficulteQuestion] = useState<RefQuestionScaleRow[]>([]);
  const [draftImportanceId, setDraftImportanceId] = useState<number | null>(null);
  const [draftDifficulteId, setDraftDifficulteId] = useState<number | null>(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionModalVariant, setQuestionModalVariant] = useState<"edit" | "create">("edit");
  const [createParentQuestionId, setCreateParentQuestionId] = useState<number | null>(null);
  const [questionModalLoading, setQuestionModalLoading] = useState(false);
  const [questionModalError, setQuestionModalError] = useState<string | null>(null);
  const [questionModalDetail, setQuestionModalDetail] = useState<QuizzQuestionDetail | null>(null);
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftCommentaire, setDraftCommentaire] = useState("");
  const [draftCategorieId, setDraftCategorieId] = useState<number | null>(null);
  const [questionModalSaving, setQuestionModalSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [draftVerifier, setDraftVerifier] = useState(false);
  const [nextBusy, setNextBusy] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [sousCollectionsForCreateModal, setSousCollectionsForCreateModal] = useState<{ id: number; nom: string }[]>([]);
  const [draftSousCollectionId, setDraftSousCollectionId] = useState<number | null>(null);
  const [draftCreateLinkImplicit, setDraftCreateLinkImplicit] = useState(true);

  useEffect(() => {
    void fetchRefCategories()
      .then(setRefCategories)
      .catch(() => setRefCategories([]));
    void fetchRefCategoriesHierarchy()
      .then(setRefCategoriesHierarchy)
      .catch(() => setRefCategoriesHierarchy([]));
    void fetchRefQuestionImportance()
      .then((rows) => setRefImportanceQuestion(sortRefImportanceForQuizSession(rows)))
      .catch(() => setRefImportanceQuestion([]));
    void fetchRefQuestionDifficulte()
      .then((rows) => setRefDifficulteQuestion(sortRefDifficulteForQuizSession(rows)))
      .catch(() => setRefDifficulteQuestion([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setData(null);
    allServedQuestionIdsRef.current = [];
    playedTowardResultsRef.current = 0;

    (async () => {
      try {
        const pf = playFetchParamsFromSearch();
        const qtype = pf.qtype;
        const orders = pf.orders;
        const playUserId = pf.userId ?? (playOrdersRequireUserId(orders) ? userId : undefined);

        if (collectionId === "random") {
          const fetchedQuestions = await fetchRandomQuiz(
            pf.useServerPlayModes
              ? {
                  orders: pf.orders,
                  qtype: pf.qtype,
                  userId: playUserId,
                  infinite: pf.infinite,
                  excludeIds: pf.excludeIds,
                }
              : { qtype: pf.qtype },
          );
          const questions = mapQuestionsCategories(shuffleQuestionsAnswers(fetchedQuestions));
          if (cancelled) return;
          if (questions.length === 0) {
            setLoadError("empty");
            return;
          }
          if (pf.infinite) allServedQuestionIdsRef.current = questions.map((q) => q.id);
          setData({
            mode: "random",
            collectionId: null,
            nom: "Mélange aléatoire",
            questions,
            playOrders: orders,
            playQtype: qtype,
            playInfinite: pf.infinite,
            playUserId,
            useServerPlayModes: pf.useServerPlayModes,
          });
          setIndex(0);
          setPickedId(null);
          setGood(0);
          return;
        }

        const cid = Number(collectionId);
        if (!Number.isFinite(cid)) {
          setLoadError("bad");
          return;
        }
        const col = await fetchCollection(
          cid,
          pf.useServerPlayModes
            ? {
                qtype: pf.qtype,
                orders: pf.orders,
                userId: playUserId,
                infinite: pf.infinite,
                excludeIds: pf.excludeIds,
                sousCollectionId: pf.sousCollectionId,
              }
            : { qtype: pf.qtype, sousCollectionId: pf.sousCollectionId },
        );
        if (cancelled) return;
        if (col.questions.length === 0) {
          setLoadError("empty");
          return;
        }
        let questions = mapQuestionsCategories(shuffleQuestionsAnswers(col.questions));
        if (!pf.useServerPlayModes && orders.length === 1 && orders[0] === "random") {
          questions = shuffleQuestions(questions);
        }
        if (pf.infinite) allServedQuestionIdsRef.current = questions.map((q) => q.id);

        setData({
          mode: "collection",
          collectionId: cid,
          nom: col.nom,
          questions,
          playOrders: orders,
          playQtype: qtype,
          playInfinite: pf.infinite,
          playUserId,
          playSousCollectionId: pf.sousCollectionId,
          useServerPlayModes: pf.useServerPlayModes,
        });
        setIndex(0);
        setPickedId(null);
        setGood(0);
      } catch (e) {
        if (!cancelled) {
          const status =
            typeof e === "object" && e !== null && "status" in e ? (e as HttpError).status : undefined;
          if (status === 404) setLoadError("empty");
          else setLoadError("fetch");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [collectionId, routePath, userId]);

  useLayoutEffect(() => {
    if (data == null) return;
    questionStartedAtMs.current = performance.now();
  }, [data, index]);

  useEffect(() => {
    setQuestionModalOpen(false);
  }, [index]);

  useEffect(() => {
    if (data == null) return;
    const cur = data.questions[index];
    if (!cur) return;
    setDraftVerifier(cur.verifier);
    setDraftCategoriePid(cur.categorie_id);
    setDraftCategorieEid(cur.categorie_e_id ?? null);
    setDraftImportanceId(cur.importance_id ?? null);
    setDraftDifficulteId(cur.difficulter_id ?? null);
  }, [data, index]);

  useEffect(() => {
    if (actionMessage == null) return;
    const t = window.setTimeout(() => setActionMessage(null), 3200);
    return () => clearTimeout(t);
  }, [actionMessage]);

  const closeQuestionModal = () => {
    setQuestionModalOpen(false);
    setQuestionModalLoading(false);
    setQuestionModalError(null);
    setQuestionModalDetail(null);
    setCreateParentQuestionId(null);
    setSousCollectionsForCreateModal([]);
    setDraftSousCollectionId(null);
    setDraftCreateLinkImplicit(true);
  };

  const openEditQuestionModal = (current: QuestionUi) => {
    setSousCollectionsForCreateModal([]);
    setDraftSousCollectionId(null);
    setQuestionModalVariant("edit");
    setQuestionModalOpen(true);
    setQuestionModalLoading(true);
    setQuestionModalError(null);
    setQuestionModalDetail(null);
    void fetchQuestionDetail(current.id)
      .then((d) => {
        setQuestionModalDetail(d);
        setDraftQuestion(d.question);
        setDraftCommentaire(d.commentaire);
        setDraftCategorieId(d.categorie_id);
      })
      .catch(() => setQuestionModalError("fetch"))
      .finally(() => setQuestionModalLoading(false));
  };

  const openCreateLinkedQuestionModal = (parent: QuestionUi) => {
    if (refCategories.length === 0) {
      setActionMessage("Catégories indisponibles : impossible de créer une question pour l’instant.");
      return;
    }
    setDraftCreateLinkImplicit(true);
    setSousCollectionsForCreateModal([]);
    setDraftSousCollectionId(null);
    setQuestionModalVariant("create");
    setCreateParentQuestionId(parent.id);
    setQuestionModalOpen(true);
    setQuestionModalLoading(false);
    setQuestionModalError(null);
    setQuestionModalDetail(null);
    setDraftQuestion("");
    setDraftCommentaire("");
    const cat = refCategories.some((c) => c.id === parent.categorie_id)
      ? parent.categorie_id
      : refCategories[0]!.id;
    setDraftCategorieId(cat);
    const session = data;
    if (session?.mode === "collection" && session.collectionId != null) {
      void fetchSousCollections(session.collectionId).then((rows) => {
        setSousCollectionsForCreateModal(rows.map((r) => ({ id: r.id, nom: r.nom })));
        const playSous = session.playSousCollectionId;
        const defId = playSous != null && rows.some((r) => r.id === playSous) ? playSous : null;
        setDraftSousCollectionId(defId);
      });
    }
  };

  const refreshQuestionModalDetail = async () => {
    if (questionModalDetail == null) return;
    try {
      const d = await fetchQuestionDetail(questionModalDetail.id);
      setQuestionModalDetail(d);
    } catch {
      /* garder l’affichage actuel */
    }
  };

  const removeImplicitRelationFromQuestionModal = async (relationId: number) => {
    try {
      await deleteImplicitQuestionRelation(relationId);
      await refreshQuestionModalDetail();
      setActionMessage("Lien implicite retiré.");
    } catch {
      setActionMessage("Suppression du lien impossible.");
    }
  };

  const saveEditQuestionModal = async () => {
    if (questionModalDetail == null) return;
    setQuestionModalSaving(true);
    try {
      const payload: { question?: string; commentaire?: string; categorie_id?: number } = {};
      if (draftQuestion !== questionModalDetail.question) payload.question = draftQuestion;
      if (draftCommentaire !== questionModalDetail.commentaire) payload.commentaire = draftCommentaire;
      if (draftCategorieId != null && draftCategorieId !== questionModalDetail.categorie_id) {
        payload.categorie_id = draftCategorieId;
      }
      if (Object.keys(payload).length === 0) {
        closeQuestionModal();
        return;
      }
      const updated = await patchQuestion(questionModalDetail.id, payload);
      setData((prev) => {
        if (!prev) return prev;
        const qi = prev.questions.findIndex((x) => x.id === updated.id);
        if (qi < 0) return prev;
        const questions = [...prev.questions];
        const cur = questions[qi];
        if (!cur) return prev;
        questions[qi] = mergeQuizSessionQuestionFromRow(cur, updated);
        return { ...prev, questions };
      });
      setActionMessage("Question mise à jour.");
      closeQuestionModal();
    } catch {
      setActionMessage("Enregistrement impossible.");
    } finally {
      setQuestionModalSaving(false);
    }
  };

  const saveCreateQuestionModal = async (payload: QuestionCreateSavePayload) => {
    if (createParentQuestionId == null) return;
    setQuestionModalSaving(true);
    try {
      const withImplicitParentLink = payload.link_implicit_relation !== false;
      const created = await postCreateQuestion({
        user_id: userId,
        categorie_id: payload.categorie_id,
        question: payload.question,
        commentaire: payload.commentaire,
        reponses: payload.reponses,
        ...(withImplicitParentLink ? { parent_question_id: createParentQuestionId } : {}),
        collection_id: data?.collectionId ?? undefined,
      });
      if (payload.sous_collection_id != null) {
        await postAttachQuestionToSousCollection(payload.sous_collection_id, {
          user_id: userId,
          question_id: created.id,
        });
      }
      const sousPart = payload.sous_collection_id != null;
      let msg: string;
      if (withImplicitParentLink) {
        msg = sousPart
          ? "Question créée, liée au parent (relation implicite) et à la sous-collection choisie."
          : "Question créée et liée à la question affichée via la relation implicite.";
      } else {
        msg = sousPart
          ? "Question créée sans lien implicite avec la parente ; rattachement à la sous-collection effectué."
          : "Question créée sans ajout de lien implicite avec la question parente.";
      }
      setActionMessage(msg);
      closeQuestionModal();
    } catch {
      throw new Error("create failed");
    } finally {
      setQuestionModalSaving(false);
    }
  };

  const copyCurrentQuestionJson = async (current: QuestionUi) => {
    const text = buildQuestionCopyJson(current);
    try {
      await navigator.clipboard.writeText(text);
      setActionMessage("JSON copié dans le presse-papiers.");
    } catch {
      setActionMessage("Copie impossible (permissions du navigateur).");
    }
  };

  const handlePick = (reponseId: number) => {
    if (data == null || pickedId != null) return;
    const q = data.questions[index];
    if (q == null) return;
    const dureeSecondes = (performance.now() - questionStartedAtMs.current) / 1000;
    void postQuizKpi({
      userId,
      questionId: q.id,
      reponseId,
      dureeSecondes,
    }).catch(() => {
      /* KPI optionnel : ne pas bloquer le jeu */
    });
    setPickedId(reponseId);
  };

  const resolveDraftParentKey = (): QuestionCategorieKey | null => {
    if (draftCategoriePid == null) return null;
    const h = refCategoriesHierarchy.find((row) => row.id === draftCategoriePid);
    if (h?.type && isQuestionCategorieKey(h.type)) return h.type;
    const f = refCategories.find((row) => row.id === draftCategoriePid);
    if (f?.type && isQuestionCategorieKey(f.type)) return f.type;
    return null;
  };

  const handleParentCategory = (parentKey: QuestionCategorieKey) => {
    if (data == null || nextBusy || fetchingMore || deleteBusy) return;

    const fromHierarchy = refCategoriesHierarchy.find((row) => row.type === parentKey);
    const fromFlat = refCategories.find((row) => row.type === parentKey);
    const parentId = fromHierarchy?.id ?? fromFlat?.id;
    if (parentId == null) return;

    if (resolveDraftParentKey() === parentKey) {
      setDraftCategoriePid(null);
      setDraftCategorieEid(null);
      return;
    }
    setDraftCategoriePid(parentId);
    setDraftCategorieEid(null);
  };

  const handleChildCategory = (enfantId: number) => {
    if (data == null || nextBusy || fetchingMore || deleteBusy) return;
    if (draftCategoriePid == null) return;

    if (draftCategorieEid === enfantId) {
      setDraftCategorieEid(null);
    } else {
      setDraftCategorieEid(enfantId);
    }
  };

  const handleDraftDifficulte = (id: number) => {
    if (nextBusy || fetchingMore || deleteBusy) return;
    setDraftDifficulteId((prev) => (prev === id ? null : id));
  };

  const handleDraftImportance = (id: number) => {
    if (nextBusy || fetchingMore || deleteBusy) return;
    setDraftImportanceId((prev) => (prev === id ? null : id));
  };

  const syncVerifierIfNeeded = async (): Promise<boolean> => {
    if (data == null) return false;
    const curQ = data.questions[index];
    if (curQ == null) return false;
    if (draftVerifier === curQ.verifier) return true;
    try {
      const updated = await patchQuestion(curQ.id, { verifier: draftVerifier });
      setData((prev) => {
        if (!prev) return prev;
        const qs = [...prev.questions];
        const i = qs.findIndex((x) => x.id === curQ.id);
        if (i >= 0 && qs[i]) qs[i] = mergeQuizSessionQuestionFromRow(qs[i]!, updated);
        return { ...prev, questions: qs };
      });
      return true;
    } catch {
      setActionMessage("Enregistrement du fake-checker impossible. Réessaie.");
      return false;
    }
  };

  const syncDraftCategoriesIfNeeded = async (): Promise<boolean> => {
    if (data == null) return false;
    const curQ = data.questions[index];
    if (curQ == null) return false;

    if (draftCategoriePid === null) {
      setActionMessage(
        "Choisis une catégorie parente avant « Suivant » ou la fin de session (aucune n’est pas enregistrable en base).",
      );
      return false;
    }

    const sameParent = draftCategoriePid === curQ.categorie_id;
    const sameChild = (draftCategorieEid ?? null) === (curQ.categorie_e_id ?? null);
    if (sameParent && sameChild) return true;

    try {
      const patchBody: { categorie_id?: number; categorie_e_id?: number | null } = {};
      if (!sameParent) {
        patchBody.categorie_id = draftCategoriePid;
        patchBody.categorie_e_id = draftCategorieEid ?? null;
      } else {
        patchBody.categorie_e_id = draftCategorieEid ?? null;
      }
      const updated = await patchQuestion(curQ.id, patchBody);
      setData((prev) => {
        if (!prev) return prev;
        const qs = [...prev.questions];
        const qi = qs.findIndex((x) => x.id === curQ.id);
        if (qi < 0 || !qs[qi]) return prev;
        qs[qi] = mergeQuizSessionQuestionFromRow(qs[qi]!, updated);
        return { ...prev, questions: qs };
      });
      return true;
    } catch {
      setActionMessage("Enregistrement des catégories impossible. Réessaie.");
      return false;
    }
  };

  const syncDraftScalesIfNeeded = async (): Promise<boolean> => {
    if (data == null) return false;
    const curQ = data.questions[index];
    if (curQ == null) return false;

    const sameImp = (draftImportanceId ?? null) === (curQ.importance_id ?? null);
    const sameDif = (draftDifficulteId ?? null) === (curQ.difficulter_id ?? null);
    if (sameImp && sameDif) return true;

    try {
      const patchBody: { importance_id?: number | null; difficulter_id?: number | null } = {};
      if (!sameImp) patchBody.importance_id = draftImportanceId ?? null;
      if (!sameDif) patchBody.difficulter_id = draftDifficulteId ?? null;
      const updated = await patchQuestion(curQ.id, patchBody);
      setData((prev) => {
        if (!prev) return prev;
        const qs = [...prev.questions];
        const qi = qs.findIndex((x) => x.id === curQ.id);
        if (qi < 0 || !qs[qi]) return prev;
        qs[qi] = mergeQuizSessionQuestionFromRow(qs[qi]!, updated);
        return { ...prev, questions: qs };
      });
      return true;
    } catch {
      setActionMessage("Enregistrement de la difficulté ou de l’importance impossible. Réessaie.");
      return false;
    }
  };

  const handleNext = () => {
    if (nextBusy || pickedId == null || data == null) return;
    const total = data.questions.length;
    void (async () => {
      setNextBusy(true);
      try {
        if (!(await syncVerifierIfNeeded())) return;
        if (!(await syncDraftCategoriesIfNeeded())) return;
        if (!(await syncDraftScalesIfNeeded())) return;

        const delta = pickedId != null && isPickedCorrect(data.questions, index, pickedId) ? 1 : 0;
        const nextGood = good + delta;

        if (index + 1 >= total) {
          if (data.playInfinite) {
            setFetchingMore(true);
            try {
              const excludeIds = allServedQuestionIdsRef.current;
              const nextQuestionsRaw =
                collectionId === "random"
                  ? await fetchRandomQuiz({
                      orders: data.playOrders,
                      qtype: data.playQtype,
                      userId: data.playUserId,
                      infinite: true,
                      excludeIds,
                    })
                  : (
                      await fetchCollection(data.collectionId!, {
                        orders: data.playOrders,
                        qtype: data.playQtype,
                        userId: data.playUserId,
                        infinite: true,
                        excludeIds,
                        sousCollectionId: data.playSousCollectionId,
                      })
                    ).questions;
              const nextQuestions = mapQuestionsCategories(shuffleQuestionsAnswers(nextQuestionsRaw));

              playedTowardResultsRef.current += 1;
              if (nextQuestions.length === 0) {
                saveLastQuizResult({
                  mode: data.mode,
                  collectionId: data.collectionId,
                  collectionName: data.nom,
                  good: nextGood,
                  total: playedTowardResultsRef.current,
                  playOrders: data.playOrders,
                  playQtype: data.playQtype,
                  playInfinite: true,
                });
                route("/results");
                return;
              }

              allServedQuestionIdsRef.current = [
                ...allServedQuestionIdsRef.current,
                ...nextQuestions.map((nq) => nq.id),
              ];
              setGood(nextGood);
              setData((prev) => (prev != null ? { ...prev, questions: nextQuestions } : prev));
              setIndex(0);
              setPickedId(null);
              return;
            } catch {
              setActionMessage("Impossible de charger la suite des questions.");
            } finally {
              setFetchingMore(false);
            }
            return;
          }

          playedTowardResultsRef.current += 1;
          saveLastQuizResult({
            mode: data.mode,
            collectionId: data.collectionId,
            collectionName: data.nom,
            good: nextGood,
            total: playedTowardResultsRef.current,
            playOrders: data.playOrders,
            playQtype: data.playQtype,
            playInfinite: false,
          });
          route("/results");
          return;
        }

        playedTowardResultsRef.current += 1;
        setGood(nextGood);
        setIndex((i) => i + 1);
        setPickedId(null);
      } finally {
        setNextBusy(false);
      }
    })();
  };

  const handleEndInfiniteSession = () => {
    if (data == null || pickedId == null) return;
    void (async () => {
      setNextBusy(true);
      try {
        if (!(await syncVerifierIfNeeded())) return;
        if (!(await syncDraftCategoriesIfNeeded())) return;
        if (!(await syncDraftScalesIfNeeded())) return;
        const delta = pickedId != null && isPickedCorrect(data.questions, index, pickedId) ? 1 : 0;
        const nextGood = good + delta;
        playedTowardResultsRef.current += 1;
        saveLastQuizResult({
          mode: data.mode,
          collectionId: data.collectionId,
          collectionName: data.nom,
          good: nextGood,
          total: playedTowardResultsRef.current,
          playOrders: data.playOrders,
          playQtype: data.playQtype,
          playInfinite: true,
        });
        route("/results");
      } finally {
        setNextBusy(false);
      }
    })();
  };

  const handleDeleteCurrentQuestion = async (current: QuestionUi) => {
    const snapshot = data;
    if (snapshot == null || current.user_id !== userId) return;
    if (
      !window.confirm(
        "Supprimer définitivement cette question ? Elle sera retirée de la base et des collections.",
      )
    ) {
      return;
    }
    const idx = index;
    setDeleteBusy(true);
    try {
      await deleteQuestion(current.id);
      allServedQuestionIdsRef.current = allServedQuestionIdsRef.current.filter((id) => id !== current.id);
      if (questionModalDetail?.id === current.id) {
        closeQuestionModal();
      }
      const filtered = snapshot.questions.filter((x) => x.id !== current.id);
      if (filtered.length === 0) {
        setActionMessage("Dernière question supprimée.");
        route(snapshot.mode === "random" ? "/" : "/collections");
        return;
      }
      let newIndex = idx;
      if (idx >= filtered.length) {
        newIndex = filtered.length - 1;
      }
      setData({ ...snapshot, questions: filtered });
      setIndex(newIndex);
      setPickedId(null);
      setActionMessage("Question supprimée.");
    } catch {
      setActionMessage("Suppression impossible.");
    } finally {
      setDeleteBusy(false);
    }
  };

  if (loading) {
    return { kind: "loading" as const };
  }
  if (loadError != null || data == null) {
    return { kind: "error" as const, loadError };
  }

  const total = data.questions.length;
  const q = data.questions[index]!;
  const progressValue = pickedId != null ? index + 1 : index;
  const revealed = pickedId != null;
  const correct = revealed && pickedId != null && isPickedCorrect(data.questions, index, pickedId);
  const anecdote = (q.commentaire ?? "").trim();
  const backTarget = data.mode === "random" ? "/" : "/collections";
  const categoryPendingSync =
    draftCategoriePid !== q.categorie_id ||
    (draftCategorieEid ?? null) !== (q.categorie_e_id ?? null);
  const scalesPendingSync =
    (draftImportanceId ?? null) !== (q.importance_id ?? null) ||
    (draftDifficulteId ?? null) !== (q.difficulter_id ?? null);
  const categoryResumeLine = formatSessionDraftCategorieResume(
    draftCategoriePid,
    draftCategorieEid,
    refCategoriesHierarchy,
  );
  const draftResolvedParentKey = resolveDraftParentKey();

  const session = {
    data,
    backTarget,
    actionMessage,
  };

  const progress = {
    playInfinite: data.playInfinite,
    progressValue,
    total,
  };

  const questionCard = {
    data,
    index,
    total,
    q,
    pickedId,
    revealed,
    anecdote,
    correct,
    draftVerifier,
    nextBusy,
    fetchingMore,
    canDeleteCurrentQuestion: q.user_id === userId,
    deleteBusy,
    onPick: handlePick,
    onOpenCreateLinkedQuestionModal: openCreateLinkedQuestionModal,
    onOpenEditQuestionModal: openEditQuestionModal,
    onCopyCurrentQuestionJson: copyCurrentQuestionJson,
    onDeleteCurrentQuestion: handleDeleteCurrentQuestion,
    onDraftVerifier: setDraftVerifier,
    onNext: handleNext,
    onEndInfiniteSession: handleEndInfiniteSession,
    categorieSections: {
      hierarchy: refCategoriesHierarchy,
      parentKeys: getSupportedQuestionCategories(refCategories),
      draftParentKeyResolved: draftResolvedParentKey,
      draftParentId: draftCategoriePid,
      draftEnfantId: draftCategorieEid,
      resumeLine: categoryResumeLine,
      pendingSync: categoryPendingSync,
      onParentCategory: handleParentCategory,
      onChildCategory: handleChildCategory,
    },
    scaleSections: {
      difficulteRows: refDifficulteQuestion,
      importanceRows: refImportanceQuestion,
      draftDifficulteId,
      draftImportanceId,
      pendingSync: scalesPendingSync,
      onDifficulte: handleDraftDifficulte,
      onImportance: handleDraftImportance,
    },
  };

  const editModal = {
    settings: {
      open: questionModalOpen,
      onClose: closeQuestionModal,
      variant: questionModalVariant,
      modalTitle: questionModalVariant === "create" ? "Nouvelle question liée" : undefined,
    },
    actions: {
      onSave: () => void saveEditQuestionModal(),
      onDraftQuestion: setDraftQuestion,
      onDraftCommentaire: setDraftCommentaire,
      onDraftCategorieId: setDraftCategorieId,
      onDraftSousCollectionId: setDraftSousCollectionId,
      onDraftCreateLinkImplicit: setDraftCreateLinkImplicit,
      onReponseUpdated: () => void refreshQuestionModalDetail(),
      onCreateSave: (payload: QuestionCreateSavePayload) => saveCreateQuestionModal(payload),
      onRemoveImplicitRelation: (relationId: number) => removeImplicitRelationFromQuestionModal(relationId),
    },
    status: {
      loading: questionModalLoading,
      saving: questionModalSaving,
      error: questionModalError,
    },
    data: {
      questionDetail: questionModalDetail,
      categorieOptions: refCategories,
      sousCollectionsForCreate: sousCollectionsForCreateModal,
    },
    drafts: {
      question: draftQuestion,
      commentaire: draftCommentaire,
      categorieId: draftCategorieId,
      sousCollectionId: draftSousCollectionId,
      createLinkImplicit:
        questionModalVariant === "create" && createParentQuestionId != null
          ? draftCreateLinkImplicit
          : undefined,
    },
  };

  return {
    kind: "ready" as const,
    session,
    progress,
    questionCard,
    editModal,
  };
}
