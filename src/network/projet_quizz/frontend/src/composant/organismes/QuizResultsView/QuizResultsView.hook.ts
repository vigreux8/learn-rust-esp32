import { useMemo } from "preact/hooks";
import { route } from "preact-router";
import { readLastQuizResult } from "../../../lib/lastQuizResult";
import { useUserSession } from "../../../lib/userSession";
import { buildReplayTarget, computeScorePercent } from "./QuizResultsView.metier";

export function useQuizResultsView() {
  const { userId } = useUserSession();
  const result = useMemo(() => readLastQuizResult(), []);

  const goHome = () => route("/");
  const goCollections = () => route("/collections");

  if (result == null) {
    return {
      result: null,
      summary: null,
      navigation: {
        goHome,
        goCollections,
        replay: goHome,
      },
    };
  }

  const summary = {
    good: result.good,
    total: result.total,
    percent: computeScorePercent(result.good, result.total),
    collectionName: result.collectionName,
  };

  const replay = () => {
    const target = buildReplayTarget(result, userId);
    route(target);
  };

  return {
    result,
    summary,
    navigation: {
      goHome,
      goCollections,
      replay,
    },
  };
}
