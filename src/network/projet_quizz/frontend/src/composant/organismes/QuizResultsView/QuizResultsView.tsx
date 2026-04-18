import { Trophy } from "lucide-preact";
import { AppHeader } from "../../molecules/AppHeader/AppHeader";
import { AppFooter } from "../../molecules/AppFooter/AppFooter";
import { Card } from "../../atomes/Card/Card";
import { Button } from "../../atomes/Button/Button";
import { Badge } from "../../atomes/Badge/Badge";
import { useQuizResultsView } from "./QuizResultsView.hook";
import { QUIZ_RESULTS_VIEW_STYLES } from "./QuizResultsView.styles";

export function QuizResultsView() {
  const { result, summary, navigation } = useQuizResultsView();

  if (result == null || summary == null) {
    return (
      <div class={QUIZ_RESULTS_VIEW_STYLES.root}>
        <AppHeader />
        <main class="fl-page-enter mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <p class="text-base text-base-content/70">Aucun resultat recent. Lance un quiz depuis l accueil ou une collection.</p>
          <Button variant="flow" onClick={navigation.goHome}>
            Accueil
          </Button>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div class={QUIZ_RESULTS_VIEW_STYLES.root}>
      <AppHeader />
      <main class={QUIZ_RESULTS_VIEW_STYLES.main}>
        <Card class="w-full text-center transition duration-300">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-flow to-learn text-white shadow-xl shadow-flow/25 transition duration-300 hover:scale-105">
            <Trophy class="h-7 w-7" aria-hidden />
          </div>
          <Badge tone="flow" class="mb-3">
            Session terminee
          </Badge>
          <h1 class="mb-2 text-2xl font-bold tracking-tight text-base-content">Resultat</h1>
          <p class="mb-6 text-sm text-base-content/65">{summary.collectionName}</p>
          <p class="mb-1 text-4xl font-semibold text-flow">
            {summary.good}/{summary.total}
          </p>
          <p class="mb-8 text-sm text-base-content/55">{summary.percent}% de bonnes reponses</p>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="flow" onClick={navigation.replay}>
              Rejouer
            </Button>
            <Button variant="outline" onClick={navigation.goCollections}>
              Collections
            </Button>
            <Button variant="ghost" onClick={navigation.goHome}>
              Accueil
            </Button>
          </div>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
