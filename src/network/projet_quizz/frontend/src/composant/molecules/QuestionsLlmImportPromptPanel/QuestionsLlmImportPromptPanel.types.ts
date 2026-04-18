/**
 * @fileoverview Types du panneau `QuestionsLlmImportPromptPanel`.
 */

/**
 * Contrat de props du panneau « prompt LLM + collage JSON ».
 *
 * @typedef {Object} QuestionsLlmImportPromptPanelProps
 * @property {Object} data Données affichées en lecture seule dans le panneau.
 * @property {string} data.prompt Texte intégral du prompt destiné au LLM (textarea read-only + bouton Copier). Le parent le recalcule quand les entrées changent (ex. `buildPrompt(options)` ou `buildLlmCreateQuestionPrompt(...)`).
 * @property {Object} actions Callbacks fournis par le parent.
 * @property {function(string): Promise<string>} actions.importFromJson Traite le JSON saisi : en cas d’échec, lever `new Error(message)` (affiché sous la zone) ; en succès, retourner une chaîne (message de confirmation).
 * @property {Object} [settings] Configuration optionnelle d’UI (libellés, aide, désactivation). Si absent, le panneau applique des valeurs par défaut adaptées au flux « import collections ».
 * @property {string} [settings.submitLabel] Libellé du bouton principal hors traitement. **Défaut :** `Importer en base`.
 * @property {string} [settings.submitBusyLabel] Libellé du bouton pendant `importFromJson`. **Défaut :** `Import…`.
 * @property {string} [settings.pasteAreaInstruction] prompt qui remplace le prompt par défaut
 * @property {string} [settings.jsonPastePlaceholder] définie le format du json  que le llm vas générer
 * @property {boolean} [settings.disabled] Si `true`, désactive la copie du prompt, la saisie du JSON et le bouton d’action (ex. pendant une sauvegarde parent).
 * @property {string} [class] Classes CSS / Tailwind additionnelles sur le conteneur racine du panneau (largeur, marges, etc.).
 */
export type QuestionsLlmImportPromptPanelProps = {
  data: {
    prompt: string;
  };
  actions: {
    importFromJson: (importText: string) => Promise<string>;
  };
  settings?: {
    submitLabel?: string;
    submitBusyLabel?: string;
    pasteAreaInstruction?: string;
    jsonPastePlaceholder?: string;
    disabled?: boolean;
  };
  class?: string;
};
