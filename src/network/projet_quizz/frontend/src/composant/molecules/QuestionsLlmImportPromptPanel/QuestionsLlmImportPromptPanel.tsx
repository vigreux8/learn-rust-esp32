import { ClipboardCopy } from "lucide-preact";
import { cn } from "../../../lib/cn";
import { Button } from "../../atomes/Button";
import { useQuestionsLlmImportPromptPanel } from "./QuestionsLlmImportPromptPanel.hook";
import { QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES } from "./QuestionsLlmImportPromptPanel.styles";
import type { QuestionsLlmImportPromptPanelProps } from "./QuestionsLlmImportPromptPanel.types";

export type { QuestionsLlmImportPromptPanelProps } from "./QuestionsLlmImportPromptPanel.types";

export function QuestionsLlmImportPromptPanel(props: QuestionsLlmImportPromptPanelProps) {
  const { class: className } = props;
  const { header, promptArea, pasteHelp, importArea, submit } = useQuestionsLlmImportPromptPanel(props);

  return (
    <div class={cn(QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.wrapper, className)}>
      <div class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.toolbar}>
        <h2 id={header.headingId} class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.toolbarTitle}>
          Prompt à copier pour ton LLM
        </h2>
        <Button variant="outline" class="btn-sm gap-1" type="button" disabled={header.disabled} onClick={header.onCopyPrompt}>
          <ClipboardCopy class="h-3.5 w-3.5" aria-hidden />
          {header.promptCopied ? "Copié" : "Copier"}
        </Button>
      </div>

      <section class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.sectionPrompt} aria-labelledby={header.headingId}>
        <label
          class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.sectionPromptLegend}
          for={promptArea.promptTextareaId}
        >
          Texte du prompt (lecture seule)
        </label>
        <textarea
          id={promptArea.promptTextareaId}
          class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.promptTextarea}
          readOnly
          rows={14}
          value={promptArea.prompt}
          disabled={promptArea.disabled}
        />
      </section>

      <PasteHelpLabel
        customInstruction={pasteHelp.customInstruction}
        defaultVariant={pasteHelp.defaultVariant}
      />

      <textarea
        class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.jsonTextarea}
        placeholder={importArea.placeholder}
        value={importArea.importText}
        disabled={importArea.disabled}
        onInput={(e) => importArea.setImportText((e.target as HTMLTextAreaElement).value)}
      />

      {importArea.importMessage ? (
        <p class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.feedback}>{importArea.importMessage}</p>
      ) : null}

      <Button variant="flow" disabled={submit.disabled} onClick={submit.onRunImport}>
        {submit.label}
      </Button>
    </div>
  );
}

function PasteHelpLabel({
  customInstruction,
  defaultVariant,
}: {
  customInstruction: string | undefined;
  defaultVariant: "questions" | "collections";
}) {
  if (customInstruction != null) {
    return <p class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.pasteHelp}>{customInstruction}</p>;
  }
  if (defaultVariant === "questions") {
    return (
      <p class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.pasteHelp}>
        Colle le JSON au format <code class="text-xs">questions</code> uniquement : chaque entrée sera liée à la
        collection affichée (aucun autre format requis).
      </p>
    );
  }
  return (
    <p class={QUESTIONS_LLM_IMPORT_PROMPT_PANEL_STYLES.pasteHelp}>
      Colle le JSON généré ci-dessous (champs <code class="text-xs">collections</code> et/ou{" "}
      <code class="text-xs">questions_sans_collection</code>, ou tableau racine{" "}
      <code class="text-xs">questions</code>).
    </p>
  );
}
