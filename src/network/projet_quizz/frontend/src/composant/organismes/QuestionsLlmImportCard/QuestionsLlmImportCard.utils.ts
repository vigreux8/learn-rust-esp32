import type { LlmImportOption } from "../../atomes/QuestionsLlmImportOptionsPanel";

export function getOptionValue(options: LlmImportOption[], id: string): string {
  const option = options.find((entry) => entry.id === id);
  if (typeof option?.value === "string" || typeof option?.value === "number") {
    return String(option.value);
  }
  return "";
}
