export type LlmImportOptionValue = string | number | boolean | null;

export type LlmImportOptionParent = {
  id: string;
  titre: string;
  value: LlmImportOptionValue;
};

export type LlmImportListeSelectionOption = LlmImportOptionParent & {
  type: "liste_selection";
  liste_choix: string[];
};

export type LlmImportTexteOption = LlmImportOptionParent & {
  type: "texte";
  contenus: string;
  multiline?: boolean;
};

export type LlmImportCaseACocherOption = LlmImportOptionParent & {
  type: "case_a_cocher";
  description: string;
  function: () => Promise<LlmImportOptionValue> | LlmImportOptionValue;
  disabled?: boolean;
};

export type LlmImportOption =
  | LlmImportListeSelectionOption
  | LlmImportTexteOption
  | LlmImportCaseACocherOption;

export type QuestionsLlmImportOptionsPanelProps = {
  options: LlmImportOption[];
  onOptionsChange: (options: LlmImportOption[]) => void;
};

export function QuestionsLlmImportOptionsPanel({
  options,
  onOptionsChange,
}: QuestionsLlmImportOptionsPanelProps) {
  const updateOption = (id: string, updater: (option: LlmImportOption) => LlmImportOption) => {
    onOptionsChange(options.map((option) => (option.id === id ? updater(option) : option)));
  };

  const runCheckboxOption = async (
    option: LlmImportCaseACocherOption,
    checked: boolean,
  ) => {
    if (!checked) {
      updateOption(option.id, (current) => ({ ...current, value: false }));
      return;
    }
    const result = await option.function();
    updateOption(option.id, (current) => ({ ...current, value: result }));
  };

  return (
    <aside class="flex w-full shrink-0 flex-col gap-4 rounded-xl border border-base-content/10 bg-base-100/60 p-3 lg:min-w-70 lg:max-w-xs">
      <p class="text-[0.65rem] font-semibold uppercase tracking-wide text-base-content/45">Options</p>
      {options.map((option) => {
        if (option.type === "liste_selection") {
          return (
            <div key={option.id}>
              <label class="mb-1 block text-xs font-medium text-base-content/70" for={option.id}>
                {option.titre}
              </label>
              <select
                id={option.id}
                class="select select-bordered select-sm w-full rounded-lg border-base-content/15 bg-base-100 text-sm"
                value={String(option.value ?? "")}
                onChange={(e) =>
                  updateOption(option.id, (current) => ({
                    ...current,
                    value: (e.target as HTMLSelectElement).value,
                  }))
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
              <label class="mb-1 block text-xs font-medium text-base-content/70" for={option.id}>
                {option.titre}
              </label>
              {option.multiline ? (
                <textarea
                  id={option.id}
                  class="textarea textarea-bordered w-full min-h-20 rounded-lg border-base-content/15 bg-base-100 text-sm"
                  placeholder={option.contenus}
                  value={String(option.value ?? "")}
                  onInput={(e) =>
                    updateOption(option.id, (current) => ({
                      ...current,
                      value: (e.target as HTMLTextAreaElement).value,
                    }))
                  }
                />
              ) : (
                <input
                  id={option.id}
                  type="text"
                  class="input input-bordered input-sm w-full rounded-lg border-base-content/15 bg-base-100 text-sm"
                  placeholder={option.contenus}
                  value={String(option.value ?? "")}
                  onInput={(e) =>
                    updateOption(option.id, (current) => ({
                      ...current,
                      value: (e.target as HTMLInputElement).value,
                    }))
                  }
                />
              )}
            </div>
          );
        }

        return (
          <label
            key={option.id}
            class={`flex items-start gap-2 rounded-lg border border-base-content/10 p-2 text-xs leading-snug ${
              option.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              class="checkbox checkbox-sm mt-0.5 shrink-0 border-base-content/30"
              checked={Boolean(option.value)}
              disabled={option.disabled}
              onChange={(e) => {
                void runCheckboxOption(option, (e.target as HTMLInputElement).checked);
              }}
            />
            <span>
              <span class="mb-1 block font-medium text-base-content/70">{option.titre}</span>
              {option.description}
            </span>
          </label>
        );
      })}
      <p class="text-[0.65rem] leading-snug text-base-content/50">
        Ces champs sont injectés dans le prompt copié pour le LLM.
      </p>
    </aside>
  );
}
