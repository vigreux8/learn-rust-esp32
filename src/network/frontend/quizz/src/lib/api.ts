import { apiUrl } from "./config";
import type {
  CollectionUi,
  QuestionUi,
  QuizzQuestionRow,
  SessionDetail,
  SessionSummary,
  UserKpiRow,
} from "../types/quizz";

async function readError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(j.message)) return j.message.join(", ");
    if (typeof j.message === "string") return j.message;
  } catch {
    /* ignore */
  }
  return text || res.statusText;
}

export async function fetchCollections(): Promise<CollectionUi[]> {
  const res = await fetch(apiUrl("/collections"));
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<CollectionUi[]>;
}

export async function fetchCollection(id: number): Promise<CollectionUi> {
  const res = await fetch(apiUrl(`/collections/${id}`));
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<CollectionUi>;
}

export async function fetchRandomQuiz(): Promise<QuestionUi[]> {
  const res = await fetch(apiUrl("/quiz/random"));
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<QuestionUi[]>;
}

export async function fetchQuestions(): Promise<QuizzQuestionRow[]> {
  const res = await fetch(apiUrl("/questions"));
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<QuizzQuestionRow[]>;
}

export async function patchQuestion(id: number, question: string): Promise<QuizzQuestionRow> {
  const res = await fetch(apiUrl(`/questions/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<QuizzQuestionRow>;
}

export async function deleteQuestion(id: number): Promise<void> {
  const res = await fetch(apiUrl(`/questions/${id}`), { method: "DELETE" });
  if (!res.ok) throw new Error(await readError(res));
}

export async function fetchKpis(userId: number): Promise<UserKpiRow[]> {
  const res = await fetch(apiUrl(`/stats/kpis?userId=${userId}`));
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<UserKpiRow[]>;
}

export async function fetchSessionSummaries(userId: number): Promise<SessionSummary[]> {
  const res = await fetch(apiUrl(`/stats/sessions?userId=${userId}`));
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<SessionSummary[]>;
}

export async function fetchSessionDetail(
  sessionId: string,
  userId: number,
): Promise<SessionDetail | null> {
  const res = await fetch(apiUrl(`/stats/sessions/${encodeURIComponent(sessionId)}?userId=${userId}`));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<SessionDetail>;
}
