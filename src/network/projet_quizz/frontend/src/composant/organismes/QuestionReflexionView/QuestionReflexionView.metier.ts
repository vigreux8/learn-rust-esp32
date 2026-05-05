import type { LlmImportQuestion } from "../../molecules/QuestionsLlmImportPanel";
import type { QuestionCategorieKey } from "../../../lib/questionCategories";
import type { RefCategorieRow, GroupeQuestionsUi, QuizzQuestionRow } from "../../../types/quizz";
import type { ReflexionLocalPoolDraft } from "./QuestionReflexionView.types";

/** Groupe @dnd-kit/sortable pour la colonne « questions ordonnées ». */
export const REFLEXION_ORDERED_SORT_GROUP = "reflexion-ordered-chain";

/**
 * Préfixe des droppables « fentes » entre vignettes (`${prefix}${index}`).
 * L’index correspond à une insertion avant la vignette `index`, ou après la dernière si `index === longueur`.
 */
export const REFLEXION_ORDERED_INSERT_PREFIX = "reflexion-insert-";

let localDraftIdSeq = 0;

/** Identifiants négatifs : brouillons non persistés (import LLM local). */
export function allocateReflexionLocalDraftId(): number {
  localDraftIdSeq += 1;
  return -localDraftIdSeq;
}

export function resetReflexionLocalDraftIdCounter(): void {
  localDraftIdSeq = 0;
}

export function refCategorieIdForLlmKey(
  refCategories: RefCategorieRow[],
  key: QuestionCategorieKey,
): number | null {
  const row = refCategories.find((c) => c.type.trim().toLowerCase() === key);
  return row?.id ?? null;
}

/** Construit une ligne UI pour le pool local (aucune ligne DB). */
export function buildReflexionLocalDraftRow(p: {
  id: number;
  userId: number;
  categorieKey: QuestionCategorieKey;
  categorieId: number;
  collectionId: number | null;
  collectionNom: string | null;
  q: LlmImportQuestion;
}): QuizzQuestionRow {
  const now = new Date().toISOString();
  const nomCol = p.collectionNom?.trim() !== "" ? p.collectionNom!.trim() : "Collection";
  return {
    id: p.id,
    user_id: p.userId,
    create_at: now,
    question: p.q.question,
    commentaire: p.q.commentaire,
    verifier: false,
    categorie_id: p.categorieId,
    categorie_type: p.categorieKey,
    categorie_e_id: null,
    categorie_e_type: null,
    importance_id: null,
    importance_lvl: null,
    difficulter_id: null,
    difficulter_lvl: null,
    collections:
      p.collectionId != null
        ? [{ id: p.collectionId, nom: nomCol }]
        : [],
  };
}

export function buildReflexionLocalPoolDraftsFromImport(p: {
  questions: LlmImportQuestion[];
  userId: number;
  categorieKey: QuestionCategorieKey;
  categorieId: number;
  collectionId: number | null;
  collectionNom: string | null;
}): ReflexionLocalPoolDraft[] {
  const out: ReflexionLocalPoolDraft[] = [];
  for (const q of p.questions) {
    const id = allocateReflexionLocalDraftId();
    out.push({
      id,
      categorie_id: p.categorieId,
      payload: q,
      row: buildReflexionLocalDraftRow({
        id,
        userId: p.userId,
        categorieKey: p.categorieKey,
        categorieId: p.categorieId,
        collectionId: p.collectionId,
        collectionNom: p.collectionNom,
        q,
      }),
    });
  }
  return out;
}

export function arrayMoveIds(ids: number[], from: number, to: number): number[] {
  if (from === to) {
    return ids;
  }
  if (from < 0 || to < 0 || from >= ids.length || to >= ids.length) {
    return ids;
  }
  const next = [...ids];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

/** Répartit les lignes « ordonnées » / « pool » selon une nouvelle liste d’ids (brouillon local). */
export function partitionRowsByOrderedIds(
  nextIds: number[],
  ordered: QuizzQuestionRow[],
  pool: QuizzQuestionRow[],
): { ordered: QuizzQuestionRow[]; pool: QuizzQuestionRow[] } {
  const byId = new Map<number, QuizzQuestionRow>();
  for (const q of [...ordered, ...pool]) {
    byId.set(q.id, q);
  }
  const nextOrdered: QuizzQuestionRow[] = [];
  for (const id of nextIds) {
    const q = byId.get(id);
    if (q != null) {
      nextOrdered.push(q);
    }
  }
  const inOrdered = new Set(nextIds);
  const nextPool = [...byId.values()].filter((q) => !inOrdered.has(q.id));
  return { ordered: nextOrdered, pool: nextPool };
}

/** Libellé affiché : première ligne de `description`, sinon identifiant de secours. */
export function titreGroupeQuestion(g: GroupeQuestionsUi): string {
  const d = g.description?.trim() ?? "";
  if (d !== "") {
    const first = d.split("\n")[0]?.trim();
    if (first) {
      return first;
    }
  }
  return `Suite #${g.id}`;
}

/** Inverse le format serveur `nom\nsuite de description`. */
export function parseGroupeQuestionsPourFormulaire(g: GroupeQuestionsUi): {
  nom: string;
  description: string;
} {
  const d = g.description?.trim() ?? "";
  if (d === "") {
    return { nom: titreGroupeQuestion(g), description: "" };
  }
  const idx = d.indexOf("\n");
  if (idx === -1) {
    return { nom: d, description: "" };
  }
  return { nom: d.slice(0, idx).trim(), description: d.slice(idx + 1).trim() };
}
