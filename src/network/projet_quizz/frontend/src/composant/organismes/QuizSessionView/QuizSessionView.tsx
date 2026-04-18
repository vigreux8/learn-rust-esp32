import { QuestionEditModal } from "../QuestionEditModal/QuestionEditModal";
import { AppFooter } from "../../molecules/AppFooter/AppFooter";
import { AppHeader } from "../../molecules/AppHeader/AppHeader";
import { useQuizSessionView } from "./QuizSessionView.hook";
import {
  QuizSessionError,
  QuizSessionHeader,
  QuizSessionLoading,
  QuizSessionProgress,
  QuizSessionQuestionCard,
} from "./QuizSessionView.sections";
import { QUIZ_SESSION_STYLES } from "./QuizSessionView.styles";
import type { QuizSessionViewProps } from "./QuizSessionView.types";

export function QuizSessionView(props: QuizSessionViewProps) {
  const view = useQuizSessionView(props);

  if (view.kind === "loading") return <QuizSessionLoading />;
  if (view.kind === "error") return <QuizSessionError loadError={view.loadError} />;

  const { session, progress, questionCard, editModal } = view;

  return (
    <div class={QUIZ_SESSION_STYLES.pageShell}>
      <AppHeader />
      <main class={QUIZ_SESSION_STYLES.contentMain}>
        <QuizSessionHeader data={session.data} backTarget={session.backTarget} />
        {session.actionMessage ? (
          <p class={QUIZ_SESSION_STYLES.actionMessage}>{session.actionMessage}</p>
        ) : null}
        <QuizSessionProgress
          playInfinite={progress.playInfinite}
          progressValue={progress.progressValue}
          total={progress.total}
        />
        <QuizSessionQuestionCard {...questionCard} />
      </main>
      <AppFooter />

      <QuestionEditModal
        settings={editModal.settings}
        actions={editModal.actions}
        status={editModal.status}
        data={editModal.data}
        drafts={editModal.drafts}
      />
    </div>
  );
}
