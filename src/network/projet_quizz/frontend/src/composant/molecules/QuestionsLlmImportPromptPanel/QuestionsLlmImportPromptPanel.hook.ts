import { useId, useState } from "preact/hooks";
import type { QuestionsLlmImportPromptPanelProps } from "./QuestionsLlmImportPromptPanel.types";

export function useQuestionsLlmImportPromptPanel(props: QuestionsLlmImportPromptPanelProps) {
  const { data, actions, settings } = props;
  const { prompt } = data;
  const { importFromJson } = actions;

  const uid = useId();
  const headingId = `llm-import-prompt-heading-${uid}`;
  const promptTextareaId = `llm-import-prompt-text-${uid}`;

  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const disabled = Boolean(settings?.disabled);
  const submitLabel = settings?.submitLabel ?? "Importer en base";
  const submitBusyLabel = settings?.submitBusyLabel ?? "Import…";
  const pasteAreaInstruction = settings?.pasteAreaInstruction;
  const jsonPastePlaceholder = settings?.jsonPastePlaceholder ?? resolveDefaultJsonPlaceholder(prompt);
  const defaultPasteHelpVariant: "questions" | "collections" = isCollectionScopedPrompt(prompt) ? "questions" : "collections";

  const onCopyPrompt = async () => {
    if (disabled) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setPromptCopied(true);
      window.setTimeout(() => setPromptCopied(false), 2000);
    } catch {
      setImportMessage("Impossible de copier (permissions du navigateur).");
    }
  };

  const onRunImport = async () => {
    setImportBusy(true);
    setImportMessage(null);
    try {
      const message = await importFromJson(importText);
      setImportMessage(message);
      setImportText("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "JSON ou réseau invalide.";
      setImportMessage(msg);
    } finally {
      setImportBusy(false);
    }
  };

  const header = {
    headingId,
    onCopyPrompt,
    promptCopied,
    disabled,
  };

  const promptArea = {
    promptTextareaId,
    prompt,
    disabled,
  };

  const pasteHelp = {
    customInstruction: pasteAreaInstruction,
    defaultVariant: defaultPasteHelpVariant,
  };

  const importArea = {
    importText,
    setImportText,
    placeholder: jsonPastePlaceholder,
    disabled,
    importMessage,
  };

  const submit = {
    label: importBusy ? submitBusyLabel : submitLabel,
    disabled: disabled || importBusy || importText.trim().length === 0,
    onRunImport,
  };

  return {
    header,
    promptArea,
    pasteHelp,
    importArea,
    submit,
  };
}

function isCollectionScopedPrompt(prompt: string): boolean {
  return prompt.includes('"questions"') && !prompt.includes('"questions_sans_collection"');
}

function resolveDefaultJsonPlaceholder(prompt: string): string {
  return isCollectionScopedPrompt(prompt)
    ? '{ "user_id": 1, "questions": [ { "question": "…", "commentaire": "…", "reponses": [ ... ] } ] }'
    : '{ "collections": [ ... ], "questions_sans_collection": [] }';
}
