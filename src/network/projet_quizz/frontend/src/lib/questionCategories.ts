import type { RefCategorieRow } from "../types/quizz";

/**
 * Types `ref_categorie` supportés explicitement par le frontend.
 * La comparaison avec la base permet d’avertir si une nouvelle catégorie
 * existe côté backend mais n’a pas encore été câblée ici.
 */
export const QUESTION_CATEGORIE_KEYS = ["histoire", "pratique", "connaissance"] as const;

/**
 * Types `ref_p_categorie` (seed Prisma / v4).
 * - histoire : information, contexte, culture.
 * - pratique : mise en situation, application et cas d’usage.
 * - connaissance : faits, définitions, repères à maîtriser (savoir structuré).
 */
export const QUESTION_CATEGORIE_DEFINITIONS = {
  histoire:
    "Questions plutôt « information » : contexte, repères, culture — le « pourquoi / qu’est-ce que ».",
  pratique:
    "Questions sur comment appliquer l’information et dans quels cas l’utiliser — mise en situation et usage.",
  connaissance:
    "Questions de savoir structuré : définitions, formules, repères factuels à connaître ou reconnaître.",
} as const satisfies Record<(typeof QUESTION_CATEGORIE_KEYS)[number], string>;

export type QuestionCategorieKey = (typeof QUESTION_CATEGORIE_KEYS)[number];

export function isQuestionCategorieKey(value: string): value is QuestionCategorieKey {
  return QUESTION_CATEGORIE_KEYS.includes(value as QuestionCategorieKey);
}

export function getQuestionCategorieSyncWarning(refCategories: RefCategorieRow[]): string | null {
  const backendTypes = Array.from(new Set(refCategories.map((entry) => entry.type.trim()).filter(Boolean)));
  const unknownBackendTypes = backendTypes.filter((type) => !isQuestionCategorieKey(type));

  if (unknownBackendTypes.length > 0) {
    return `Attention : la base expose des types non gérés par l’interface : ${unknownBackendTypes.join(", ")}. Étends QUESTION_CATEGORIE_KEYS / QUESTION_CATEGORIE_DEFINITIONS dans questionCategories.ts.`;
  }

  return null;
}

/** Valeur pour la query `categorie` de l’import LLM (défaut : histoire). */
export function normalizeLlmImportCategorie(value: string): QuestionCategorieKey {
  const v = value.trim().toLowerCase();
  if (isQuestionCategorieKey(v)) return v;
  return "histoire";
}

export function getSupportedQuestionCategories(refCategories: RefCategorieRow[]): QuestionCategorieKey[] {
  const backendSupported = Array.from(
    new Set(refCategories.map((entry) => entry.type).filter(isQuestionCategorieKey)),
  );
  return backendSupported.length > 0 ? backendSupported : [...QUESTION_CATEGORIE_KEYS];
}

const PARENT_LABEL_FR: Record<QuestionCategorieKey, string> = {
  histoire: "Histoire",
  pratique: "Pratique",
  connaissance: "Connaissance",
};

/** Libellés des sous-catégories v4 (`ref_e_categorie.type`, seed Prisma). */
const ENFANT_LABEL_FR: Record<string, string> = {
  contexte: "Contexte",
  date: "Date",
  choix: "Choix",
  formule: "Formule",
};

export function formatQuestionCategorieParentLabel(type: string): string {
  if (isQuestionCategorieKey(type)) return PARENT_LABEL_FR[type];
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatQuestionCategorieEnfantLabel(type: string): string {
  return ENFANT_LABEL_FR[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

/** Texte court pour l’UI (parent seul ou parent › enfant). */
export function formatQuestionCategorieResume(q: {
  categorie_type: string;
  categorie_e_type: string | null;
}): string {
  const p = formatQuestionCategorieParentLabel(q.categorie_type);
  if (q.categorie_e_type) {
    return `${p} › ${formatQuestionCategorieEnfantLabel(q.categorie_e_type)}`;
  }
  return p;
}
