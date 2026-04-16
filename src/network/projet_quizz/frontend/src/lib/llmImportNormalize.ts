import type {
  LlmImportCollectionBlock,
  LlmImportPayload,
  LlmImportQuestion,
  LlmImportReponse,
} from "../composant/molecules/QuestionsLlmImportPanel";

function parseReponses(value: unknown, ctx: string): LlmImportQuestion["reponses"] {
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
  return out as LlmImportQuestion["reponses"];
}

function parseQuestion(value: unknown, ctx: string): LlmImportQuestion {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${ctx} : objet question attendu.`);
  }
  const raw = value as Record<string, unknown>;
  if (typeof raw.question !== "string" || raw.question.trim() === "") {
    throw new Error(`${ctx} : "question" non vide requise.`);
  }
  const commentaire = typeof raw.commentaire === "string" ? raw.commentaire.trim() : "";
  return {
    question: raw.question.trim(),
    commentaire,
    reponses: parseReponses(raw.reponses, `${ctx}.reponses`),
  };
}

function parseQuestionsArray(value: unknown, ctx: string): LlmImportQuestion[] {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new Error(`${ctx} : tableau attendu.`);
  }
  return value.map((q, index) => parseQuestion(q, `${ctx}[${index}]`));
}

function parseCollections(value: unknown): LlmImportCollectionBlock[] {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new Error(`collections : tableau attendu.`);
  }
  return value.map((block, index) => {
    if (!block || typeof block !== "object" || Array.isArray(block)) {
      throw new Error(`collections[${index}] : objet attendu.`);
    }
    const raw = block as Record<string, unknown>;
    if (typeof raw.nom !== "string" || raw.nom.trim() === "") {
      throw new Error(`collections[${index}] : "nom" non vide requis.`);
    }
    const questions = parseQuestionsArray(raw.questions, `collections[${index}].questions`);
    if (questions.length === 0) {
      throw new Error(`collections[${index}] : au moins une question requise.`);
    }
    return { nom: raw.nom.trim(), questions };
  });
}

/** Valide et normalise le texte JSON pour l’import LLM (mêmes règles que l’écran Questions). */
export function normalizeAndValidateImportText(importText: string): LlmImportPayload {
  const parsed = JSON.parse(importText) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON invalide : objet racine attendu.");
  }
  const root = parsed as Record<string, unknown>;

  const userIdRaw = root.user_id;
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
      throw new Error(`user_id : entier positif attendu.`);
    }
  }

  const rootQuestions = parseQuestionsArray(root.questions, "questions");
  const collections = parseCollections(root.collections);
  const questionsSansCollection = parseQuestionsArray(
    root.questions_sans_collection,
    "questions_sans_collection",
  );

  if (rootQuestions.length > 0 && (collections.length > 0 || questionsSansCollection.length > 0)) {
    throw new Error(
      `Format mixte interdit : utilise soit "questions", soit "collections"/"questions_sans_collection".`,
    );
  }

  const normalized: LlmImportPayload = {
    user_id: userId,
    collections,
    questions_sans_collection:
      rootQuestions.length > 0 ? rootQuestions : questionsSansCollection,
  };

  if (normalized.collections.length === 0 && normalized.questions_sans_collection.length === 0) {
    throw new Error(`Aucune question détectée dans le JSON.`);
  }
  return normalized;
}
