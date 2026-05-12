import { useLayoutEffect, useRef, useState } from "preact/hooks";
import { route } from "preact-router";
import {
  fetchCollection,
  fetchRandomQuiz,
  deleteQuestion,
  postQuizKpi,
} from "../../../../../lib/api";
import { saveLastQuizResult } from "../../../../../lib/lastQuizResult";
import { playSessionFromNodeFromSearch } from "../../../../../lib/playOrder";
import type { QuestionUi } from "../../../../../types/quizz";
import {
  buildQuestionCopyJson,
  filterQuestionsByPlayGraphIncludeIds,
  isPickedCorrect,
  mapQuestionsQuizUiCategories,
  shuffleQuestionsAnswers,
} from "../../QuizSessionView.metier";
import type {
  UseQuizSessionPlayStateOptions,
  UseQuizSessionPlayStateResult,
} from "./useQuizSessionPlayState.types";

/**
 * Déroulé du quiz : index question, choix réponse, révélation, score, fin de session, actions suivant / recommencer,
 * KPI et persistance locale du dernier résultat.
 */
export function useQuizSessionPlayState(opts: UseQuizSessionPlayStateOptions): UseQuizSessionPlayStateResult {
  const {
    route: routeOpts,
    trackersRef,
    session,
    identity,
    feedback,
    mutations,
    locks,
    annotationSyncPackRef,
    edition,
  } = opts;

  const questionStartedAtMs = useRef(0);
  const allServedQuestionIdsRef = useRef<number[]>([]);
  const playedTowardResultsRef = useRef(0);

  const [index, setIndex] = useState(0);
  const [pickedId, setPickedId] = useState<number | null>(null);
  const [good, setGood] = useState(0);
  const [nextBusy, setNextBusy] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  trackersRef.current = {
    onFetchBegins() {
      allServedQuestionIdsRef.current = [];
      playedTowardResultsRef.current = 0;
    },
    onDeckPrepared(ctx) {
      if (ctx.infinite) {
        allServedQuestionIdsRef.current = [...ctx.initialServedQuestionIds];
      }
    },
    onPlayCountersReady() {
      setIndex(0);
      setPickedId(null);
      setGood(0);
    },
  };

  useLayoutEffect(() => {
    if (session == null) return;
    questionStartedAtMs.current = performance.now();
  }, [session, index]);

  const copyQuestionJson = async (current: QuestionUi) => {
    const text = buildQuestionCopyJson(current);
    try {
      await navigator.clipboard.writeText(text);
      feedback.setMessage("JSON copié dans le presse-papiers.");
    } catch {
      feedback.setMessage("Copie impossible (permissions du navigateur).");
    }
  };

  const pick = (reponseId: number) => {
    if (session == null || pickedId != null) return;
    const qCur = session.questions[index];
    if (qCur == null) return;
    const dureeSecondes = (performance.now() - questionStartedAtMs.current) / 1000;
    void postQuizKpi({
      userId: identity.userId,
      questionId: qCur.id,
      reponseId,
      dureeSecondes,
    }).catch(() => {
      /* KPI optionnel */
    });
    setPickedId(reponseId);
  };

  const runDraftSyncTriple = async (): Promise<boolean> => {
    const pack = annotationSyncPackRef.current;
    if (!pack) return false;
    if (!(await pack.syncVerifierIfNeeded())) return false;
    if (!(await pack.syncDraftCategoriesIfNeeded())) return false;
    if (!(await pack.syncDraftScalesIfNeeded())) return false;
    return true;
  };

  const advance = () => {
    const routeCollectionId = routeOpts.collectionId;
    if (nextBusy || pickedId == null || session == null) return;
    const total = session.questions.length;
    void (async () => {
      setNextBusy(true);
      try {
        const snap = session;
        if (!(await runDraftSyncTriple())) return;

        const correctNow = pickedId != null && isPickedCorrect(snap.questions, index, pickedId);
        const delta = correctNow ? 1 : 0;
        const nextGoodVal = good + delta;
        const nextIdxVal = correctNow
          ? index + 1
          : (snap.wrongAnswerNextIndex?.[index] ?? index + 1);

        if (nextIdxVal >= total) {
          if (snap.playInfinite) {
            setFetchingMore(true);
            try {
              const excludeIds = allServedQuestionIdsRef.current;
              const childInf =
                snap.playIncludeChildCollections === true && snap.playSousCollectionId == null
                  ? {
                      includeChildCollections: true as const,
                      childCollectionsMix: snap.playChildCollectionsMix ?? "melange",
                      familyQuotaPercent: snap.playFamilyQuotaPercent ?? 100,
                      ...(snap.playFamilyQuotaMax != null && snap.playFamilyQuotaMax > 0
                        ? { familyQuotaMax: snap.playFamilyQuotaMax }
                        : {}),
                    }
                  : {};
              const persoInf =
                snap.playIncludePersonnaliteFiches === true && snap.playSousCollectionId == null
                  ? { includePersonnaliteFiches: true as const }
                  : {};
              const nextQuestionsRaw =
                routeCollectionId === "random"
                  ? await fetchRandomQuiz({
                      orders: snap.playOrders,
                      qtype: snap.playQtype,
                      userId: snap.playUserId,
                      infinite: true,
                      excludeIds,
                    })
                  : (
                      await fetchCollection(snap.collectionId!, {
                        orders: snap.playOrders,
                        qtype: snap.playQtype,
                        userId: snap.playUserId,
                        infinite: true,
                        excludeIds,
                        sousCollectionId: snap.playSousCollectionId,
                        ...childInf,
                        ...persoInf,
                      })
                    ).questions;
              const nextQuestionsMapped = mapQuestionsQuizUiCategories(
                shuffleQuestionsAnswers(nextQuestionsRaw),
              );
              const nextQuestions =
                snap.playGraphIncludeIds != null &&
                snap.playGraphIncludeIds.length > 0 &&
                snap.collectionId != null
                  ? filterQuestionsByPlayGraphIncludeIds(
                      nextQuestionsMapped,
                      snap.collectionId,
                      snap.playGraphIncludeIds,
                    )
                  : nextQuestionsMapped;

              playedTowardResultsRef.current += 1;
              if (nextQuestions.length === 0) {
                saveLastQuizResult({
                  mode: snap.mode,
                  collectionId: snap.collectionId,
                  collectionName: snap.nom,
                  good: nextGoodVal,
                  total: playedTowardResultsRef.current,
                  playOrders: snap.playOrders,
                  playQtype: snap.playQtype,
                  playInfinite: true,
                  playIncludeReflexion: snap.playIncludeReflexion,
                  playReflexionSharePercent: snap.playReflexionSharePercent,
                  playIncludeChildCollections: snap.playIncludeChildCollections,
                  playChildCollectionsMix: snap.playChildCollectionsMix,
                  playFamilyQuotaPercent: snap.playFamilyQuotaPercent,
                  playFamilyQuotaMax: snap.playFamilyQuotaMax,
                  playIncludePersonnaliteFiches: snap.playIncludePersonnaliteFiches,
                });
                route("/results");
                return;
              }

              allServedQuestionIdsRef.current = [
                ...allServedQuestionIdsRef.current,
                ...nextQuestions.map((nq) => nq.id),
              ];
              setGood(nextGoodVal);
              mutations.setSession((prev) =>
                prev != null
                  ? {
                      ...prev,
                      questions: nextQuestions,
                      wrongAnswerNextIndex: undefined,
                      playIncludeReflexion: false,
                    }
                  : prev,
              );
              setIndex(0);
              setPickedId(null);
              return;
            } catch {
              feedback.setMessage("Impossible de charger la suite des questions.");
            } finally {
              setFetchingMore(false);
            }
            return;
          }

          playedTowardResultsRef.current += 1;
          saveLastQuizResult({
            mode: snap.mode,
            collectionId: snap.collectionId,
            collectionName: snap.nom,
            good: nextGoodVal,
            total: playedTowardResultsRef.current,
            playOrders: snap.playOrders,
            playQtype: snap.playQtype,
            playInfinite: false,
            playIncludeReflexion: snap.playIncludeReflexion,
            playReflexionSharePercent: snap.playReflexionSharePercent,
            playIncludeChildCollections: snap.playIncludeChildCollections,
            playChildCollectionsMix: snap.playChildCollectionsMix,
            playFamilyQuotaPercent: snap.playFamilyQuotaPercent,
            playFamilyQuotaMax: snap.playFamilyQuotaMax,
            playIncludePersonnaliteFiches: snap.playIncludePersonnaliteFiches,
          });
          route("/results");
          return;
        }

        playedTowardResultsRef.current += 1;
        setGood(nextGoodVal);
        setIndex(nextIdxVal);
        setPickedId(null);
      } finally {
        setNextBusy(false);
      }
    })();
  };

  const endInfiniteEarly = () => {
    const snap = session;
    if (snap == null || pickedId == null) return;
    void (async () => {
      setNextBusy(true);
      try {
        if (!(await runDraftSyncTriple())) return;
        const deltaPick = pickedId != null && isPickedCorrect(snap.questions, index, pickedId) ? 1 : 0;
        const nextGoodVal = good + deltaPick;
        playedTowardResultsRef.current += 1;
        saveLastQuizResult({
          mode: snap.mode,
          collectionId: snap.collectionId,
          collectionName: snap.nom,
          good: nextGoodVal,
          total: playedTowardResultsRef.current,
          playOrders: snap.playOrders,
          playQtype: snap.playQtype,
          playInfinite: true,
          playIncludeReflexion: snap.playIncludeReflexion,
          playReflexionSharePercent: snap.playReflexionSharePercent,
          playIncludeChildCollections: snap.playIncludeChildCollections,
          playChildCollectionsMix: snap.playChildCollectionsMix,
          playFamilyQuotaPercent: snap.playFamilyQuotaPercent,
          playFamilyQuotaMax: snap.playFamilyQuotaMax,
          playIncludePersonnaliteFiches: snap.playIncludePersonnaliteFiches,
        });
        route("/results");
      } finally {
        setNextBusy(false);
      }
    })();
  };

  const deleteCurrentQuestion = async (current: QuestionUi) => {
    const snap = session;
    if (snap == null || current.user_id !== identity.userId) return;
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
      allServedQuestionIdsRef.current = allServedQuestionIdsRef.current.filter((idNum) => idNum !== current.id);
      if (edition.questionDetailIdRef.current === current.id) {
        edition.closeQuestionModalRef.current?.();
      }
      const filtered = snap.questions.filter((xItem) => xItem.id !== current.id);
      if (filtered.length === 0) {
        feedback.setMessage("Dernière question supprimée.");
        route(
          snap.mode === "random"
            ? "/"
            : playSessionFromNodeFromSearch()
              ? "/node"
              : "/collections",
        );
        return;
      }
      let newIndexVal = idx;
      if (idx >= filtered.length) {
        newIndexVal = filtered.length - 1;
      }
      mutations.setSession({
        ...snap,
        questions: filtered,
        wrongAnswerNextIndex: undefined,
      });
      setIndex(newIndexVal);
      setPickedId(null);
      feedback.setMessage("Question supprimée.");
    } catch {
      feedback.setMessage("Suppression impossible.");
    } finally {
      setDeleteBusy(false);
    }
  };

  locks.interactionLockedRef.current = nextBusy || fetchingMore || deleteBusy;

  const revealed = pickedId != null;
  const correctAnswer =
    revealed && pickedId != null && session != null && isPickedCorrect(session.questions, index, pickedId);

  return {
    navigation: {
      index,
    },
    actions: {
      pick,
      advance,
      endInfiniteEarly,
      copyQuestionJson,
      deleteCurrentQuestion,
    },
    status: {
      pickedId,
      goodAnswers: good,
      nextBusy,
      fetchingMore,
      deleteBusy,
      revealed,
      correctAnswer,
    },
  };
}
