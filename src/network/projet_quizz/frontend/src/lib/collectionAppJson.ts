import type { CollectionUi, QuestionUi } from "../types/quizz";
import type { LlmImportReponse } from "../composant/molecules/QuestionsLlmImportPanel";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function localTimestampForFilename(d = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}_${pad2(d.getHours())}-${pad2(
    d.getMinutes(),
  )}-${pad2(d.getSeconds())}`;
}

function sanitizeFilenamePart(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "collection";
  return trimmed
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function triggerJsonDownload(filename: string, payload: unknown) {
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function questionUiToAppExportQuestion(q: QuestionUi): {
  categorie_id: number;
  categorie_type: string;
  question: string;
  commentaire: string;
  fakechecker: boolean;
  reponses: [LlmImportReponse, LlmImportReponse, LlmImportReponse, LlmImportReponse];
} {
  const reponses = [...q.reponses];
  if (reponses.length !== 4) {
    throw new Error(`Question ${q.id} : 4 réponses attendues pour l’export (reçu ${reponses.length}).`);
  }

  let correct = 0;
  for (const r of reponses) {
    if (r.bonne_reponse) correct += 1;
  }
  if (correct !== 1) {
    throw new Error(`Question ${q.id} : exactement une bonne réponse attendue pour l’export.`);
  }

  return {
    categorie_id: q.categorie_id,
    categorie_type: q.categorie_type,
    question: q.question,
    commentaire: q.commentaire ?? "",
    fakechecker: q.verifier,
    reponses: reponses.map((r) => ({
      texte: r.reponse,
      correcte: r.bonne_reponse,
    })) as [LlmImportReponse, LlmImportReponse, LlmImportReponse, LlmImportReponse],
  };
}

/**
 * Export JSON “application” : conserve `ref_categorie.id` (et le type en lecture seule).
 * Pas d’identifiants collection / utilisateur. À l’import, l’app crée une collection avec `collection.nom` puis appelle
 * `POST /quizz/collections/questions/import-app?collectionId=…` avec l’id créé.
 */
export function downloadCollectionAsAppJson(collection: CollectionUi): void {
  const questions = collection.questions.map(questionUiToAppExportQuestion);
  const payload = {
    format: "flowlearn-app-collection-export",
    version: 1,
    exportedAt: new Date().toISOString(),
    collection: { nom: collection.nom },
    questions,
  };

  const safeName = sanitizeFilenamePart(collection.nom);
  const filename = `${safeName}-${localTimestampForFilename()}.json`;
  triggerJsonDownload(filename, payload);
}
