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
  });
  if (result.mode === "random") return `/play/random${query}`;
  if (result.collectionId != null) return `/play/${result.collectionId}${query}`;
  return "/collections";
}
