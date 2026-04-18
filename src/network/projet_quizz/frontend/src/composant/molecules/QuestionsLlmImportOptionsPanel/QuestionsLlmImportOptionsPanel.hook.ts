import { useEffect, useState } from "preact/hooks";

import { fetchRefCategories } from "../../../lib/api";
import { getQuestionCategorieSyncWarning, getSupportedQuestionCategories, QUESTION_CATEGORIE_KEYS, type QuestionCategorieKey } from "../../../lib/questionCategories";

import { buildCategoryOption } from "./QuestionsLlmImportOptionsPanel.metier";
import {
  CATEGORY_OPTION_ID,
  type LlmImportCaseACocherOption,
  type LlmImportOption,
  type QuestionsLlmImportOptionsPanelProps,
} from "./QuestionsLlmImportOptionsPanel.types";

export function useQuestionsLlmImportOptionsPanel(props: QuestionsLlmImportOptionsPanelProps) {
  const { data, actions } = props;
  const { options } = data;
  const { onOptionsChange } = actions;

  const [categoryChoices, setCategoryChoices] = useState<readonly QuestionCategorieKey[]>(QUESTION_CATEGORIE_KEYS);
  const [categoryWarning, setCategoryWarning] = useState<string | null>(null);

  useEffect(() => {
    fetchRefCategories()
      .then((rows) => {
        setCategoryChoices(getSupportedQuestionCategories(rows));
        setCategoryWarning(getQuestionCategorieSyncWarning(rows));
      })
      .catch(() => setCategoryChoices(QUESTION_CATEGORIE_KEYS));
  }, []);

  useEffect(() => {
    const currentCategoryOption = options.find((option) => option.id === CATEGORY_OPTION_ID);
    const nextCategoryOption = buildCategoryOption(currentCategoryOption?.value ?? null, categoryChoices);
    if (currentCategoryOption == null) return void onOptionsChange([nextCategoryOption, ...options]);
    if (currentCategoryOption.type !== "liste_selection") return;
    const sameValue = currentCategoryOption.value === nextCategoryOption.value;
    const sameChoices =
      currentCategoryOption.liste_choix.length === nextCategoryOption.liste_choix.length &&
      currentCategoryOption.liste_choix.every((value, index) => value === nextCategoryOption.liste_choix[index]);
    if (sameValue && sameChoices) return;
    onOptionsChange(options.map((option) => (option.id === CATEGORY_OPTION_ID ? { ...option, ...nextCategoryOption } : option)));
  }, [options, onOptionsChange, categoryChoices]);

  const updateOption = (id: string, updater: (option: LlmImportOption) => LlmImportOption) =>
    onOptionsChange(options.map((option) => (option.id === id ? updater(option) : option)));

  const runCheckboxOption = async (option: LlmImportCaseACocherOption, checked: boolean) => {
    if (!checked) return void updateOption(option.id, (current) => ({ ...current, value: false }));
    if (!option.action) return void updateOption(option.id, (current) => ({ ...current, value: true }));
    const result = await option.action();
    updateOption(option.id, (current) => ({ ...current, value: result }));
  };

  const bandeauCategories = {
    messageAvertissement: categoryWarning,
  };

  const champs = {
    options,
    updateOption,
    runCheckboxOption,
  };

  return {
    bandeauCategories,
    champs,
  };
}
