import { useQuestionsLlmImportOptionsPanel } from "./QuestionsLlmImportOptionsPanel.hook";
import { QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES } from "./QuestionsLlmImportOptionsPanel.styles";
import type { QuestionsLlmImportOptionsPanelProps } from "./QuestionsLlmImportOptionsPanel.types";

export type {
  BaseOption,
  LlmImportCaseACocherOption,
  LlmImportListeSelectionOption,
  LlmImportOption,
  LlmImportOptionValue,
  LlmImportTexteOption,
  QuestionsLlmImportOptionsPanelProps,
} from "./QuestionsLlmImportOptionsPanel.types";

export { CATEGORY_OPTION_ID } from "./QuestionsLlmImportOptionsPanel.types";

export function QuestionsLlmImportOptionsPanel(props: QuestionsLlmImportOptionsPanelProps) {
  const { bandeauCategories, champs } = useQuestionsLlmImportOptionsPanel(props);

  return (
    <aside class={QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.aside}>
      <p class={QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.titreSection}>Options</p>
      {bandeauCategories.messageAvertissement ? (
        <div class={QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.alerteCategories}>{bandeauCategories.messageAvertissement}</div>
      ) : null}
      {champs.options.map((option) => {
        if (option.type === "liste_selection") {
          return (
            <div key={option.id}>
              <label class={QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.etiquetteChamp} for={option.id}>
                {option.titre}
              </label>
              <select
                id={option.id}
                class={QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.select}
                value={String(option.value ?? "")}
                onChange={(e) =>
                  champs.updateOption(option.id, (current) => ({ ...current, value: (e.target as HTMLSelectElement).value }))
                }
              >
                {option.liste_choix.map((choix) => (
                  <option key={choix} value={choix}>
                    {choix}
                  </option>
                ))}
              </select>
            </div>
          );
        }
        if (option.type === "texte") {
          return (
            <div key={option.id}>
              <label class={QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.etiquetteChamp} for={option.id}>
                {option.titre}
              </label>
              {option.multiline ? (
                <textarea
                  id={option.id}
                  class={QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.textarea}
                  placeholder={option.contenus}
                  value={String(option.value ?? "")}
                  onInput={(e) =>
                    champs.updateOption(option.id, (current) => ({ ...current, value: (e.target as HTMLTextAreaElement).value }))
                  }
                />
              ) : (
                <input
                  id={option.id}
                  type="text"
                  class={QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.inputTexte}
                  placeholder={option.contenus}
                  value={String(option.value ?? "")}
                  onInput={(e) =>
                    champs.updateOption(option.id, (current) => ({ ...current, value: (e.target as HTMLInputElement).value }))
                  }
                />
              )}
            </div>
          );
        }
        return (
          <label
            key={option.id}
            class={`${QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.etiquetteCaseBase} ${
              option.disabled
                ? QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.etiquetteCaseDesactivee
                : QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.etiquetteCaseActive
            }`}
          >
            <input
              type="checkbox"
              class={QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.caseACocher}
              checked={Boolean(option.value)}
              disabled={option.disabled}
              onChange={(e) => void champs.runCheckboxOption(option, (e.target as HTMLInputElement).checked)}
            />
            <span>
              <span class={QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.etiquetteCaseTitre}>{option.titre}</span>
              {option.description}
            </span>
          </label>
        );
      })}
      <p class={QUESTIONS_LLM_IMPORT_OPTIONS_PANEL_STYLES.piedAide}>Ces champs sont injectés dans le prompt copié pour le LLM.</p>
    </aside>
  );
}
