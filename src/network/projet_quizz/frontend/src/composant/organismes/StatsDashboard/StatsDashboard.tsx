import { BarChart3, Clock, Target } from "lucide-preact";
import { AppHeader } from "../../atomes/AppHeader/AppHeader";
import { AppFooter } from "../../atomes/AppFooter/AppFooter";
import { PageMain } from "../../atomes/PageMain/PageMain";
import { KpiCard } from "./parts/KpiCard";
import { Card } from "../../atomes/Card/Card";
import { Badge } from "../../atomes/Badge/Badge";
import { Button } from "../../atomes/Button/Button";
import { useStatsDashboard } from "./StatsDashboard.hook";
import { STATS_DASHBOARD_STYLES } from "./StatsDashboard.styles";
import type { StatsDashboardProps } from "./StatsDashboard.types";

export function StatsDashboard(props: StatsDashboardProps = {}) {
  const { page, content, retry, navigation } = useStatsDashboard(props);

  return (
    <div class={STATS_DASHBOARD_STYLES.root}>
      <AppHeader />
      <PageMain>
        <h1 class="mb-2 text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Dashboard</h1>
        <p class="mb-6 text-sm text-base-content/60">
          Donnees live : <code class="text-xs">/stats/kpis</code> et <code class="text-xs">/stats/sessions</code> pour
          l utilisateur connecte (id {page.userId}).
        </p>

        {page.loading ? (
          <p class="text-sm text-base-content/60">Chargement...</p>
        ) : page.error ? (
          <div class="rounded-[var(--radius-box)] border border-base-content/10 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/65">
            <p class="mb-3">Impossible de charger les statistiques.</p>
            <Button variant="flow" class="btn-sm" onClick={() => void retry.onRetry()}>
              Reessayer
            </Button>
          </div>
        ) : content == null ? null : (
          <>
            <div class="mb-6 grid gap-3 sm:grid-cols-3">
              <KpiCard
                title="Ratio correct"
                value={`${content.kpisAgg.ratio}%`}
                hint={`${content.kpisAgg.good} / ${content.kpisAgg.total} reponses`}
                accent="flow"
                icon={<Target class="h-5 w-5" aria-hidden />}
              />
              <KpiCard
                title="Temps moyen"
                value={content.kpisAgg.avgSecLabel}
                hint="Moyenne des durees enregistrees (champ duree_session)"
                accent="learn"
                icon={<Clock class="h-5 w-5" aria-hidden />}
              />
              <KpiCard
                title="Volume & couverture"
                value={`${content.kpisAgg.total}`}
                hint={content.kpisAgg.sessionsHint}
                accent="flow"
                icon={<BarChart3 class="h-5 w-5" aria-hidden />}
              />
            </div>

            <Card class="mb-6 transition duration-300">
              <p class="mb-4 text-sm font-medium text-base-content">Reponses enregistrees (7 derniers jours)</p>
              <p class="mb-3 text-xs text-base-content/50">
                Agregat des lignes <code class="text-[10px]">user_kpi</code> par date locale (fuseau du navigateur).
              </p>
              <div class="flex h-36 items-end justify-between gap-2">
                {content.weekBars.map((b) => (
                  <div key={b.key} class="flex flex-1 flex-col items-center gap-2">
                    <div
                      class={`w-full max-w-10 rounded-t-full bg-gradient-to-t from-flow to-learn/80 transition-all duration-300 ease-out hover:opacity-100 ${b.count > 0 ? "opacity-90" : "opacity-35"}`}
                      style={{ height: `${b.barHeightPct}%` }}
                      title={`${b.count} reponse(s) · ${b.key}`}
                    />
                    <span class="text-[10px] font-medium text-base-content/50">{b.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card class="transition duration-300">
              <p class="mb-4 text-sm font-medium text-base-content">Historique des sessions</p>
              {content.sessions.length === 0 ? (
                <p class="text-sm text-base-content/55">Aucune session agregee pour cet utilisateur.</p>
              ) : (
                <ul class="space-y-3">
                  {content.sessions.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        class="flex w-full flex-col gap-2 rounded-full border border-base-content/10 bg-base-200/30 px-4 py-4 text-left transition-all duration-300 ease-out hover:border-flow/30 hover:bg-base-200/55 sm:flex-row sm:items-center sm:justify-between"
                        onClick={() => navigation.onOpenSessionDetail(String(s.id))}
                      >
                        <div>
                          <p class="font-medium text-base-content">{s.collectionName}</p>
                          <p class="text-xs text-base-content/50">{s.date}</p>
                        </div>
                        <div class="flex items-center gap-2">
                          <Badge tone="learn">{s.scoreLabel}</Badge>
                          <span class="text-xs text-flow">Details →</span>
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
