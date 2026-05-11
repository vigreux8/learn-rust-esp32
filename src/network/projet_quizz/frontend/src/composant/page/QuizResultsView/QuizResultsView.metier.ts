import type { LastQuizResult } from "../../../lib/lastQuizResult";
import { buildPlaySessionQuery, isPlayOrder, playOrdersRequireUserId, type PlayOrder } from "../../../lib/playOrder";

export function computeScorePercent(good: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((good / total) * 100);
}

export function resolvePlayOrders(result: LastQuizResult): PlayOrder[] {
  if (result.playOrders != null && result.playOrders.length > 0) return result.playOrders;
  if (result.playOrder != null && isPlayOrder(result.playOrder)) return [result.playOrder];
  return ["random"];
}

export function buildReplayTarget(result: LastQuizResult, userId: number): string {
  const orders = resolvePlayOrders(result);
  const query = buildPlaySessionQuery({
    orders,
    qtype: result.playQtype ?? "melanger",
    infinite: result.playInfinite === true,
    userId: playOrdersRequireUserId(orders) ? userId : undefined,
    includeReflexion: result.playIncludeReflexion === true ? true : undefined,
    reflexionSharePercent:
      result.playReflexionSharePercent != null && result.playReflexionSharePercent !== 25
        ? result.playReflexionSharePercent
        : undefined,
    includeChildCollections: result.playIncludeChildCollections === true ? true : undefined,
    childCollectionsMix:
      result.playChildCollectionsMix != null && result.playChildCollectionsMix !== "melange"
        ? result.playChildCollectionsMix
        : undefined,
    familyQuotaPercent:
      result.playFamilyQuotaPercent != null &&
      result.playFamilyQuotaPercent !== 100 &&
      result.playIncludeChildCollections === true
        ? result.playFamilyQuotaPercent
        : undefined,
    familyQuotaMax:
      result.playFamilyQuotaMax != null &&
      result.playFamilyQuotaMax > 0 &&
      result.playIncludeChildCollections === true
        ? result.playFamilyQuotaMax
        : undefined,
    includePersonnaliteFiches:
      result.playIncludePersonnaliteFiches === true ? true : undefined,
  });
  if (result.mode === "random") return `/play/random${query}`;
  if (result.collectionId != null) return `/play/${result.collectionId}${query}`;
  return "/collections";
}
