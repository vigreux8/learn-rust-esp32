import { ActionExportCollectionJson } from "../../molecules/ActionExportCollectionJson";
import { ActionImportLlm } from "../../molecules/ActionImportLlm";
import { QuestionsLlmImportPanel } from "../../molecules/QuestionsLlmImportPanel";
import { QUESTIONS_ACTION_BOUTONS_STYLES } from "./QuestionsActionBoutons.styles";
import { useQuestionsActionBoutons } from "./QuestionsActionBoutons.hook";
import type { QuestionsActionBoutonsProps } from "./QuestionsActionBoutons.types";

/**
 * En-tête de l'écran Questions avec actions (export JSON, import LLM) et panneau d'import.
 */
export function QuestionsActionBoutons(props: QuestionsActionBoutonsProps) {
  const { data } = props;
  const { state, actions } = useQuestionsActionBoutons(props);

  return (
    <>
      <div class={QUESTIONS_ACTION_BOUTONS_STYLES.header}>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Questions</h1>
          <p class="mt-1 text-sm text-base-content/60">Modifier ou supprimer via l API backend (Prisma / SQLite).</p>
        </div>
        <div class="flex flex-col gap-2 self-start sm:flex-row sm:items-center sm:self-auto">
          <ActionExportCollectionJson
            data={{ collections: data.collections, targetCollectionNumeric: data.targetCollectionNumeric }}
          />
          <ActionImportLlm
            data={{ panneauImportOuvert: state.importOpen }}
            actions={{ onBasculerPanneauImport: actions.toggleImport }}
          />
        </div>
      </div>
      {state.importOpen ? (
        <QuestionsLlmImportPanel
          data={{ options: state.options, llmImportWorkflow: state.llmImportWorkflow }}
          actions={{ onOptionsChange: actions.setOptions }}
        />
      ) : null}
    </>
  );
}
