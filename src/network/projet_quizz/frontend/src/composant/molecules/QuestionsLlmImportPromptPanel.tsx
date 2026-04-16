import { ClipboardCopy } from "lucide-preact";
import { useState } from "preact/hooks";
import { Button } from "../atomes/Button";

export type QuestionsLlmImportPromptPanelProps = {
  prompt: string;
  importFromJson: (importText: string) => Promise<string>;
};

export function QuestionsLlmImportPromptPanel({
  prompt,
  importFromJson,
}: QuestionsLlmImportPromptPanelProps) {
  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const onCopyPrompt = async () => {
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

  return (
    <div class="min-w-0 flex-1">
      <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p class="text-sm font-medium text-base-content">Prompt à copier pour ton LLM</p>
        <Button variant="outline" class="btn-sm gap-1" type="button" onClick={onCopyPrompt}>
          <ClipboardCopy class="h-3.5 w-3.5" aria-hidden />
          {promptCopied ? "Copié" : "Copier"}
        </Button>
      </div>
      <textarea
        class="textarea textarea-bordered mb-3 w-full min-h-28 rounded-2xl border-base-content/15 bg-base-100/80 text-sm transition duration-300"
        readOnly
        value={prompt}
      />
      <p class="mb-2 text-xs text-base-content/55">
        {prompt.includes('"questions"') && !prompt.includes('"questions_sans_collection"') ? (
          <>
            Colle le JSON au format <code class="text-xs">questions</code> uniquement : chaque entrée sera liée à la
            collection affichée (aucun autre format requis).
          </>
        ) : (
          <>
            Colle le JSON généré ci-dessous (champs <code class="text-xs">collections</code> et/ou{" "}
            <code class="text-xs">questions_sans_collection</code>, ou tableau racine{" "}
            <code class="text-xs">questions</code>).
          </>
        )}
      </p>
      <textarea
        class="textarea textarea-bordered mb-3 w-full min-h-32 rounded-2xl border-dashed border-learn/35 bg-base-100/60 font-mono text-xs leading-relaxed"
        placeholder={
          prompt.includes('"questions"') && !prompt.includes('"questions_sans_collection"')
            ? '{ "user_id": 1, "questions": [ { "question": "…", "commentaire": "…", "reponses": [ ... ] } ] }'
            : '{ "collections": [ ... ], "questions_sans_collection": [] }'
        }
        value={importText}
        onInput={(e) => setImportText((e.target as HTMLTextAreaElement).value)}
      />
      {importMessage ? <p class="mb-3 text-sm text-base-content/80">{importMessage}</p> : null}
      <Button
        variant="flow"
        disabled={importBusy || !importText.trim()}
        onClick={onRunImport}
      >
        {importBusy ? "Import…" : "Importer en base"}
      </Button>
    </div>
  );
}
