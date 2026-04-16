import { apiUrl } from "./config";
import type {
  CollectionUi,
  DeviceLookupResult,
  QuestionUi,
  QuizzModuleRow,
  QuizzQuestionDetail,
  QuizzQuestionRow,
  RefCategorieRow,
  SessionDetail,
  SessionSummary,
  UserKpiRow,
} from "../types/quizz";
import type { LlmImportPayload } from "../composant/molecules/QuestionsLlmImportPanel";
import type { AppCollectionImportPayload } from "./appCollectionImportNormalize";

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

export type HttpError = Error & { status: number; body: string };

async function assertResponseOk(res: Response): Promise<void> {
  if (!res.ok) {
    const body = await readError(res);
    const err = new Error(`HTTP ${res.status}: ${body}`) as HttpError;
    err.status = res.status;
    err.body = body;
    throw err;
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

export async function fetchCollection(
  id: number,
  opts?: { qtype?: "histoire" | "pratique" | "melanger" },
): Promise<CollectionUi> {
  const p = new URLSearchParams();
  if (opts?.qtype != null && opts.qtype !== "melanger") {
    p.set("qtype", opts.qtype);
  }
  const q = p.size > 0 ? `?${p.toString()}` : "";
  const res = await fetch(apiUrl(`/quizz/collections/${id}${q}`));
  await assertResponseOk(res);
  return res.json() as Promise<CollectionUi>;
}

export async function fetchModules(): Promise<QuizzModuleRow[]> {
  const res = await fetch(apiUrl("/quizz/modules"));
  await assertResponseOk(res);
  return res.json() as Promise<QuizzModuleRow[]>;
}

export async function createQuizzModule(nom: string): Promise<QuizzModuleRow> {
  const res = await fetch(apiUrl("/quizz/modules"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nom }),
  });
  await assertResponseOk(res);
  return res.json() as Promise<QuizzModuleRow>;
}

export async function deleteQuizzModule(moduleId: number): Promise<void> {
  const res = await fetch(apiUrl(`/quizz/modules/${moduleId}`), { method: "DELETE" });
  await assertResponseOk(res);
}

export async function assignCollectionToModule(
  collectionId: number,
  moduleId: number,
): Promise<CollectionUi> {
  const res = await fetch(apiUrl(`/quizz/collections/${collectionId}/modules`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleId }),
  });
  await assertResponseOk(res);
  return res.json() as Promise<CollectionUi>;
}

export async function unassignCollectionFromModule(
  collectionId: number,
  moduleId: number,
): Promise<CollectionUi> {
  const res = await fetch(
    apiUrl(`/quizz/collections/${collectionId}/modules/${moduleId}`),
    { method: "DELETE" },
  );
  await assertResponseOk(res);
  return res.json() as Promise<CollectionUi>;
}

export async function deleteCollection(collectionId: number, userId: number): Promise<void> {
  const q = new URLSearchParams({ userId: String(userId) });
  const res = await fetch(apiUrl(`/quizz/collections/${collectionId}?${q.toString()}`), {
    method: "DELETE",
  });
  await assertResponseOk(res);
}

export async function fetchRandomQuiz(opts?: {
  order?: "random" | "linear";
  qtype?: "histoire" | "pratique" | "melanger";
}): Promise<QuestionUi[]> {
  const p = new URLSearchParams();
  if (opts?.order === "linear") p.set("order", "linear");
  if (opts?.qtype != null && opts.qtype !== "melanger") {
    p.set("qtype", opts.qtype);
  }
  const q = p.size > 0 ? `?${p.toString()}` : "";
  const res = await fetch(apiUrl(`/quizz/random${q}`));
  await assertResponseOk(res);
  return res.json() as Promise<QuestionUi[]>;
}

export async function fetchRefCategories(): Promise<RefCategorieRow[]> {
  const res = await fetch(apiUrl("/quizz/categories"));
  await assertResponseOk(res);
  return res.json() as Promise<RefCategorieRow[]>;
}

export async function fetchQuestionDetail(id: number): Promise<QuizzQuestionDetail> {
  const res = await fetch(apiUrl(`/quizz/questions/${id}`));
  await assertResponseOk(res);
  return res.json() as Promise<QuizzQuestionDetail>;
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
  body: { question?: string; commentaire?: string; categorie_id?: number },
): Promise<QuizzQuestionRow> {
  const res = await fetch(apiUrl(`/quizz/questions/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
  return res.json() as Promise<QuizzQuestionRow>;
}

export async function patchReponse(
  id: number,
  body: { reponse: string },
): Promise<{ id: number; reponse: string; bonne_reponse: boolean }> {
  const res = await fetch(apiUrl(`/quizz/reponses/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
  return res.json() as Promise<{ id: number; reponse: string; bonne_reponse: boolean }>;
}

export async function createEmptyCollection(body: {
  userId: number;
  nom: string;
  moduleId?: number;
}): Promise<CollectionUi> {
  const res = await fetch(apiUrl("/quizz/collections"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
  return res.json() as Promise<CollectionUi>;
}

export async function importQuestionsJson(
  body: LlmImportPayload,
  options?: { collectionId?: number; moduleId?: number; categorie?: "histoire" | "pratique" },
): Promise<{
  createdQuestions: number;
  createdCollections: number;
}> {
  const q = new URLSearchParams();
  if (options?.collectionId != null) {
    q.set("collectionId", String(options.collectionId));
  }
  if (options?.moduleId != null) {
    q.set("moduleId", String(options.moduleId));
  }
  if (options?.categorie != null) {
    q.set("categorie", options.categorie);
  }
  const suffix = q.size > 0 ? `?${q.toString()}` : "";
  const res = await fetch(apiUrl(`/quizz/questions/import${suffix}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
  return res.json() as Promise<{ createdQuestions: number; createdCollections: number }>;
}

export async function importAppCollectionQuestionsJson(
  body: AppCollectionImportPayload,
  options: { collectionId: number },
): Promise<{ createdQuestions: number }> {
  const q = new URLSearchParams({ collectionId: String(options.collectionId) });
  const res = await fetch(apiUrl(`/quizz/collections/questions/import-app?${q.toString()}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
  return res.json() as Promise<{ createdQuestions: number }>;
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

export async function downloadDatabaseExport(
  path: "/admin/database/export.sql" | "/admin/database/export.json",
  fallbackFilename: string,
): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(apiUrl(path));
  await assertResponseOk(res);

  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/i);

  return {
    blob,
    filename: match?.[1] ?? fallbackFilename,
  };
}

export async function downloadDatabaseSqlExport(): Promise<{ blob: Blob; filename: string }> {
  return downloadDatabaseExport("/admin/database/export.sql", "quizz-export.sql");
}

export async function downloadDatabaseJsonExport(): Promise<{ blob: Blob; filename: string }> {
  return downloadDatabaseExport("/admin/database/export.json", "quizz-export.json");
}

export type DatabaseJsonMergeResult = {
  insertedRows: number;
  skippedRows: number;
  remappedIds: number;
  warnings: string[];
};

export async function postDatabaseJsonMerge(payload: unknown): Promise<DatabaseJsonMergeResult> {
  const res = await fetch(apiUrl("/admin/database/import.json"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await assertResponseOk(res);
  return res.json() as Promise<DatabaseJsonMergeResult>;
}

export type DatabaseSqlReplaceResult = {
  statementsExecuted: number;
};

export async function postDatabaseSqlReplace(script: string): Promise<DatabaseSqlReplaceResult> {
  const res = await fetch(apiUrl("/admin/database/import.sql"), {
    method: "POST",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Quizz-Confirm": "REMPLACE_TOUT",
    },
    body: script,
  });
  await assertResponseOk(res);
  return res.json() as Promise<DatabaseSqlReplaceResult>;
}
