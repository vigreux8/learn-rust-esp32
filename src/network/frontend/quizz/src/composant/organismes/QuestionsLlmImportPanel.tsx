import { ClipboardCopy } from "lucide-preact";
import { LLM_QUESTION_COUNT_OPTIONS } from "../../lib/llmImportPrompts";
import { QUESTION_CATEGORIE_DEFINITIONS } from "../../lib/questionCategories";
import type { QuestionCategorieKey } from "../../lib/questionCategories";
import { Button } from "../atomes/Button";
import { Card } from "../atomes/Card";

export type QuestionsLlmImportPanelProps = {
  llmPromptFull: string;
  targetCollectionNumeric: number | null;
  importDesiredQuestionCount: number;
  setImportDesiredQuestionCount: (n: number) => void;
  importLlmCategorie: QuestionCategorieKey;
  setImportLlmCategorie: (c: QuestionCategorieKey) => void;
  importLlmCollectionName: string;
  setImportLlmCollectionName: (s: string) => void;
  importLlmSubject: string;
  setImportLlmSubject: (s: string) => void;
  importLlmIncludeExistingStems: boolean;
  setImportLlmIncludeExistingStems: (v: boolean) => void;
  importText: string;
  setImportText: (s: string) => void;
  importMessage: string | null;
  importBusy: boolean;
  promptCopied: boolean;
  onCopyPrompt: () => void;
  onRunImport: () => void;
};

export function QuestionsLlmImportPanel({
  llmPromptFull,
  targetCollectionNumeric,
  importDesiredQuestionCount,
  setImportDesiredQuestionCount,
  importLlmCategorie,
  setImportLlmCategorie,
  importLlmCollectionName,
  setImportLlmCollectionName,
  importLlmSubject,
  setImportLlmSubject,
  importLlmIncludeExistingStems,
  setImportLlmIncludeExistingStems,
  importText,
  setImportText,
  importMessage,
  importBusy,
  promptCopied,
  onCopyPrompt,
  onRunImport,
}: QuestionsLlmImportPanelProps) {
  return (
    <Card class="fl-reveal-enter mb-6 border-learn/15 bg-learn/[0.06]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <aside class="flex w-full shrink-0 flex-col gap-4 rounded-xl border border-base-content/10 bg-base-100/60 p-3 lg:min-w-70 lg:max-w-xs">
          <p class="text-[0.65rem] font-semibold uppercase tracking-wide text-base-content/45">Options</p>
          <div>
            <label class="mb-1 block text-xs font-medium text-base-content/70" for="import-llm-categorie">
              Type (import)
            </label>
            <select
              id="import-llm-categorie"
              class="select select-bordered select-sm w-full rounded-lg border-base-content/15 bg-base-100 text-sm"
              value={importLlmCategorie}
              onChange={(e) => {
                const v = (e.target as HTMLSelectElement).value;
                setImportLlmCategorie(v === "pratique" ? "pratique" : "histoire");
              }}
            >
              <option value="histoire">histoire — information</option>
              <option value="pratique">pratique — application</option>
            </select>
            <p class="mt-1 text-[0.65rem] leading-snug text-base-content/50">
              {QUESTION_CATEGORIE_DEFINITIONS[importLlmCategorie]}
            </p>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-base-content/70" for="import-llm-question-count">
              Nombre de questions
            </label>
            <select
              id="import-llm-question-count"
              class="select select-bordered select-sm w-full rounded-lg border-base-content/15 bg-base-100 text-sm"
              value={String(importDesiredQuestionCount)}
              onChange={(e) => {
                const v = Number((e.target as HTMLSelectElement).value);
                if (Number.isFinite(v)) setImportDesiredQuestionCount(v);
              }}
            >
              {LLM_QUESTION_COUNT_OPTIONS.map((k) => (
                <option key={k} value={String(k)}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-base-content/70" for="import-llm-collection-name">
              Nom de la collection
            </label>
            <input
              id="import-llm-collection-name"
              type="text"
              class="input input-bordered input-sm w-full rounded-lg border-base-content/15 bg-base-100 text-sm"
              placeholder={
                targetCollectionNumeric != null ? "Prérempli depuis la collection" : "Ex. Ma thématique"
              }
              value={importLlmCollectionName}
              onInput={(e) => setImportLlmCollectionName((e.target as HTMLInputElement).value)}
            />
            <p class="mt-1 text-[0.65rem] leading-snug text-base-content/50">
              {targetCollectionNumeric != null
                ? "Prérempli quand tu arrives depuis une collection ; tu peux l’ajuster."
                : "Optionnel : précise le nom pour le bloc JSON collections."}
            </p>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-base-content/70" for="import-llm-subject">
              Sujet des questions
            </label>
            <textarea
              id="import-llm-subject"
              class="textarea textarea-bordered w-full min-h-20 rounded-lg border-base-content/15 bg-base-100 text-sm"
              placeholder="Ex. verbes irréguliers du groupe 3, révision bac SVT…"
              value={importLlmSubject}
              onInput={(e) => setImportLlmSubject((e.target as HTMLTextAreaElement).value)}
            />
          </div>
          <label
            class={`flex cursor-pointer items-start gap-2 rounded-lg border border-base-content/10 p-2 text-xs leading-snug ${
              targetCollectionNumeric == null ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            <input
              type="checkbox"
              class="checkbox checkbox-sm mt-0.5 shrink-0 border-base-content/30"
              checked={importLlmIncludeExistingStems}
              disabled={targetCollectionNumeric == null}
              onChange={(e) => setImportLlmIncludeExistingStems((e.target as HTMLInputElement).checked)}
            />
            <span>
              Lister les intitulés déjà en base (sans réponses) pour éviter les répétitions.
              {targetCollectionNumeric == null ? (
                <span class="mt-1 block text-[0.65rem] text-base-content/45">
                  Disponible lorsque tu filtres sur une collection.
                </span>
              ) : null}
            </span>
          </label>
          <p class="text-[0.65rem] leading-snug text-base-content/50">
            Ces champs sont injectés dans le prompt copié pour le LLM.
          </p>
        </aside>
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
            value={llmPromptFull}
          />
          <p class="mb-2 text-xs text-base-content/55">
            {targetCollectionNumeric != null ? (
              <>
                Colle le JSON au format <code class="text-xs">questions</code> uniquement : chaque entrée sera liée à
                la collection affichée (aucun autre format requis).
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
              targetCollectionNumeric != null
                ? '{ "user_id": 1, "questions": [ { "question": "…", "commentaire": "…", "reponses": [ ... ] } ] }'
                : '{ "collections": [ ... ], "questions_sans_collection": [] }'
            }
            value={importText}
            onInput={(e) => setImportText((e.target as HTMLTextAreaElement).value)}
          />
          {importMessage ? <p class="mb-3 text-sm text-base-content/80">{importMessage}</p> : null}
          <Button variant="flow" disabled={importBusy || !importText.trim()} onClick={onRunImport}>
            {importBusy ? "Import…" : "Importer en base"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
