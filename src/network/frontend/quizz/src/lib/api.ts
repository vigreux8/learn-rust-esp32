import { apiUrl } from "./config";
import type {
  CollectionUi,
  DeviceLookupResult,
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

async function assertResponseOk(res: Response): Promise<void> {
  if (!res.ok) {
    const body = await readError(res);
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
}

export async function fetchDeviceLookup(mac: string): Promise<DeviceLookupResult> {
  const q = encodeURIComponent(mac);
  const res = await fetch(apiUrl(`/devices/lookup?adresse_mac=${q}`));
  await assertResponseOk(res);
  return res.json() as Promise<DeviceLookupResult>;
}

export async function registerDeviceWithPseudot(
  mac: string,
  pseudot: string,
): Promise<{ userId: number; pseudot: string }> {
  const res = await fetch(apiUrl("/devices/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adresse_mac: mac, pseudot }),
  });
  await assertResponseOk(res);
  return res.json() as Promise<{ userId: number; pseudot: string }>;
}

export async function fetchCollections(): Promise<CollectionUi[]> {
  const res = await fetch(apiUrl("/quizz/collections"));
  await assertResponseOk(res);
  return res.json() as Promise<CollectionUi[]>;
}

export async function fetchCollection(id: number): Promise<CollectionUi> {
  const res = await fetch(apiUrl(`/quizz/collections/${id}`));
  await assertResponseOk(res);
  return res.json() as Promise<CollectionUi>;
}

export async function fetchRandomQuiz(): Promise<QuestionUi[]> {
  const res = await fetch(apiUrl("/quizz/random"));
  await assertResponseOk(res);
  return res.json() as Promise<QuestionUi[]>;
}

export async function fetchQuestions(
  collectionId?: number | "none",
): Promise<QuizzQuestionRow[]> {
  const suffix =
    collectionId === "none"
      ? "?collectionId=none"
      : collectionId !== undefined
        ? `?collectionId=${collectionId}`
        : "";
  const res = await fetch(apiUrl(`/quizz/questions${suffix}`));
  await assertResponseOk(res);
  return res.json() as Promise<QuizzQuestionRow[]>;
}

export async function patchQuestion(
  id: number,
  body: { question?: string; commentaire?: string },
): Promise<QuizzQuestionRow> {
  const res = await fetch(apiUrl(`/quizz/questions/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
  return res.json() as Promise<QuizzQuestionRow>;
}

export async function importQuestionsJson(body: unknown): Promise<{
  createdQuestions: number;
  createdCollections: number;
}> {
  const res = await fetch(apiUrl("/quizz/questions/import"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
  return res.json() as Promise<{ createdQuestions: number; createdCollections: number }>;
}

export async function deleteQuestion(id: number): Promise<void> {
  const res = await fetch(apiUrl(`/quizz/questions/${id}`), { method: "DELETE" });
  await assertResponseOk(res);
}

export async function fetchKpis(userId: number): Promise<UserKpiRow[]> {
  const res = await fetch(apiUrl(`/stats/kpis?userId=${userId}`));
  await assertResponseOk(res);
  return res.json() as Promise<UserKpiRow[]>;
}

export async function postQuizKpi(params: {
  userId: number;
  questionId: number;
  reponseId: number;
  dureeSecondes: number;
}): Promise<UserKpiRow> {
  const res = await fetch(apiUrl("/stats/kpi"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: params.userId,
      questionId: params.questionId,
      reponseId: params.reponseId,
      dureeSecondes: params.dureeSecondes,
    }),
  });
  await assertResponseOk(res);
  return res.json() as Promise<UserKpiRow>;
}

export async function fetchSessionSummaries(userId: number): Promise<SessionSummary[]> {
  const res = await fetch(apiUrl(`/stats/sessions?userId=${userId}`));
  await assertResponseOk(res);
  return res.json() as Promise<SessionSummary[]>;
}

export async function fetchSessionDetail(
  sessionId: string,
  userId: number,
): Promise<SessionDetail | null> {
  const res = await fetch(apiUrl(`/stats/sessions/${encodeURIComponent(sessionId)}?userId=${userId}`));
  if (res.status === 404) return null;
  await assertResponseOk(res);
  return res.json() as Promise<SessionDetail>;
}
