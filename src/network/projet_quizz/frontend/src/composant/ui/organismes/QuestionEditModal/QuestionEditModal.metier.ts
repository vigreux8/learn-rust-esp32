import type { CreateReponseDraft } from "./QuestionEditModal.types";

/**
 * Champs catégorie pour `PATCH /quizz/questions/:id` depuis la modale (hiérarchie ou liste plate).
 */
export function buildCategorieFieldsForQuestionPatch(input: {
  useHierarchy: boolean;
  detailCategorieId: number;
  detailCategorieEId: number | null;
  draftCategorieId: number | null;
  draftCategorieEId: number | null;
}): { categorie_id?: number; categorie_e_id?: number | null } {
  const { useHierarchy, detailCategorieId, detailCategorieEId, draftCategorieId, draftCategorieEId } = input;
  if (useHierarchy) {
    if (draftCategorieId == null) return {};
    const sameParent = draftCategorieId === detailCategorieId;
    const sameChild = (draftCategorieEId ?? null) === (detailCategorieEId ?? null);
    if (sameParent && sameChild) return {};
    if (!sameParent) {
      return { categorie_id: draftCategorieId, categorie_e_id: draftCategorieEId ?? null };
    }
    return { categorie_e_id: draftCategorieEId ?? null };
  }
  if (draftCategorieId != null && draftCategorieId !== detailCategorieId) {
    return { categorie_id: draftCategorieId };
  }
  return {};
}

export function defaultCreateReponses(): CreateReponseDraft[] {
  return [
    { texte: "", correcte: true },
    { texte: "", correcte: false },
    { texte: "", correcte: false },
    { texte: "", correcte: false },
  ];
}
