import { ArrowLeft } from "lucide-preact";
import { AppHeader } from "../../molecules/AppHeader/AppHeader";
import { AppFooter } from "../../molecules/AppFooter/AppFooter";
import { Button } from "../../atomes/Button/Button";
import { Card } from "../../atomes/Card/Card";
import { Badge } from "../../atomes/Badge/Badge";
import { useSessionDetailsView } from "./SessionDetailsView.hook";
import { SESSION_DETAILS_VIEW_STYLES } from "./SessionDetailsView.styles";
import type { SessionDetailsViewProps } from "./SessionDetailsView.types";

export function SessionDetailsView(props: SessionDetailsViewProps) {
  const { status, navigation, session } = useSessionDetailsView(props);

  if (status.loading) {
    return (
      <div class={SESSION_DETAILS_VIEW_STYLES.root}>
        <AppHeader />
        <main class={SESSION_DETAILS_VIEW_STYLES.centeredMain}>
          <p class="text-sm text-base-content/60">Chargement...</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (status.notFound || session == null) {
    return (
      <div class={SESSION_DETAILS_VIEW_STYLES.root}>
        <AppHeader />
        <main class={SESSION_DETAILS_VIEW_STYLES.centeredMain}>
          <p class="text-base text-base-content/70">Session introuvable.</p>
          <Button variant="flow" onClick={navigation.toDashboard}>
            Retour au dashboard
          </Button>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div class={SESSION_DETAILS_VIEW_STYLES.root}>
      <AppHeader />
      <main class={SESSION_DETAILS_VIEW_STYLES.contentMain}>
        <Button variant="ghost" class="btn-sm mb-6 gap-1 px-3" onClick={navigation.toDashboard}>
          <ArrowLeft class="h-4 w-4" aria-hidden />
          Dashboard
        </Button>
        <h1 class="mb-2 text-2xl font-bold tracking-tight text-base-content">Detail de session</h1>
        <p class="mb-6 text-sm text-base-content/60">{session.date}</p>

        <Card class="mb-6">
          <div class="flex flex-wrap items-center gap-2">
            <Badge tone="flow">id {session.id}</Badge>
            <span class="font-semibold text-base-content">{session.collectionName}</span>
          </div>
          <p class="mt-4 text-3xl font-semibold text-flow">{session.scoreLabel}</p>
          <p class="mt-2 text-sm text-base-content/55">
            Reponses enregistrees ce jour pour cette collection (agregat <code class="text-xs">user_kpi</code>).
          </p>
        </Card>

        <Card>
          <p class="mb-3 text-sm font-medium text-base-content">Questions concernees</p>
          <ul class="space-y-2 text-sm text-base-content/75">
            {session.questionsPreview.map((q) => (
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
