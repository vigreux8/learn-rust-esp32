import { QuestionsCollectionContextBar } from "../../atomes/QuestionsCollectionContextBar/QuestionsCollectionContextBar";
import { QuestionsLlmImportCard } from "../QuestionsLlmImportCard/QuestionsLlmImportCard";
import { QuestionEditModal } from "../QuestionEditModal/QuestionEditModal";
import { AppHeader } from "../../atomes/AppHeader/AppHeader";
import { AppFooter } from "../../atomes/AppFooter/AppFooter";
import { PageMain } from "../../atomes/PageMain/PageMain";
import { useQuestionsView } from "./QuestionsView.hook";
import {
  QuestionsViewFiltersSection,
  QuestionsViewOperationErrorBanner,
  QuestionsViewQuestionsBody,
} from "./QuestionsView.sections";
import { QUESTIONS_VIEW_STYLES } from "./QuestionsView.styles";
import type { QuestionsViewProps } from "./QuestionsView.types";

export function QuestionsView(props: QuestionsViewProps) {
  const { llmImport, operationError, contextBar, filtres, liste, editModal } = useQuestionsView(props);

  return (
    <div class={QUESTIONS_VIEW_STYLES.root}>
      <AppHeader />
      <PageMain>
        <QuestionsLlmImportCard data={llmImport.data} actions={llmImport.actions} />

        {operationError.visible ? <QuestionsViewOperationErrorBanner onDismiss={operationError.onDismiss} /> : null}

        <QuestionsCollectionContextBar {...contextBar} />

        <QuestionsViewFiltersSection {...filtres} />

        <QuestionsViewQuestionsBody {...liste} />

        <QuestionEditModal
          settings={editModal.settings}
          actions={editModal.actions}
          status={editModal.status}
          data={editModal.data}
          drafts={editModal.drafts}
        />
      </PageMain>
      <AppFooter />
    </div>
  );
}
