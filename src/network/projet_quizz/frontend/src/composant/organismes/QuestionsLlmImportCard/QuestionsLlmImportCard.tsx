import { Download, FileJson } from "lucide-preact";
import { Button } from "../../atomes/Button/Button";
import { QuestionsLlmImportPanel } from "../../molecules/QuestionsLlmImportPanel";
import { QUESTIONS_LLM_IMPORT_CARD_STYLES } from "./QuestionsLlmImportCard.styles";
import { useQuestionsLlmImportCard } from "./QuestionsLlmImportCard.hook";
import type { QuestionsLlmImportCardProps } from "./QuestionsLlmImportCard.types";

/**
 * Organisme gérant l'importation de questions via LLM et l'exportation JSON.
 */
export function QuestionsLlmImportCard(props: QuestionsLlmImportCardProps) {
  const { data } = props;
  const { state, actions } = useQuestionsLlmImportCard(props);

  return (
    <>
      <div class={QUESTIONS_LLM_IMPORT_CARD_STYLES.header}>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Questions</h1>
          <p class="mt-1 text-sm text-base-content/60">Modifier ou supprimer via l API backend (Prisma / SQLite).</p>
        </div>
        <div class="flex flex-col gap-2 self-start sm:flex-row sm:items-center sm:self-auto">
          <Button
            variant="outline"
            class="gap-2"
            disabled={state.exportBusy || data.targetCollectionNumeric == null}
            onClick={actions.handleExportCollectionJson}
          >
            <Download class="h-4 w-4" aria-hidden />
            {state.exportBusy ? "Export..." : "Export JSON"}
          </Button>
          <Button variant="learn" class="gap-2" onClick={actions.toggleImport}>
            <FileJson class="h-4 w-4" aria-hidden />
            Import LLM
          </Button>
        </div>
      </div>
      {state.exportError && <p class="mb-3 text-xs text-error">{state.exportError}</p>}
      {state.importOpen && (
        <QuestionsLlmImportPanel
          data={{ options: state.options, llmImportWorkflow: state.llmImportWorkflow }}
          actions={{ onOptionsChange: actions.setOptions }}
        />
      )}
    </>
  );
}
