import { useEffect, useMemo, useState } from "preact/hooks";
import { route } from "preact-router";
import { Clock, Target, TrendingUp } from "lucide-preact";
import { fetchKpis, fetchSessionSummaries } from "../../lib/api";
import { useUserSession } from "../../lib/userSession";
import type { SessionSummary, UserKpiRow } from "../../types/quizz";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { PageMain } from "../molecules/PageMain";
import { KpiCard } from "../molecules/KpiCard";
import { Card } from "../atomes/Card";
import { Badge } from "../atomes/Badge";
import { Button } from "../atomes/Button";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function StatsDashboard() {
  const { userId } = useUserSession();
  const [kpis, setKpis] = useState<UserKpiRow[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [k, s] = await Promise.all([fetchKpis(userId), fetchSessionSummaries(userId)]);
        if (!cancelled) {
          setKpis(k);
          setSessions(s);
        }
      } catch {
        if (!cancelled) setError("fetch");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const kpisAgg = useMemo(() => {
    const total = kpis.length;
    const good = kpis.filter((k) => k.correct).length;
    const ratio = total === 0 ? 0 : Math.round((good / total) * 100);
    const times = kpis.map((k) => Number.parseFloat(k.duree_session)).filter((n) => !Number.isNaN(n));
    const avgSec = avg(times);
    return { total, good, ratio, avgSec: avgSec.toFixed(1) };
  }, [kpis]);

  const weekBars = useMemo(() => {
    const heights = [4, 7, 5, 9, 6, 8, 5];
    const max = Math.max(...heights, 1);
    return heights.map((h, i) => ({ label: DAYS[i], h: Math.round((h / max) * 100) }));
  }, []);

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <PageMain>
        <h1 class="mb-2 text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Dashboard</h1>
        <p class="mb-6 text-sm text-base-content/60">
          Indicateurs issus de <code class="text-xs">user_kpi</code> (utilisateur id {userId}).
        </p>

        {loading ? (
          <p class="text-sm text-base-content/60">Chargement…</p>
        ) : error ? (
          <div class="rounded-[var(--radius-box)] border border-base-content/10 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/65">
            <p class="mb-3">Impossible de charger les statistiques.</p>
            <Button
              variant="flow"
              class="btn-sm"
              onClick={() => {
                setLoading(true);
                setError(null);
                Promise.all([fetchKpis(userId), fetchSessionSummaries(userId)])
                  .then(([k, s]) => {
                    setKpis(k);
                    setSessions(s);
                  })
                  .catch(() => setError("fetch"))
                  .finally(() => setLoading(false));
              }}
            >
              Réessayer
            </Button>
          </div>
        ) : (
          <>
            <div class="mb-6 grid gap-3 sm:grid-cols-3">
              <KpiCard
                title="Ratio correct"
                value={`${kpisAgg.ratio}%`}
                hint={`${kpisAgg.good} / ${kpisAgg.total} réponses`}
                accent="flow"
                icon={<Target class="h-5 w-5" aria-hidden />}
              />
              <KpiCard
                title="Temps moyen"
                value={`${kpisAgg.avgSec}s`}
                hint="Par enregistrement KPI"
                accent="learn"
                icon={<Clock class="h-5 w-5" aria-hidden />}
              />
              <KpiCard
                title="Questions répondues"
                value={`${kpisAgg.total}`}
                hint="Enregistrements KPI"
                accent="flow"
                icon={<TrendingUp class="h-5 w-5" aria-hidden />}
              />
            </div>

            <Card class="mb-6 transition duration-300">
              <p class="mb-4 text-sm font-medium text-base-content">Activité (7 jours — décoratif)</p>
              <div class="flex h-36 items-end justify-between gap-2">
                {weekBars.map((b) => (
                  <div key={b.label} class="flex flex-1 flex-col items-center gap-2">
                    <div
                      class="w-full max-w-10 rounded-t-full bg-gradient-to-t from-flow to-learn/80 opacity-90 transition-all duration-300 ease-out hover:opacity-100"
                      style={{ height: `${Math.max(b.h, 8)}%` }}
                      title={b.label}
                    />
                    <span class="text-[10px] font-medium text-base-content/50">{b.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card class="transition duration-300">
              <p class="mb-4 text-sm font-medium text-base-content">Historique des sessions</p>
              {sessions.length === 0 ? (
                <p class="text-sm text-base-content/55">Aucune session agrégée pour cet utilisateur.</p>
              ) : (
                <ul class="space-y-3">
                  {sessions.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        class="flex w-full flex-col gap-2 rounded-full border border-base-content/10 bg-base-200/30 px-4 py-4 text-left transition-all duration-300 ease-out hover:border-flow/30 hover:bg-base-200/55 sm:flex-row sm:items-center sm:justify-between"
                        onClick={() => route(`/dashboard/session/${encodeURIComponent(s.id)}`)}
                      >
                        <div>
                          <p class="font-medium text-base-content">{s.collectionName}</p>
                          <p class="text-xs text-base-content/50">{s.date}</p>
                        </div>
                        <div class="flex items-center gap-2">
                          <Badge tone="learn">{s.scoreLabel}</Badge>
                          <span class="text-xs text-flow">Détails →</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}
      </PageMain>
      <AppFooter />
    </div>
  );
}
