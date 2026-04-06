import { useMemo } from "preact/hooks";
import { route } from "preact-router";
import { Trophy } from "lucide-preact";
import { readLastQuizResult } from "../../lib/lastQuizResult";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { Card } from "../atomes/Card";
import { Button } from "../atomes/Button";
import { Badge } from "../atomes/Badge";

export function QuizResultsView() {
  const result = useMemo(() => readLastQuizResult(), []);

  if (!result) {
    return (
      <div class="flex min-h-dvh flex-col">
        <AppHeader />
        <main class="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <p class="text-base text-base-content/70">Aucun résultat récent. Lance une partie depuis l’accueil.</p>
          <Button variant="flow" onClick={() => route("/")}>
            Accueil
          </Button>
        </main>
        <AppFooter />
      </div>
    );
  }

  const pct = result.total <= 0 ? 0 : Math.round((result.good / result.total) * 100);

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <main class="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-10">
        <Card class="w-full text-center">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-flow to-learn text-white shadow-lg shadow-flow/25">
            <Trophy class="h-7 w-7" aria-hidden />
          </div>
          <Badge tone="flow" class="mb-3">
            Session terminée
          </Badge>
          <h1 class="mb-2 text-2xl font-bold tracking-tight text-base-content">Bien joué !</h1>
          <p class="mb-6 text-sm text-base-content/65">{result.collectionName}</p>
          <p class="mb-1 text-4xl font-semibold text-flow">
            {result.good}/{result.total}
          </p>
          <p class="mb-8 text-sm text-base-content/55">{pct}% de bonnes réponses</p>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="flow" onClick={() => route(`/play/${result.collectionId}`)}>
              Rejouer
            </Button>
            <Button variant="outline" onClick={() => route("/")}>
              Collections
            </Button>
          </div>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
