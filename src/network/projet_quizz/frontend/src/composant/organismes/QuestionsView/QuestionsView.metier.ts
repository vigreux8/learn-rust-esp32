import type { PlayQtype } from "../../../lib/playOrder";
import type { QuizzQuestionRow } from "../../../types/quizz";

export function collectionFilterToQuery(s: string): number | "none" | undefined {
  if (s === "") return undefined;
  if (s === "none") return "none";
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export function filterFromRouteParam(cid?: string): string {
  if (cid && /^\d+$/.test(cid)) return cid;
  return "";
}

export function filterQuestionsForTable(questions: QuizzQuestionRow[], listFilterQtype: PlayQtype): QuizzQuestionRow[] {
  if (listFilterQtype === "melanger") return questions;
  return questions.filter((q) => q.categorie_type === listFilterQtype);
}
