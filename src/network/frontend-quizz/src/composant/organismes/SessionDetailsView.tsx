import { useMemo } from "preact/hooks";
import { route } from "preact-router";
import { ArrowLeft } from "lucide-preact";
import { mockSessionSummaries, mockQuestions } from "../../mocks";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { Button } from "../atomes/Button";
import { Card } from "../atomes/Card";
import { Badge } from "../atomes/Badge";

export type SessionDetailsViewProps = {
  sessionId?: string;
};

export function SessionDetailsView({ sessionId }: SessionDetailsViewProps) {
  const session = useMemo(
    () => mockSessionSummaries.find((s) => s.id === sessionId),
    [sessionId],
  );

  if (!session) {
    return (
      <div class="flex min-h-dvh flex-col">
        <AppHeader />
        <main class="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
          <p class="text-base text-base-content/70">Session introuvable.</p>
          <Button variant="flow" onClick={() => route("/stats")}>
            Retour aux stats
          </Button>
        </main>
        <AppFooter />
      </div>
    );
  }

  const sampleQuestions = mockQuestions.slice(0, 3);

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <main class="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <Button variant="ghost" class="btn-sm mb-6 gap-1 px-2" onClick={() => route("/stats")}>
          <ArrowLeft class="h-4 w-4" aria-hidden />
          Statistiques
        </Button>
        <h1 class="mb-2 text-2xl font-bold tracking-tight text-base-content">Détail de session</h1>
        <p class="mb-6 text-sm text-base-content/60">{session.date}</p>

        <Card class="mb-6">
          <div class="flex flex-wrap items-center gap-2">
            <Badge tone="flow">id {session.id}</Badge>
            <span class="font-semibold text-base-content">{session.collectionName}</span>
          </div>
          <p class="mt-4 text-3xl font-semibold text-flow">
            {session.scoreLabel}
          </p>
          <p class="mt-2 text-sm text-base-content/55">Résumé mock — pas de ligne user_kpi par session id.</p>
        </Card>

        <Card>
          <p class="mb-3 text-sm font-medium text-base-content">Aperçu des questions (exemple)</p>
          <ul class="space-y-2 text-sm text-base-content/75">
            {sampleQuestions.map((q) => (
              <li key={q.id} class="rounded-lg bg-base-200/40 px-3 py-2">
                <span class="text-xs text-base-content/45">#{q.id}</span> {q.question}
              </li>
            ))}
          </ul>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
