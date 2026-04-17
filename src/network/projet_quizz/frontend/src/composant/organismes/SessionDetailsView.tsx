import { useEffect, useState } from "preact/hooks";
import { route } from "preact-router";
import { ArrowLeft } from "lucide-preact";
import { fetchSessionDetail } from "../../lib/api";
import { useUserSession } from "../../lib/userSession";
import type { SessionDetail } from "../../types/quizz";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { Button } from "../atomes/Button";
import { Card } from "../atomes/Card";
import { Badge } from "../atomes/Badge";

export type SessionDetailsViewProps = {
  sessionId?: string;
};

/**
 * Détail d’une session d’apprentissage passée : chargement par identifiant, affichage des métriques et navigation retour.
 */
export function SessionDetailsView({ sessionId }: SessionDetailsViewProps) {
  const { userId } = useUserSession();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (sessionId == null || sessionId === "") {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const detail = await fetchSessionDetail(sessionId, userId);
        if (cancelled) return;
        if (detail == null) setNotFound(true);
        else setSession(detail);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, userId]);

  if (loading) {
    return (
      <div class="flex min-h-dvh flex-col">
        <AppHeader />
        <main class="fl-page-enter mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
          <p class="text-sm text-base-content/60">Chargement…</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (notFound || !session) {
    return (
      <div class="flex min-h-dvh flex-col">
        <AppHeader />
        <main class="fl-page-enter mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
          <p class="text-base text-base-content/70">Session introuvable.</p>
          <Button variant="flow" onClick={() => route("/dashboard")}>
            Retour au dashboard
          </Button>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <main class="fl-page-enter mx-auto w-full max-w-2xl flex-1 px-4 py-6 md:py-8">
        <Button variant="ghost" class="btn-sm mb-6 gap-1 px-3" onClick={() => route("/dashboard")}>
          <ArrowLeft class="h-4 w-4" aria-hidden />
          Dashboard
        </Button>
        <h1 class="mb-2 text-2xl font-bold tracking-tight text-base-content">Détail de session</h1>
        <p class="mb-6 text-sm text-base-content/60">{session.date}</p>

        <Card class="mb-6">
          <div class="flex flex-wrap items-center gap-2">
            <Badge tone="flow">id {session.id}</Badge>
            <span class="font-semibold text-base-content">{session.collectionName}</span>
          </div>
          <p class="mt-4 text-3xl font-semibold text-flow">{session.scoreLabel}</p>
          <p class="mt-2 text-sm text-base-content/55">
            Réponses enregistrées ce jour pour cette collection (agrégat <code class="text-xs">user_kpi</code>).
          </p>
        </Card>

        <Card>
          <p class="mb-3 text-sm font-medium text-base-content">Questions concernées</p>
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
