export type LastQuizResult = {
  mode: "collection" | "random";
  collectionId: number | null;
  collectionName: string;
  good: number;
  total: number;
  /** Ordre des questions pour Rejouer (défaut : aléatoire). */
  playOrder?: "random" | "linear";
};

const KEY = "flowlearn_last_result";

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
    if (parsed.mode === "random" || parsed.mode === "collection") {
      return parsed as LastQuizResult;
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
