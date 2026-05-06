import { Plus } from "lucide-preact";
import { Button } from "../../atomes/Button/Button";
import { Card } from "../../atomes/Card/Card";
import { QuestionsTable } from "../../molecules/QuestionsTable/QuestionsTable";
import { QUESTIONS_VIEW_STYLES } from "./QuestionsView.styles";
import type { QuestionsViewFiltersSectionProps, QuestionsViewQuestionsBodyProps } from "./QuestionsView.types";

export function QuestionsViewOperationErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div class={QUESTIONS_VIEW_STYLES.operationError}>
      {message}{" "}
      <button type="button" class={QUESTIONS_VIEW_STYLES.dismissLink} onClick={onDismiss}>
        Fermer
      </button>
    </div>
  );
}

export function QuestionsViewFiltersSection({
  collectionFilter,
  collections,
  onCollectionFilterChange,
  listFilterQtype,
  onListFilterQtypeChange,
  onOpenCreateQuestion,
  createQuestionDisabled,
}: QuestionsViewFiltersSectionProps) {
  return (
    <div class={QUESTIONS_VIEW_STYLES.filtersRow}>
      <div class={QUESTIONS_VIEW_STYLES.filterField}>
        <label class={QUESTIONS_VIEW_STYLES.filterLabel} for="q-collection-filter">
          Filtrer par collection
        </label>
        <select
          id="q-collection-filter"
          class={QUESTIONS_VIEW_STYLES.select}
          value={collectionFilter}
          onChange={(e) => onCollectionFilterChange((e.target as HTMLSelectElement).value)}
        >
          <option value="">Toutes les questions</option>
          <option value="none">Sans collection</option>
          {collections.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>
      <div class={QUESTIONS_VIEW_STYLES.filterFieldNarrow}>
        <label class={QUESTIONS_VIEW_STYLES.filterLabel} for="q-list-qtype-filter">
          Filtrer par type (affichage)
        </label>
        <select
          id="q-list-qtype-filter"
          class={QUESTIONS_VIEW_STYLES.select}
          value={listFilterQtype}
          onChange={(e) => {
            const v = (e.target as HTMLSelectElement).value;
            if (v === "histoire" || v === "pratique" || v === "connaissance" || v === "melanger") onListFilterQtypeChange(v);
          }}
        >
          <option value="melanger">Tous les types</option>
          <option value="histoire">Histoire seulement</option>
          <option value="pratique">Pratique seulement</option>
          <option value="connaissance">Connaissance seulement</option>
        </select>
      </div>
      <div class={QUESTIONS_VIEW_STYLES.filtersToolbar}>
        <Button
          variant="flow"
          class="btn-sm gap-1"
          disabled={createQuestionDisabled}
          title={
            createQuestionDisabled
              ? "Référence des catégories indisponible"
              : "Créer une question (formulaire comme dans la session quiz)"
          }
          onClick={() => onOpenCreateQuestion()}
        >
          <Plus class="h-4 w-4" aria-hidden />
          Créer une question
        </Button>
      </div>
    </div>
  );
}

export function QuestionsViewQuestionsBody({
  loading,
  fetchError,
  onReload,
  questionsForTable,
  saving,
  onEdit,
  onRemove,
}: QuestionsViewQuestionsBodyProps) {
  if (loading) {
    return <p class={QUESTIONS_VIEW_STYLES.loadingHint}>Chargement...</p>;
  }
  if (fetchError) {
    return (
      <Card class={QUESTIONS_VIEW_STYLES.fetchErrorCard}>
        <p class={QUESTIONS_VIEW_STYLES.fetchErrorText}>Impossible de charger les questions.</p>
        <Button variant="flow" class="btn-sm" onClick={onReload}>
          Reessayer
        </Button>
      </Card>
    );
  }
  return (
    <QuestionsTable
      data={{ questions: questionsForTable }}
      actions={{ onEdit, onRemove }}
      status={{ saving }}
    />
  );
}
