import { ClipboardCopy } from "lucide-preact";
import { useId, useState } from "preact/hooks";
import { cn } from "../../../lib/cn";
import { Button } from "../../atomes/Button";
import { QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES } from "./QuestionsLlmImportPromptPanel.styles";
import type { QuestionsLlmImportPromptPanelProps } from "./QuestionsLlmImportPromptPanel.types";

export type { QuestionsLlmImportPromptPanelProps } from "./QuestionsLlmImportPromptPanel.types";

export function QuestionsLlmImportPromptPanel(props: QuestionsLlmImportPromptPanelProps) {
  const { data, actions, settings, class: className } = props;
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

  const pasteHelp =
    settings?.pasteAreaInstruction != null ? (
      <p class="mb-2 text-xs text-base-content/55">{settings.pasteAreaInstruction}</p>
    ) : (
      <p class="mb-2 text-xs text-base-content/55">
        {prompt.includes('"questions"') && !prompt.includes('"questions_sans_collection"') ? (
          <>
            Colle le JSON au format <code class="text-xs">questions</code> uniquement : chaque entrée sera liée à la collection affichée (aucun autre format requis).
          </>
        ) : (
          <>
            Colle le JSON généré ci-dessous (champs <code class="text-xs">collections</code> et/ou <code class="text-xs">questions_sans_collection</code>, ou tableau racine{" "}
            <code class="text-xs">questions</code>).
          </>
        )}
      </p>
    );

  return (
    <div class={cn(QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.wrapper, className)}>
      <div class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.toolbar}>
        <h2 id={headingId} class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.toolbarTitle}>
          Prompt à copier pour ton LLM
        </h2>
        <Button variant="outline" class="btn-sm gap-1" type="button" disabled={disabled} onClick={onCopyPrompt}>
          <ClipboardCopy class="h-3.5 w-3.5" aria-hidden />
          {promptCopied ? "Copié" : "Copier"}
        </Button>
      </div>
      <section class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.sectionPrompt} aria-labelledby={headingId}>
        <label class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.sectionPromptLegend} for={promptTextareaId}>
          Texte du prompt (lecture seule)
        </label>
        <textarea
          id={promptTextareaId}
          class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.promptTextarea}
          readOnly
          rows={14}
          value={prompt}
          disabled={disabled}
        />
      </section>
      {pasteHelp}
      <textarea
        class="textarea textarea-bordered mb-3 w-full min-h-32 rounded-2xl border-dashed border-learn/35 bg-base-100/60 font-mono text-xs leading-relaxed"
        placeholder={
          settings?.jsonPastePlaceholder ??
          (prompt.includes('"questions"') && !prompt.includes('"questions_sans_collection"')
            ? '{ "user_id": 1, "questions": [ { "question": "…", "commentaire": "…", "reponses": [ ... ] } ] }'
            : '{ "collections": [ ... ], "questions_sans_collection": [] }')
        }
        value={importText}
        disabled={disabled}
        onInput={(e) => setImportText((e.target as HTMLTextAreaElement).value)}
      />
      {importMessage ? <p class="mb-3 text-sm text-base-content/80">{importMessage}</p> : null}
      <Button variant="flow" disabled={disabled || importBusy || !importText.trim()} onClick={onRunImport}>
        {importBusy ? submitBusyLabel : submitLabel}
      </Button>
    </div>
  );
}
