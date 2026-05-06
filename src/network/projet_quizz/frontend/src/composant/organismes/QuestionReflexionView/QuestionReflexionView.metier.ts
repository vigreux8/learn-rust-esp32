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

/** Préfixe des droppables sur chaque vignette ordonnée (réception couleur). */
export { REFLEXION_COLOR_TARGET_PREFIX, parseReflexionColorTargetId, reflexionColorTargetId } from "../../../lib/reflexionChainColors";

/** Pastilles palette → vignette (`useDraggable` data.type). */
export const REFLEXION_DRAG_PALETTE_TYPE = "reflexion-palette";

/** Charge API → état local (clés numériques). */
export function chainColorLevelsFromApi(raw: Record<string, number> | undefined): Record<number, number> {
  if (raw == null || typeof raw !== "object") return {};
  const out: Record<number, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    const id = Number(k);
    if (Number.isInteger(id) && typeof v === "number" && v >= 0 && v <= 3) {
      out[id] = v;
    }
  }
  return out;
}

/** Enregistrement : uniquement ids > 0 (questions réelles). */
export function chainColorLevelsRecordForApi(levels: Record<number, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(levels)) {
    const id = Number(k);
    if (Number.isInteger(id) && id > 0 && typeof v === "number" && v >= 0 && v <= 3) {
      out[String(id)] = v;
    }
  }
  return out;
}

export function filterChainColorLevelsToOrderedIds(
  levels: Record<number, number>,
  orderedIds: number[],
): Record<number, number> {
  const allow = new Set(orderedIds);
  const out: Record<number, number> = {};
  for (const [k, v] of Object.entries(levels)) {
    const id = Number(k);
    if (allow.has(id)) out[id] = v;
  }
  return out;
}

export function serializeChainColorLevelsForDirty(levels: Record<number, number>): string {
  const entries = Object.entries(levels)
    .map(([k, v]) => [Number(k), v] as [number, number])
    .filter(([k, v]) => Number.isInteger(k) && typeof v === "number")
    .sort((a, b) => a[0] - b[0]);
  return JSON.stringify(Object.fromEntries(entries.map(([k, v]) => [String(k), v])));
}

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

/** Après création en base des brouillons (id négatif → id positif), réécrit les clés des niveaux couleur. */
export function remapChainColorLevelsAfterDraftReplace(
  levels: Record<number, number>,
  idReplace: Map<number, number>,
): Record<number, number> {
  if (idReplace.size === 0) return levels;
  const out: Record<number, number> = {};
  for (const [kStr, v] of Object.entries(levels)) {
    const k = Number(kStr);
    if (!Number.isInteger(k) || typeof v !== "number") continue;
    const nk = k < 0 ? idReplace.get(k) ?? k : k;
    if (nk > 0 && v >= 0 && v <= 3) out[nk] = v;
  }
  return out;
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
