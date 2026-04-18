export const CATEGORY_OPTION_ID = "categorie";

export type LlmImportOptionValue = string | number | boolean | null;

/** Propriétés communes à toutes les options du panneau d’import LLM. */
export interface BaseOption {
  id: string;
  titre: string;
  value: LlmImportOptionValue;
}

export type LlmImportOption =
  | (BaseOption & { 
    type: "liste_selection"; 
    liste_choix: string[] })
  | (BaseOption & { 
    type: "texte"; 
    contenus: string; 
    multiline?: boolean })
  | (BaseOption & {
      type: "case_a_cocher";
      description: string;
      disabled?: boolean;
      /**
       * Attention : stocker une fonction dans le state peut poser des soucis de sérialisation.
       * Si absent, la case cochée ne met à jour la valeur que via le flux UI standard (sans effet async).
       */
      action?: () => Promise<LlmImportOptionValue> | LlmImportOptionValue;
    });

export type LlmImportListeSelectionOption = Extract<LlmImportOption, { type: "liste_selection" }>;
export type LlmImportTexteOption = Extract<LlmImportOption, { type: "texte" }>;
export type LlmImportCaseACocherOption = Extract<LlmImportOption, { type: "case_a_cocher" }>;

export type QuestionsLlmImportOptionsPanelProps = {
  data: {
    options: LlmImportOption[];
  };
  actions: {
    onOptionsChange: (options: LlmImportOption[]) => void;
  };
};
