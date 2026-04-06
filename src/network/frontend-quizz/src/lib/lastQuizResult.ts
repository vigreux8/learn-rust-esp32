export type LastQuizResult = {
  collectionId: number;
  collectionName: string;
  good: number;
  total: number;
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
    return JSON.parse(raw) as LastQuizResult;
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
