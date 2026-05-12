import { ArrowLeft } from "lucide-preact";
import { QuestionsCollectionContextBar } from "./parts/QuestionsCollectionContextBar";
import { QuestionsActionBoutons } from "../../ui/organismes/QuestionsActionBoutons/QuestionsActionBoutons";
import { QuestionEditModal } from "../../ui/organismes/QuestionEditModal/QuestionEditModal";
import { AppHeader } from "../../ui/atomes/AppHeader/AppHeader";
import { AppFooter } from "../../ui/atomes/AppFooter/AppFooter";
import { PageMain } from "../../ui/atomes/PageMain/PageMain";
import { Button } from "../../ui/atomes/Button/Button";
import { useQuestionsView } from "./QuestionsView.hook";
import {
  QuestionsViewFiltersSection,
  QuestionsViewOperationErrorBanner,
  QuestionsViewQuestionsBody,
} from "./QuestionsView.sections";
import { QUESTIONS_VIEW_STYLES } from "./QuestionsView.styles";
import type { QuestionsViewProps } from "./QuestionsView.types";

export function QuestionsView( props: QuestionsViewProps) {
  const { navigation, questionsActionBoutons, operationError, contextBar, filtres, liste, editModal } =
    useQuestionsView(props);

  return (
    <div class={QUESTIONS_VIEW_STYLES.root}>
      <AppHeader />
      <PageMain>
        {navigation.showBackToNode ? (
          <div class={QUESTIONS_VIEW_STYLES.backToNodeRow}>
            <Button variant="ghost" class="btn-sm gap-2" type="button" onClick={navigation.onBackToNode}>
              <ArrowLeft class="h-4 w-4 shrink-0" aria-hidden />
              Retour au graphe
            </Button>
          </div>
        ) : null}
        <QuestionsActionBoutons data={questionsActionBoutons.data} actions={questionsActionBoutons.actions} />

        {operationError.visible ? (
          <QuestionsViewOperationErrorBanner message={operationError.message} onDismiss={operationError.onDismiss} />
        ) : null}

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
