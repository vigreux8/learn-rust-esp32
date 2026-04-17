import { isPlayOrder, parsePlayOrdersFromString, type PlayOrder, type PlayQtype } from "./playOrder";

export type LastQuizResult = {
  mode: "collection" | "random";
  collectionId: number | null;
  collectionName: string;
  good: number;
  total: number;
  /** Modes de jeu pour Rejouer (défaut : aléatoire seul). */
  playOrders?: PlayOrder[];
  /** @deprecated Utiliser playOrders ; conservé pour anciens résultats. */
  playOrder?: PlayOrder;
  playQtype?: PlayQtype;
  playInfinite?: boolean;
};

const KEY = "flowlearn_last_result";

function normalizePlayOrders(parsed: Partial<LastQuizResult>): PlayOrder[] | undefined {
  if (parsed.playOrders != null && Array.isArray(parsed.playOrders)) {
    const o = parsed.playOrders.filter((x): x is PlayOrder => typeof x === "string" && isPlayOrder(x));
    if (o.length > 0) return o;
  }
  const legacy = parsed.playOrder;
  if (typeof legacy === "string") {
    if (legacy.includes(",")) return parsePlayOrdersFromString(legacy);
    if (isPlayOrder(legacy)) return [legacy];
  }
  return undefined;
}

export function saveLastQuizResult(r: LastQuizResult) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(r));
  } catch {
    /* ignore */
  }
}

export function readLastQuizResult(): LastQuizResult | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LastQuizResult> & { collectionId?: number };
    const playOrders = normalizePlayOrders(parsed);
    if (parsed.mode === "random" || parsed.mode === "collection") {
      const base = parsed as LastQuizResult;
      if (playOrders != null) {
        return { ...base, playOrders };
      }
      return base;
    }
    if (
      parsed.collectionName != null &&
      typeof parsed.good === "number" &&
      typeof parsed.total === "number"
    ) {
      return {
        mode: "collection",
        collectionId: parsed.collectionId ?? null,
        collectionName: parsed.collectionName,
        good: parsed.good,
        total: parsed.total,
        playOrders: playOrders ?? undefined,
        playQtype: parsed.playQtype,
        playInfinite: parsed.playInfinite,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearLastQuizResult() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
