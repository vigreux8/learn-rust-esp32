import { apiUrl } from "./config";
import type {
  CollectionUi,
  GroupeQuestionsUi,
  DeviceLookupResult,
  PersonalitePickerRowUi,
  QuestionUi,
  QuizzQuestionDetail,
  QuizzQuestionRow,
  RefCategorieHierarchyRow,
  RefCategorieRow,
  RefImportancePersonaliteUi,
  RefQuestionScaleRow,
  ReflexionChainEditorUi,
  SessionDetail,
  SessionSummary,
  SousCollectionUi,
  UserKpiRow,
} from "../types/quizz";
import type { LlmImportPayload } from "../composant/molecules/QuestionsLlmImportPanel";
import type { AppCollectionImportPayload } from "./appCollectionImportNormalize";
import type { ChildCollectionsMix, PlayOrder } from "./playOrder";

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
  opts?: {
    qtype?: "histoire" | "pratique" | "connaissance" | "melanger";
    orders?: PlayOrder[];
    userId?: number;
    infinite?: boolean;
    excludeIds?: number[];
    sousCollectionId?: number;
    includeChildCollections?: boolean;
    childCollectionsMix?: ChildCollectionsMix;
    familyQuotaPercent?: number;
    familyQuotaMax?: number;
    includePersonnaliteFiches?: boolean;
  },
): Promise<CollectionUi> {
  const p = new URLSearchParams();
  if (opts?.qtype != null && opts.qtype !== "melanger") {
    p.set("qtype", opts.qtype);
  }
  if (opts?.orders != null && opts.orders.length > 0) {
    p.set("order", opts.orders.join(","));
  }
  if (opts?.userId != null) {
    p.set("userId", String(opts.userId));
  }
  if (opts?.infinite) {
    p.set("infinite", "1");
  }
  if (opts?.excludeIds != null && opts.excludeIds.length > 0) {
    p.set("exclude", opts.excludeIds.join(","));
  }
  if (opts?.sousCollectionId != null) {
    p.set("sousCollectionId", String(opts.sousCollectionId));
  }
  if (opts?.includeChildCollections === true) {
    p.set("includeChildren", "1");
  }
  if (opts?.childCollectionsMix != null && opts.childCollectionsMix !== "melange") {
    p.set("childrenMix", opts.childCollectionsMix);
  }
  if (opts?.includeChildCollections === true) {
    if (opts.familyQuotaPercent != null && opts.familyQuotaPercent !== 100) {
      p.set("familyQuota", String(opts.familyQuotaPercent));
    }
    if (opts.familyQuotaMax != null && opts.familyQuotaMax > 0) {
      p.set("familyMax", String(opts.familyQuotaMax));
    }
  }
  if (opts?.includePersonnaliteFiches === true) {
    p.set("persoFiches", "1");
  }
  const q = p.size > 0 ? `?${p.toString()}` : "";
  const res = await fetch(apiUrl(`/quizz/collections/${id}${q}`));
  await assertResponseOk(res);
  return res.json() as Promise<CollectionUi>;
}

export async function assignCollectionTag(
  collectionId: number,
  tagCollectionId: number,
): Promise<CollectionUi> {
  const res = await fetch(apiUrl(`/quizz/collections/${collectionId}/collection-tags`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tagCollectionId }),
  });
  await assertResponseOk(res);
  return res.json() as Promise<CollectionUi>;
}

export async function unassignCollectionTag(
  collectionId: number,
  tagCollectionId: number,
): Promise<CollectionUi> {
  const res = await fetch(
    apiUrl(`/quizz/collections/${collectionId}/collection-tags/${tagCollectionId}`),
    { method: "DELETE" },
  );
  await assertResponseOk(res);
  return res.json() as Promise<CollectionUi>;
}

export async function fetchRefImportancePersonalite(): Promise<RefImportancePersonaliteUi[]> {
  const res = await fetch(apiUrl("/quizz/ref-importance-personnalite"));
  await assertResponseOk(res);
  return res.json() as Promise<RefImportancePersonaliteUi[]>;
}

export async function fetchPersonalitesPicker(): Promise<PersonalitePickerRowUi[]> {
  const res = await fetch(apiUrl("/quizz/personalites"));
  await assertResponseOk(res);
  return res.json() as Promise<PersonalitePickerRowUi[]>;
}

export type CreatePersonaliteCollectionBody = {
  userId: number;
  nom: string;
  prenom: string;
  naissance: number;
  mort?: number | null;
  resumer: string;
  tagCollectionId?: number;
};

export async function createPersonaliteCollection(
  body: CreatePersonaliteCollectionBody,
): Promise<CollectionUi> {
  const res = await fetch(apiUrl("/quizz/personalites/collections"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
  return res.json() as Promise<CollectionUi>;
}

export async function assignPersonaliteToCollection(
  collectionId: number,
  body: {
    userId: number;
    personaliteId: number;
    importanceType?: "pionnier" | "important" | "secondaire" | null;
  },
): Promise<CollectionUi> {
  const res = await fetch(apiUrl(`/quizz/collections/${collectionId}/personalites`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: body.userId,
      personaliteId: body.personaliteId,
      importanceType: body.importanceType ?? null,
    }),
  });
  await assertResponseOk(res);
  return res.json() as Promise<CollectionUi>;
}

export async function unassignPersonaliteFromCollection(
  collectionId: number,
  personaliteId: number,
  userId: number,
): Promise<CollectionUi> {
  const q = new URLSearchParams({ userId: String(userId) });
  const res = await fetch(
    apiUrl(`/quizz/collections/${collectionId}/personalites/${personaliteId}?${q.toString()}`),
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
  orders?: PlayOrder[];
  qtype?: "histoire" | "pratique" | "connaissance" | "melanger";
  userId?: number;
  infinite?: boolean;
  excludeIds?: number[];
}): Promise<QuestionUi[]> {
  const p = new URLSearchParams();
  if (opts?.orders != null && opts.orders.length > 0) {
    p.set("order", opts.orders.join(","));
  }
  if (opts?.qtype != null && opts.qtype !== "melanger") {
    p.set("qtype", opts.qtype);
  }
  if (opts?.userId != null) {
    p.set("userId", String(opts.userId));
  }
  if (opts?.infinite) {
    p.set("infinite", "1");
  }
  if (opts?.excludeIds != null && opts.excludeIds.length > 0) {
    p.set("exclude", opts.excludeIds.join(","));
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

export async function fetchRefCategoriesHierarchy(): Promise<RefCategorieHierarchyRow[]> {
  const res = await fetch(apiUrl("/quizz/categories/hierarchy"));
  await assertResponseOk(res);
  return res.json() as Promise<RefCategorieHierarchyRow[]>;
}

export async function fetchRefQuestionImportance(): Promise<RefQuestionScaleRow[]> {
  const res = await fetch(apiUrl("/quizz/ref-question-importance"));
  await assertResponseOk(res);
  return res.json() as Promise<RefQuestionScaleRow[]>;
}

export async function fetchRefQuestionDifficulte(): Promise<RefQuestionScaleRow[]> {
  const res = await fetch(apiUrl("/quizz/ref-question-difficulte"));
  await assertResponseOk(res);
  return res.json() as Promise<RefQuestionScaleRow[]>;
}

export async function fetchQuestionDetail(id: number): Promise<QuizzQuestionDetail> {
  const res = await fetch(apiUrl(`/quizz/questions/${id}`));
  await assertResponseOk(res);
  return res.json() as Promise<QuizzQuestionDetail>;
}

export async function deleteImplicitQuestionRelation(relationId: number): Promise<void> {
  const res = await fetch(apiUrl(`/quizz/questions/implicit-relations/${relationId}`), {
    method: "DELETE",
  });
  await assertResponseOk(res);
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

export async function fetchSousCollections(collectionId: number): Promise<SousCollectionUi[]> {
  const res = await fetch(apiUrl(`/quizz/collections/${collectionId}/sous-collections`));
  await assertResponseOk(res);
  return res.json() as Promise<SousCollectionUi[]>;
}

export async function fetchGroupeQuestions(collectionId: number): Promise<GroupeQuestionsUi[]> {
  const res = await fetch(apiUrl(`/quizz/collections/${collectionId}/groupe-questions`));
  await assertResponseOk(res);
  return res.json() as Promise<GroupeQuestionsUi[]>;
}

export async function postCreateGroupeQuestions(
  collectionId: number,
  body: { user_id: number; nom: string; description?: string },
): Promise<GroupeQuestionsUi> {
  const res = await fetch(apiUrl(`/quizz/collections/${collectionId}/groupe-questions`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
  return res.json() as Promise<GroupeQuestionsUi>;
}

export async function patchGroupeQuestions(
  groupeId: number,
  body: { user_id: number; nom: string; description?: string },
): Promise<GroupeQuestionsUi> {
  const res = await fetch(apiUrl(`/quizz/groupe-questions/${groupeId}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
  return res.json() as Promise<GroupeQuestionsUi>;
}

export async function deleteGroupeQuestions(groupeId: number, userId: number): Promise<void> {
  const q = new URLSearchParams({ userId: String(userId) });
  const res = await fetch(apiUrl(`/quizz/groupe-questions/${groupeId}?${q.toString()}`), {
    method: "DELETE",
  });
  await assertResponseOk(res);
}

export async function fetchReflexionChain(
  collectionId: number,
  groupeId?: number,
): Promise<ReflexionChainEditorUi> {
  const q =
    groupeId !== undefined && groupeId !== null ? `?groupeId=${encodeURIComponent(String(groupeId))}` : "";
  const res = await fetch(apiUrl(`/quizz/collections/${collectionId}/reflexion-chain${q}`));
  await assertResponseOk(res);
  return res.json() as Promise<ReflexionChainEditorUi>;
}

export async function patchReflexionChain(
  collectionId: number,
  body: {
    user_id: number;
    ordered_question_ids: number[];
    groupe_questions_id?: number;
    chain_color_levels?: Record<string, number>;
  },
): Promise<void> {
  const res = await fetch(apiUrl(`/quizz/collections/${collectionId}/reflexion-chain`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
}

export async function postCreateSousCollection(
  collectionId: number,
  body: { user_id: number; nom: string; description: string },
): Promise<SousCollectionUi> {
  const res = await fetch(apiUrl(`/quizz/collections/${collectionId}/sous-collections`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
  return res.json() as Promise<SousCollectionUi>;
}

export async function patchSousCollection(
  sousId: number,
  body: { user_id: number; nom: string; description: string },
): Promise<SousCollectionUi> {
  const res = await fetch(apiUrl(`/quizz/sous-collections/${sousId}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
  return res.json() as Promise<SousCollectionUi>;
}

export async function deleteSousCollection(sousId: number, userId: number): Promise<void> {
  const q = new URLSearchParams({ userId: String(userId) });
  const res = await fetch(apiUrl(`/quizz/sous-collections/${sousId}?${q.toString()}`), {
    method: "DELETE",
  });
  await assertResponseOk(res);
}

export async function postAttachQuestionToSousCollection(
  sousId: number,
  body: { user_id: number; question_id: number },
): Promise<void> {
  const res = await fetch(apiUrl(`/quizz/sous-collections/${sousId}/questions`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
}

export async function deleteDetachQuestionFromSousCollection(
  sousId: number,
  questionId: number,
  userId: number,
): Promise<void> {
  const q = new URLSearchParams({ userId: String(userId) });
  const res = await fetch(
    apiUrl(`/quizz/sous-collections/${sousId}/questions/${questionId}?${q.toString()}`),
    { method: "DELETE" },
  );
  await assertResponseOk(res);
}

export async function patchQuestion(
  id: number,
  body: {
    question?: string;
    commentaire?: string;
    categorie_id?: number;
    categorie_e_id?: number | null;
    verifier?: boolean;
    importance_id?: number | null;
    difficulter_id?: number | null;
  },
): Promise<QuizzQuestionRow> {
  const res = await fetch(apiUrl(`/quizz/questions/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertResponseOk(res);
  return res.json() as Promise<QuizzQuestionRow>;
}

export type CreateQuestionBody = {
  user_id: number;
  categorie_id: number;
  question: string;
  commentaire: string;
  reponses: { texte: string; correcte: boolean }[];
  collection_id?: number;
  parent_question_id?: number;
};

export async function postCreateQuestion(body: CreateQuestionBody): Promise<QuizzQuestionRow> {
  const res = await fetch(apiUrl("/quizz/questions"), {
    method: "POST",
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
  tagCollectionId?: number;
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
  options?: {
    collectionId?: number;
    tagCollectionId?: number;
    categorie?: "histoire" | "pratique" | "connaissance";
    sousCollectionId?: number;
  },
): Promise<{
  createdQuestions: number;
  createdCollections: number;
  /** Renvoyé pour un import avec `collectionId` : IDs des questions créées dans cette collection. */
  createdQuestionIds?: number[];
}> {
  const q = new URLSearchParams();
  if (options?.collectionId != null) {
    q.set("collectionId", String(options.collectionId));
  }
  if (options?.tagCollectionId != null) {
    q.set("tagCollectionId", String(options.tagCollectionId));
  }
  if (options?.categorie != null) {
    q.set("categorie", options.categorie);
  }
  if (options?.sousCollectionId != null) {
    q.set("sousCollectionId", String(options.sousCollectionId));
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
