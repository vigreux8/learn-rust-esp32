import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { route } from "preact-router";
import {
  fetchCollection,
  fetchQuestionDetail,
  fetchRandomQuiz,
  fetchRefCategories,
  patchQuestion,
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
import type { QuestionUi, QuizzQuestionDetail, RefCategorieRow } from "../../../types/quizz";
import type { QuestionCreateSavePayload } from "../QuestionEditModal/QuestionEditModal";
import { buildQuestionCopyJson, isPickedCorrect } from "./QuizSessionView.metier";
import type { QuizSessionViewProps, SessionData } from "./QuizSessionView.types";

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

  useEffect(() => {
    void fetchRefCategories()
      .then(setRefCategories)
      .catch(() => setRefCategories([]));
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
          const questions = await fetchRandomQuiz(
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
              }
            : { qtype: pf.qtype },
        );
        if (cancelled) return;
        if (col.questions.length === 0) {
          setLoadError("empty");
          return;
        }
        let questions = [...col.questions];
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
    if (cur) setDraftVerifier(cur.verifier);
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
  };

  const openEditQuestionModal = (current: QuestionUi) => {
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
        questions[qi] = {
          ...cur,
          question: updated.question,
          commentaire: updated.commentaire,
          categorie_id: updated.categorie_id,
          categorie_type: updated.categorie_type,
          verifier: updated.verifier,
        };
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
      await postCreateQuestion({
        user_id: userId,
        categorie_id: payload.categorie_id,
        question: payload.question,
        commentaire: payload.commentaire,
        reponses: payload.reponses,
        parent_question_id: createParentQuestionId,
        collection_id: data?.collectionId ?? undefined,
      });
      setActionMessage("Question créée et liée à la question affichée (parent).");
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
        if (i >= 0 && qs[i]) qs[i] = { ...qs[i]!, verifier: updated.verifier };
        return { ...prev, questions: qs };
      });
      return true;
    } catch {
      setActionMessage("Enregistrement du fake-checker impossible. Réessaie.");
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

        const delta = pickedId != null && isPickedCorrect(data.questions, index, pickedId) ? 1 : 0;
        const nextGood = good + delta;

        if (index + 1 >= total) {
          if (data.playInfinite) {
            setFetchingMore(true);
            try {
              const excludeIds = allServedQuestionIdsRef.current;
              const nextQuestions =
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
                      })
                    ).questions;

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
    onPick: handlePick,
    onOpenCreateLinkedQuestionModal: openCreateLinkedQuestionModal,
    onOpenEditQuestionModal: openEditQuestionModal,
    onCopyCurrentQuestionJson: copyCurrentQuestionJson,
    onDraftVerifier: setDraftVerifier,
    onNext: handleNext,
    onEndInfiniteSession: handleEndInfiniteSession,
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
      onReponseUpdated: () => void refreshQuestionModalDetail(),
      onCreateSave: (payload: QuestionCreateSavePayload) => saveCreateQuestionModal(payload),
    },
    status: {
      loading: questionModalLoading,
      saving: questionModalSaving,
      error: questionModalError,
    },
    data: { questionDetail: questionModalDetail, categorieOptions: refCategories },
    drafts: {
      question: draftQuestion,
      commentaire: draftCommentaire,
      categorieId: draftCategorieId,
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
