import { QUESTION_CATEGORIE_KEYS, type QuestionCategorieKey } from "../../../lib/questionCategories";

import { CATEGORY_OPTION_ID, type LlmImportListeSelectionOption, type LlmImportOptionValue } from "./QuestionsLlmImportOptionsPanel.types";

export function buildCategoryOption(
  currentValue: LlmImportOptionValue,
  listeChoix: readonly QuestionCategorieKey[],
): LlmImportListeSelectionOption {
  const fallbackValue = listeChoix[0] ?? QUESTION_CATEGORIE_KEYS[0];
  const normalizedValue =
    typeof currentValue === "string" && listeChoix.includes(currentValue as QuestionCategorieKey) ? currentValue : fallbackValue;
  return {
    id: CATEGORY_OPTION_ID,
    titre: "Catégorie (enregistrée en base)",
    type: "liste_selection",
    liste_choix: [...listeChoix],
    value: normalizedValue,
  };
}
