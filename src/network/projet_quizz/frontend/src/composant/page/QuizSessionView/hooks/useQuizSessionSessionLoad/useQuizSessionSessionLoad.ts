import { useEffect, useState } from "preact/hooks";
import {
  fetchCollection,
  fetchRandomQuiz,
  fetchReflexionChain,
  type HttpError,
} from "../../../../../lib/api";
import {
  playFetchParamsFromSearch,
  playOrdersRequireUserId,
  shuffleQuestions,
} from "../../../../../lib/playOrder";
import { buildReflexionMixedPlaylist } from "../../../../../lib/playSessionReflexionMix";
import {
  mapQuestionsQuizUiCategories,
  shuffleQuestionsAnswers,
  filterQuestionsByPlayGraphIncludeIds,
} from "../../QuizSessionView.metier";
import type { UseQuizSessionSessionLoadOptions, UseQuizSessionSessionLoadResult } from "./useQuizSessionSessionLoad.types";

/**
 * Hydratation de la session de quiz : collection, tirage des questions (dont mix réflexion si paramétré),
 * enrichissement UI et état chargement / erreur ; expose aussi la fonction de relance.
 */
export function useQuizSessionSessionLoad({
  route,
  deps,
  trackersRef,
}: UseQuizSessionSessionLoadOptions): UseQuizSessionSessionLoadResult {
  const collectionId = route.collectionId;
  const routePath = deps.routePath;
  const userId = deps.userId;

  const [session, setSession] = useState<UseQuizSessionSessionLoadResult["data"]["session"]>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    trackersRef.current?.onFetchBegins();
    setLoading(true);
    setLoadError(null);
    setSession(null);

    void (async () => {
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
          const questions = mapQuestionsQuizUiCategories(shuffleQuestionsAnswers(fetchedQuestions));
          if (cancelled) return;
          if (questions.length === 0) {
            setLoadError("empty");
            return;
          }
          trackersRef.current?.onDeckPrepared({
            infinite: pf.infinite,
            initialServedQuestionIds: pf.infinite ? questions.map((qi) => qi.id) : [],
          });
          trackersRef.current?.onPlayCountersReady();
          setSession({
            mode: "random",
            collectionId: null,
            nom: "Mélange aléatoire",
            questions,
            playOrders: orders,
            playQtype: qtype,
            playInfinite: pf.infinite,
            playUserId,
            useServerPlayModes: pf.useServerPlayModes,
            playIncludeReflexion: false,
            playIncludeChildCollections: false,
            playFamilyQuotaPercent: 100,
            playFamilyQuotaMax: 0,
            playIncludePersonnaliteFiches: false,
          });
          return;
        }

        const cid = Number(collectionId);
        if (!Number.isFinite(cid)) {
          setLoadError("bad");
          return;
        }
        const childFetchOpts =
          pf.includeChildCollections && pf.sousCollectionId == null
            ? {
                includeChildCollections: true as const,
                childCollectionsMix: pf.childCollectionsMix,
                familyQuotaPercent: pf.familyQuotaPercent,
                ...(pf.familyQuotaMax > 0 ? { familyQuotaMax: pf.familyQuotaMax } : {}),
              }
            : {};
        const persoFetchOpts =
          pf.includePersonnaliteFiches && pf.sousCollectionId == null
            ? { includePersonnaliteFiches: true as const }
            : {};
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
                ...childFetchOpts,
                ...persoFetchOpts,
              }
            : { qtype: pf.qtype, sousCollectionId: pf.sousCollectionId, ...childFetchOpts, ...persoFetchOpts },
        );
        if (cancelled) return;
        if (col.questions.length === 0) {
          setLoadError("empty");
          return;
        }
        let questionsList = mapQuestionsQuizUiCategories(shuffleQuestionsAnswers(col.questions));
        if (!pf.useServerPlayModes && orders.length === 1 && orders[0] === "random") {
          questionsList = shuffleQuestions(questionsList);
        }

        let wrongAnswerNextIndex: number[] | undefined;
        const playIncludeReflexion = pf.includeReflexion;
        const playReflexionSharePercent = pf.reflexionSharePercent;
        if (pf.includeReflexion && !pf.infinite && questionsList.length > 0) {
          try {
            const chainEditor = await fetchReflexionChain(cid);
            const byId = new Map(questionsList.map((qItem) => [qItem.id, qItem]));
            const chainQs = chainEditor.ordered_questions
              .map((row) => byId.get(row.id))
              .filter((x) => x != null);
            if (chainQs.length > 0) {
              const mixed = buildReflexionMixedPlaylist({
                shuffledCollectionQuestions: questionsList,
                chainOrderedQuestions: chainQs,
                reflexionSharePercent: pf.reflexionSharePercent,
              });
              questionsList = mixed.questions;
              wrongAnswerNextIndex = mixed.wrongAnswerNextIndex;
            }
          } catch {
            /* chaîne indisponible */
          }
        }

        questionsList = filterQuestionsByPlayGraphIncludeIds(
          questionsList,
          cid,
          pf.graphIncludeIds,
        );
        if (questionsList.length === 0) {
          setLoadError("empty");
          return;
        }

        trackersRef.current?.onDeckPrepared({
          infinite: pf.infinite,
          initialServedQuestionIds: pf.infinite ? questionsList.map((qi) => qi.id) : [],
        });
        trackersRef.current?.onPlayCountersReady();
        setSession({
          mode: "collection",
          collectionId: cid,
          nom: col.nom,
          questions: questionsList,
          playOrders: orders,
          playQtype: qtype,
          playInfinite: pf.infinite,
          playUserId,
          playSousCollectionId: pf.sousCollectionId,
          useServerPlayModes: pf.useServerPlayModes,
          wrongAnswerNextIndex,
          playIncludeReflexion,
          playReflexionSharePercent,
          playIncludeChildCollections: pf.includeChildCollections,
          playChildCollectionsMix: pf.childCollectionsMix,
          playFamilyQuotaPercent: pf.familyQuotaPercent,
          playFamilyQuotaMax: pf.familyQuotaMax,
          playIncludePersonnaliteFiches: pf.includePersonnaliteFiches,
          playGraphIncludeIds: pf.graphIncludeIds ?? null,
        });
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

  return {
    status: { loading, loadError },
    data: { session, setSession },
  };
}
