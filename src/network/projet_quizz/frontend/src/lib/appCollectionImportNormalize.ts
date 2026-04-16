import type { LlmImportReponse } from "../composant/molecules/QuestionsLlmImportPanel";

export type AppCollectionImportPayload = {
  format: "flowlearn-app-collection-export";
  version: 1;
  exportedAt?: string;
  user_id?: number;
  /** Métadonnée d’export ; la collection cible d’import est `?collectionId=` (ou id en JSON pour anciens fichiers). */
  collection: { nom: string; id?: number; user_id?: number };
  questions: {
    categorie_id: number;
    categorie_type: string;
    question: string;
    commentaire: string;
    reponses: [LlmImportReponse, LlmImportReponse, LlmImportReponse, LlmImportReponse];
  }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseReponses(value: unknown, ctx: string): AppCollectionImportPayload["questions"][number]["reponses"] {
  if (!Array.isArray(value) || value.length !== 4) {
    throw new Error(`${ctx} : il faut exactement 4 réponses.`);
  }
  const out: LlmImportReponse[] = [];
  let correctCount = 0;
  for (let i = 0; i < value.length; i++) {
    const item = value[i];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`${ctx}[${i}] : objet réponse attendu.`);
    }
    const raw = item as Record<string, unknown>;
    const texte = raw.texte ?? raw.reponse;
    if (typeof texte !== "string" || texte.trim() === "") {
      throw new Error(`${ctx}[${i}] : "texte" non vide requis.`);
    }
    const correcte = raw.correcte === true || raw.bonne_reponse === 1;
    if (correcte) correctCount += 1;
    out.push({ texte: texte.trim(), correcte });
  }
  if (correctCount !== 1) {
    throw new Error(`${ctx} : exactement une réponse doit être correcte.`);
  }
  return out as AppCollectionImportPayload["questions"][number]["reponses"];
}

function parseQuestion(value: unknown, ctx: string): AppCollectionImportPayload["questions"][number] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${ctx} : objet question attendu.`);
  }
  const raw = value as Record<string, unknown>;

  const categorieIdRaw = raw.categorie_id;
  if (typeof categorieIdRaw !== "number" || !Number.isInteger(categorieIdRaw) || categorieIdRaw < 1) {
    throw new Error(`${ctx} : categorie_id entier ≥ 1 requis.`);
  }

  const categorieType = raw.categorie_type;
  if (typeof categorieType !== "string" || categorieType.trim() === "") {
    throw new Error(`${ctx} : categorie_type non vide requis.`);
  }

  if (typeof raw.question !== "string" || raw.question.trim() === "") {
    throw new Error(`${ctx} : "question" non vide requise.`);
  }
  const commentaire = typeof raw.commentaire === "string" ? raw.commentaire.trim() : "";

  return {
    categorie_id: categorieIdRaw,
    categorie_type: categorieType.trim(),
    question: raw.question.trim(),
    commentaire,
    reponses: parseReponses(raw.reponses, `${ctx}.reponses`),
  };
}

/** Valide le JSON d’import “application” (export FlowLearn). */
export function normalizeAndValidateAppCollectionImportText(importText: string): AppCollectionImportPayload {
  const parsed = JSON.parse(importText) as unknown;
  if (!isRecord(parsed)) throw new Error("JSON invalide : objet racine attendu.");

  if (parsed.format !== "flowlearn-app-collection-export") {
    throw new Error(`JSON invalide : format "${String(parsed.format)}" — attendu "flowlearn-app-collection-export".`);
  }
  if (parsed.version !== 1) {
    throw new Error(`JSON invalide : version ${String(parsed.version)} — attendu 1.`);
  }

  const exportedAt = parsed.exportedAt;
  if (exportedAt != null && typeof exportedAt !== "string") {
    throw new Error("JSON invalide : exportedAt doit être une chaîne ISO si présent.");
  }

  const userIdRaw = parsed.user_id;
  let userId: number | undefined;
  if (userIdRaw != null) {
    if (typeof userIdRaw === "number" && Number.isInteger(userIdRaw) && userIdRaw > 0) {
      userId = userIdRaw;
    } else if (
      typeof userIdRaw === "string" &&
      /^\d+$/.test(userIdRaw.trim()) &&
      Number(userIdRaw.trim()) > 0
    ) {
      userId = Number(userIdRaw.trim());
    } else {
      throw new Error(`user_id : entier positif attendu si fourni.`);
    }
  }

  const colRaw = parsed.collection;
  if (!isRecord(colRaw)) throw new Error("JSON invalide : objet collection attendu.");
  const colNom = colRaw.nom;
  if (typeof colNom !== "string" || colNom.trim() === "") {
    throw new Error('collection.nom : chaîne non vide requise.');
  }

  let colId: number | undefined;
  const colIdRaw = colRaw.id;
  if (colIdRaw != null) {
    if (typeof colIdRaw === "number" && Number.isInteger(colIdRaw) && colIdRaw >= 1) {
      colId = colIdRaw;
    } else if (
      typeof colIdRaw === "string" &&
      /^\d+$/.test(colIdRaw.trim()) &&
      Number(colIdRaw.trim()) >= 1
    ) {
      colId = Number(colIdRaw.trim());
    } else {
      throw new Error("collection.id : entier ≥ 1 attendu si fourni.");
    }
  }

  let colUser: number | undefined;
  const colUserRaw = colRaw.user_id;
  if (colUserRaw != null) {
    if (typeof colUserRaw === "number" && Number.isInteger(colUserRaw) && colUserRaw >= 1) {
      colUser = colUserRaw;
    } else if (
      typeof colUserRaw === "string" &&
      /^\d+$/.test(colUserRaw.trim()) &&
      Number(colUserRaw.trim()) >= 1
    ) {
      colUser = Number(colUserRaw.trim());
    } else {
      throw new Error("collection.user_id : entier ≥ 1 attendu si fourni.");
    }
  }

  const qs = parsed.questions;
  if (!Array.isArray(qs) || qs.length === 0) {
    throw new Error("questions : tableau non vide requis.");
  }

  const questions = qs.map((q, index) => parseQuestion(q, `questions[${index}]`));

  const collection: AppCollectionImportPayload["collection"] = { nom: colNom.trim() };
  if (colId != null) collection.id = colId;
  if (colUser != null) collection.user_id = colUser;

  return {
    format: "flowlearn-app-collection-export",
    version: 1,
    exportedAt: typeof exportedAt === "string" ? exportedAt : undefined,
    user_id: userId,
    collection,
    questions,
  };
}
