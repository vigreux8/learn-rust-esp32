import type { RefCategorieRow } from "../types/quizz";

export type ParsedCreateQuestionLlm = {
  question: string;
  commentaire: string;
  categorie_id: number;
  reponses: { texte: string; correcte: boolean }[];
};

function stripJsonFence(s: string): string {
  const t = s.trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return m ? m[1].trim() : t;
}

function normalizeReponseRow(r: unknown): { texte: string; correcte: boolean } | null {
  if (r == null || typeof r !== "object") return null;
  const o = r as Record<string, unknown>;
  if (typeof o.texte === "string" && typeof o.correcte === "boolean") {
    return { texte: o.texte, correcte: o.correcte };
  }
  if (typeof o.reponse === "string" && typeof o.bonne_reponse === "boolean") {
    return { texte: o.reponse, correcte: o.bonne_reponse };
  }
  if (typeof o.reponse === "string" && typeof o.correcte === "boolean") {
    return { texte: o.reponse, correcte: o.correcte };
  }
  return null;
}

function resolveCategorieId(
  parsed: Record<string, unknown>,
  options: RefCategorieRow[],
  fallbackId: number | null,
): number | null {
  const idRaw = parsed.categorie_id;
  if (typeof idRaw === "number" && Number.isInteger(idRaw) && idRaw >= 1) {
    if (options.some((c) => c.id === idRaw)) return idRaw;
  }
  if (typeof idRaw === "string" && /^\d+$/.test(idRaw.trim())) {
    const n = Number(idRaw.trim());
    if (options.some((c) => c.id === n)) return n;
  }
  const typeRaw = parsed.categorie_type;
  if (typeof typeRaw === "string" && typeRaw.trim().length > 0) {
    const t = typeRaw.trim().toLowerCase();
    const hit = options.find((c) => c.type.trim().toLowerCase() === t);
    if (hit) return hit.id;
  }
  if (fallbackId != null && options.some((c) => c.id === fallbackId)) return fallbackId;
  return options[0]?.id ?? null;
}

/**
 * Interprète un JSON collé depuis un LLM pour pré-remplir le formulaire « nouvelle question ».
 */
export function parseCreateQuestionLlmJson(
  raw: string,
  opts: { categorieOptions: RefCategorieRow[]; fallbackCategorieId: number | null },
): { ok: true; value: ParsedCreateQuestionLlm } | { ok: false; error: string } {
  const options = opts.categorieOptions;
  if (options.length === 0) {
    return { ok: false, error: "Aucune catégorie disponible." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(raw)) as unknown;
  } catch {
    return { ok: false, error: "JSON invalide (syntaxe)." };
  }
  if (parsed == null || typeof parsed !== "object") {
    return { ok: false, error: "Le JSON doit être un objet." };
  }
  const o = parsed as Record<string, unknown>;
  const question =
    typeof o.question === "string"
      ? o.question.trim()
      : typeof o.enonce === "string"
        ? o.enonce.trim()
        : "";
  if (question.length === 0) {
    return { ok: false, error: 'Champ "question" (ou "enonce") obligatoire et non vide.' };
  }
  let commentaire = "";
  if (typeof o.commentaire === "string") commentaire = o.commentaire;
  else if (typeof o.anecdote === "string") commentaire = o.anecdote;
  commentaire = commentaire.trim();

  const categorie_id = resolveCategorieId(o, options, opts.fallbackCategorieId);
  if (categorie_id == null) {
    return { ok: false, error: "Impossible de résoudre categorie_id / categorie_type." };
  }

  const repsRaw = o.reponses;
  if (!Array.isArray(repsRaw)) {
    return { ok: false, error: 'Tableau "reponses" obligatoire.' };
  }
  if (repsRaw.length !== 4) {
    return { ok: false, error: "Exactement 4 réponses sont attendues." };
  }
  const reponses: { texte: string; correcte: boolean }[] = [];
  for (let i = 0; i < 4; i += 1) {
    const row = normalizeReponseRow(repsRaw[i]);
    if (row == null) {
      return {
        ok: false,
        error: `Réponse ${i + 1} : format attendu { "texte", "correcte" } ou { "reponse", "bonne_reponse" }.`,
      };
    }
    const texte = row.texte.trim();
    if (texte.length === 0) {
      return { ok: false, error: `Réponse ${i + 1} : texte vide.` };
    }
    reponses.push({ texte, correcte: row.correcte });
  }
  const nTrue = reponses.filter((r) => r.correcte).length;
  if (nTrue !== 1) {
    return { ok: false, error: 'Exactement une réponse doit avoir "correcte" / "bonne_reponse" à true.' };
  }

  return { ok: true, value: { question, commentaire, categorie_id, reponses } };
}

/**
 * Texte à copier vers un LLM : consigne + brouillon d’énoncé (une seule saisie auteur) + format JSON attendu.
 */
export function buildLlmCreateQuestionPrompt(
  enonceAuteur: string,
  categorieOptions: RefCategorieRow[],
): string {
  const types = categorieOptions.map((c) => `"${c.type}"`).join(", ");
  const ids = categorieOptions.map((c) => `${c.id} = ${c.type}`).join(" ; ");
  const stem = enonceAuteur.trim();
  const brouillon =
    stem.length > 0
      ? stem
      : "(l’auteur n’a pas encore rédigé de brouillon : invente une question cohérente avec la catégorie et propose les réponses.)";
  return `Tu complètes une question de quiz FlowLearn.

L’auteur a écrit UNE SEULE FOIS un brouillon d’intention (idée, phrase brute ou ébauche). Tu ne dois pas le recopier tel quel dans le JSON : tu le transformes en une vraie question de QCM claire, fluide et correcte grammaticalement.

Brouillon d’énoncé (matière première — à reformuler dans "question") :
---
${brouillon}
---

Dans le JSON de sortie :
- "question" : la version reformulée et soignée du brouillon (énoncé final du QCM, une phrase ou deux au plus si nécessaire).
- "commentaire" : une courte anecdote ou explication pédagogique affichée après la révélation de la bonne réponse ; ne recopie pas mot pour mot la bonne proposition ; reste utile et factuel.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown (pas de \`\`\`), sans texte avant ni après.

Format exact attendu :
{
  "question": "string — énoncé final (reformulation du brouillon)",
  "commentaire": "string — anecdote / complément après le quiz (peut être une phrase courte)",
  "categorie_type": "string — une seule valeur parmi : ${types}",
  "reponses": [
    { "texte": "proposition 1", "correcte": false },
    { "texte": "proposition 2", "correcte": true },
    { "texte": "proposition 3", "correcte": false },
    { "texte": "proposition 4", "correcte": false }
  ]
}

Contraintes :
- exactement 4 éléments dans "reponses" ;
- exactement une seule avec "correcte": true ;
- "categorie_type" doit être l’un des libellés listés ci-dessus.

Référence des id (tu peux utiliser "categorie_id": nombre à la place de "categorie_type" si tu préfères) : ${ids}

Alternative acceptée pour chaque réponse : { "reponse": "...", "bonne_reponse": true|false } au lieu de texte/correcte.`;
}
