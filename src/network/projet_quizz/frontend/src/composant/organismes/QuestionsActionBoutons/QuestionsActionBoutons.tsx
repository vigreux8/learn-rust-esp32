import { LayoutGrid, ListOrdered } from "lucide-preact";
import { route } from "preact-router";
import { Button } from "../../atomes/Button/Button";
import { ActionExportCollectionJson } from "./parts/ActionExportCollectionJson";
import { ActionImportLlm } from "../../molecules/ActionImportLlm";
import { buildReflexionRoutePath, buildSousCollectionsRoutePath } from "../../molecules/CollectionCard/CollectionCard.metier";
import { QuestionsLlmImportPanel } from "../../molecules/QuestionsLlmImportPanel";
import { QUESTIONS_ACTION_BOUTONS_STYLES } from "./QuestionsActionBoutons.styles";
import { useQuestionsActionBoutons } from "./QuestionsActionBoutons.hook";
import type { QuestionsActionBoutonsProps } from "./QuestionsActionBoutons.types";
import { useUserSession } from "../../../lib/userSession";

/**
 * En-tête de l'écran Questions avec actions (export JSON, import LLM) et panneau d'import.
 */
export function QuestionsActionBoutons(props: QuestionsActionBoutonsProps) {
  const { data, presentation } = props;
  const { userId } = useUserSession();
  const { state, actions } = useQuestionsActionBoutons(props);
  const pageTitle = presentation?.title ?? "Questions";
  const pageSubtitle =
    presentation?.subtitle ?? "Modifier ou supprimer via l API backend (Prisma / SQLite).";

  const targetCollection =
    data.targetCollectionNumeric != null
      ? data.collections.find((c) => c.id === data.targetCollectionNumeric)
      : null;
  const showSuiteLogique =
    targetCollection != null &&
    targetCollection.user_id === userId &&
    targetCollection.questions.length > 0;

  return (
    <>
      <div class={QUESTIONS_ACTION_BOUTONS_STYLES.header}>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">{pageTitle}</h1>
          <p class="mt-1 text-sm text-base-content/60">{pageSubtitle}</p>
        </div>
        <div class="flex flex-col gap-2 self-start sm:flex-row sm:items-center sm:self-auto">
          <ActionExportCollectionJson
            data={{ collections: data.collections, targetCollectionNumeric: data.targetCollectionNumeric }}
          />
          {showSuiteLogique && targetCollection != null ? (
            <Button
              variant="outline"
              class="btn-sm gap-1"
              onClick={() => route(buildReflexionRoutePath(targetCollection.id))}
            >
              <ListOrdered class="h-4 w-4" aria-hidden />
              Suite logique
            </Button>
          ) : null}
          <Button
            variant="outline"
            class="btn-sm gap-1"
            disabled={data.targetCollectionNumeric == null}
            title={
              data.targetCollectionNumeric == null
                ? "Sélectionne une collection dans le filtre « Filtrer par collection » pour ouvrir ses sous-collections."
                : undefined
            }
            onClick={() => {
              if (data.targetCollectionNumeric == null) return;
              route(buildSousCollectionsRoutePath(data.targetCollectionNumeric));
            }}
          >
            <LayoutGrid class="h-4 w-4" aria-hidden />
            Sous-collections
          </Button>
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
