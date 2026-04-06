import { useMemo } from "preact/hooks";
import { route } from "preact-router";
import { ArrowLeft, Clock, Target, TrendingUp } from "lucide-preact";
import { mockUserKpi, mockSessionSummaries, isCorrectAnswer } from "../../mocks";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { Button } from "../atomes/Button";
import { KpiCard } from "../molecules/KpiCard";
import { Card } from "../atomes/Card";
import { Badge } from "../atomes/Badge";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function StatsDashboard() {
  const kpis = useMemo(() => {
    const total = mockUserKpi.length;
    const good = mockUserKpi.filter((k) => isCorrectAnswer(k.reponse_id)).length;
    const ratio = total === 0 ? 0 : Math.round((good / total) * 100);
    const times = mockUserKpi.map((k) => Number.parseFloat(k.duree_session)).filter((n) => !Number.isNaN(n));
    const avgSec = avg(times);
    return { total, good, ratio, avgSec: avgSec.toFixed(1) };
  }, []);

  const weekBars = useMemo(() => {
    const heights = [4, 7, 5, 9, 6, 8, 5];
    const max = Math.max(...heights, 1);
    return heights.map((h, i) => ({ label: DAYS[i], h: Math.round((h / max) * 100) }));
  }, []);

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div class="mb-6 flex items-center gap-2">
          <Button variant="ghost" class="btn-sm gap-1 px-2" onClick={() => route("/")}>
            <ArrowLeft class="h-4 w-4" aria-hidden />
            Accueil
          </Button>
        </div>
        <h1 class="mb-2 text-2xl font-bold tracking-tight text-base-content">Statistiques</h1>
        <p class="mb-6 text-sm text-base-content/60">Indicateurs mock basés sur user_kpi et sessions fictives.</p>

        <div class="mb-6 grid gap-3 sm:grid-cols-3">
          <KpiCard
            title="Ratio correct"
            value={`${kpis.ratio}%`}
            hint={`${kpis.good} / ${kpis.total} réponses`}
            accent="flow"
            icon={<Target class="h-5 w-5" aria-hidden />}
          />
          <KpiCard
            title="Temps moyen"
            value={`${kpis.avgSec}s`}
            hint="Par question (mock)"
            accent="learn"
            icon={<Clock class="h-5 w-5" aria-hidden />}
          />
          <KpiCard
            title="Questions répondues"
            value={`${kpis.total}`}
            hint="Enregistrements KPI"
            accent="flow"
            icon={<TrendingUp class="h-5 w-5" aria-hidden />}
          />
        </div>

        <Card class="mb-6">
          <p class="mb-4 text-sm font-medium text-base-content">Activité (7 jours — décoratif)</p>
          <div class="flex h-36 items-end justify-between gap-2">
            {weekBars.map((b) => (
              <div key={b.label} class="flex flex-1 flex-col items-center gap-2">
                <div
                  class="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-flow to-learn/80 opacity-90 transition hover:opacity-100"
                  style={{ height: `${Math.max(b.h, 8)}%` }}
                  title={`${b.label}`}
                />
                <span class="text-[10px] font-medium text-base-content/50">{b.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p class="mb-4 text-sm font-medium text-base-content">Historique des sessions</p>
          <ul class="space-y-3">
            {mockSessionSummaries.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  class="flex w-full flex-col gap-2 rounded-[var(--radius-field)] border border-base-content/10 bg-base-200/30 p-4 text-left transition hover:border-flow/30 hover:bg-base-200/50 sm:flex-row sm:items-center sm:justify-between"
                  onClick={() => route(`/stats/session/${s.id}`)}
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
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
