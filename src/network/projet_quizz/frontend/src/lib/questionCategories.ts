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
} as const;

export type QuestionCategorieKey = keyof typeof QUESTION_CATEGORIE_DEFINITIONS;
