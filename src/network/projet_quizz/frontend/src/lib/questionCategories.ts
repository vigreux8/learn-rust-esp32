import type { RefCategorieRow } from "../types/quizz";

/**
 * Types `ref_categorie` supportés explicitement par le frontend.
 * La comparaison avec la base permet d’avertir si une nouvelle catégorie
 * existe côté backend mais n’a pas encore été câblée ici.
 */
export const QUESTION_CATEGORIE_KEYS = ["histoire", "pratique"] as const;

/**
 * Types `ref_categorie` (voir `ddb/inject.sql` et seed Prisma).
 * - histoire : plutôt information, contexte, culture.
 * - pratique : mise en situation, application et cas d’usage.
 */
export const QUESTION_CATEGORIE_DEFINITIONS = {
  histoire:
    "Questions plutôt « information » : contexte, repères, culture — le « pourquoi / qu’est-ce que ».",
  pratique:
    "Questions sur comment appliquer l’information et dans quels cas l’utiliser — mise en situation et usage.",
} as const satisfies Record<(typeof QUESTION_CATEGORIE_KEYS)[number], string>;

export type QuestionCategorieKey = (typeof QUESTION_CATEGORIE_KEYS)[number];

export function isQuestionCategorieKey(value: string): value is QuestionCategorieKey {
  return QUESTION_CATEGORIE_KEYS.includes(value as QuestionCategorieKey);
}

export function getQuestionCategorieSyncWarning(refCategories: RefCategorieRow[]): string | null {
  const backendTypes = Array.from(new Set(refCategories.map((entry) => entry.type.trim()).filter(Boolean)));
  const frontendTypes = [...QUESTION_CATEGORIE_KEYS];
  const unknownBackendTypes = backendTypes.filter((type) => !isQuestionCategorieKey(type));

  if (backendTypes.length !== frontendTypes.length || unknownBackendTypes.length > 0) {
    return `Attention : la base expose ${backendTypes.length} catégorie(s) (${backendTypes.join(", ") || "aucune"}) alors que le frontend en gère ${frontendTypes.length} (${frontendTypes.join(", ")}).`;
  }

  return null;
}

export function getSupportedQuestionCategories(refCategories: RefCategorieRow[]): QuestionCategorieKey[] {
  const backendSupported = Array.from(
    new Set(refCategories.map((entry) => entry.type).filter(isQuestionCategorieKey)),
  );
  return backendSupported.length > 0 ? backendSupported : [...QUESTION_CATEGORIE_KEYS];
}
