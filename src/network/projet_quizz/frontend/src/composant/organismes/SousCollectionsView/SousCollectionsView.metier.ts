import type { QuizzQuestionRow } from "../../../types/quizz";

export function normalizeCollectionIdParam(raw: string | undefined): number | null {
  if (raw === undefined || raw === "") {
    return null;
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) {
    return null;
  }
  return n;
}

export function filterQuestionsBySearch(rows: QuizzQuestionRow[], q: string): QuizzQuestionRow[] {
  const t = q.trim().toLowerCase();
  if (t === "") {
    return rows;
  }
  return rows.filter((r) => {
    const hay = `${r.question} ${r.commentaire}`.toLowerCase();
    return hay.includes(t);
  });
}

/** Questions de la collection non encore placées dans la sous-collection sélectionnée (évitent le doublon visuel). */
export function filterPoolExcludingAssigned(
  rows: QuizzQuestionRow[],
  assignedQuestionIds: Set<number>,
): QuizzQuestionRow[] {
  return rows.filter((r) => !assignedQuestionIds.has(r.id));
}
