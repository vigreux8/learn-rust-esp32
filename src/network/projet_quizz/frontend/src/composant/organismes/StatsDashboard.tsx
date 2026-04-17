import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { route } from "preact-router";
import { BarChart3, Clock, Target } from "lucide-preact";
import { fetchKpis, fetchSessionSummaries } from "../../lib/api";
import { useUserSession } from "../../lib/userSession";
import type { SessionSummary, UserKpiRow } from "../../types/quizz";
import { AppHeader } from "../molecules/AppHeader/AppHeader";
import { AppFooter } from "../molecules/AppFooter/AppFooter";
import { PageMain } from "../molecules/PageMain/PageMain";
import { KpiCard } from "../molecules/KpiCard/KpiCard";
import { Card } from "../atomes/Card/Card";
import { Badge } from "../atomes/Badge/Badge";
import { Button } from "../atomes/Button/Button";

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Interprète `duree_session` renvoyée par l’API (souvent des secondes en texte). */
function parseDurationSeconds(raw: string): number | null {
  const s = raw.trim().replace(",", ".");
  if (!s) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Date locale YYYY-MM-DD (alignée sur le fuseau du navigateur). */
function localYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

type DayBar = { key: string; label: string; count: number; h: number };

/** Compte les KPI par jour sur les 7 derniers jours calendaires (incluant aujourd’hui). */
function dailyActivityLast7Days(kpis: UserKpiRow[], now = new Date()): DayBar[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const buckets: DayBar[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = localYmd(d);
    const wd = d.toLocaleDateString("fr-FR", { weekday: "short" });
    const label = wd.length > 0 ? wd.charAt(0).toUpperCase() + wd.slice(1) : key;
    buckets.push({ key, label, count: 0, h: 0 });
  }
  for (const k of kpis) {
    const t = new Date(k.create_at);
    if (Number.isNaN(t.getTime())) continue;
    const ymd = localYmd(t);
    const b = buckets.find((x) => x.key === ymd);
    if (b) b.count += 1;
  }
  const maxCount = Math.max(...buckets.map((b) => b.count), 0);
  for (const b of buckets) {
    b.h = maxCount === 0 ? 0 : Math.round((b.count / maxCount) * 100);
  }
  return buckets;
}

/**
 * Tableau de bord statistiques : agrégats KPI, activité sur 7 jours et liste des sessions pour l’utilisateur connecté.
 */
export function StatsDashboard() {
  const { userId } = useUserSession();
  const [kpis, setKpis] = useState<UserKpiRow[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [k, s] = await Promise.all([fetchKpis(userId), fetchSessionSummaries(userId)]);
      setKpis(k);
      setSessions(s);
    } catch {
      setError("fetch");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const kpisAgg = useMemo(() => {
    const total = kpis.length;
    const good = kpis.filter((k) => k.correct).length;
    const ratio = total === 0 ? 0 : Math.round((good / total) * 100);
    const times = kpis
      .map((k) => parseDurationSeconds(k.duree_session))
      .filter((n): n is number => n != null);
    const avgSec = avg(times);
    const uniqueQuestions = new Set(kpis.map((k) => k.question_id)).size;
    const sessionsTotalGood = sessions.reduce((acc, x) => acc + x.good, 0);
    const sessionsTotalAnswers = sessions.reduce((acc, x) => acc + x.total, 0);
    const sessionsHint =
      sessions.length === 0
        ? `${uniqueQuestions} question${uniqueQuestions !== 1 ? "s" : ""} distincte${uniqueQuestions !== 1 ? "s" : ""} · aucune session dans l’historique`
        : `${uniqueQuestions} question${uniqueQuestions !== 1 ? "s" : ""} distincte${uniqueQuestions !== 1 ? "s" : ""} · sessions : ${sessionsTotalGood}/${sessionsTotalAnswers} bonnes réponses`;
    return {
      total,
      good,
      ratio,
      avgSecLabel: times.length === 0 ? "—" : `${avgSec.toFixed(1)} s`,
      uniqueQuestions,
      sessionsHint,
    };
  }, [kpis, sessions]);

  const weekBars = useMemo(() => dailyActivityLast7Days(kpis), [kpis]);

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <PageMain>
        <h1 class="mb-2 text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Dashboard</h1>
        <p class="mb-6 text-sm text-base-content/60">
          Données live : <code class="text-xs">/stats/kpis</code> et <code class="text-xs">/stats/sessions</code> pour
          l’utilisateur connecté (id {userId}).
        </p>

        {loading ? (
          <p class="text-sm text-base-content/60">Chargement…</p>
        ) : error ? (
          <div class="rounded-[var(--radius-box)] border border-base-content/10 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/65">
            <p class="mb-3">Impossible de charger les statistiques.</p>
            <Button variant="flow" class="btn-sm" onClick={() => void loadStats()}>
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
                value={kpisAgg.avgSecLabel}
                hint="Moyenne des durées enregistrées (champ duree_session)"
                accent="learn"
                icon={<Clock class="h-5 w-5" aria-hidden />}
              />
              <KpiCard
                title="Volume & couverture"
                value={`${kpisAgg.total}`}
                hint={kpisAgg.sessionsHint}
                accent="flow"
                icon={<BarChart3 class="h-5 w-5" aria-hidden />}
              />
            </div>

            <Card class="mb-6 transition duration-300">
              <p class="mb-4 text-sm font-medium text-base-content">Réponses enregistrées (7 derniers jours)</p>
              <p class="mb-3 text-xs text-base-content/50">
                Agrégat des lignes <code class="text-[10px]">user_kpi</code> par date locale (fuseau du navigateur).
              </p>
              <div class="flex h-36 items-end justify-between gap-2">
                {weekBars.map((b) => {
                  const hasAny = weekBars.some((x) => x.count > 0);
                  const barH = !hasAny ? 8 : Math.max(b.h, b.count > 0 ? 14 : 10);
                  return (
                    <div key={b.key} class="flex flex-1 flex-col items-center gap-2">
                      <div
                        class={`w-full max-w-10 rounded-t-full bg-gradient-to-t from-flow to-learn/80 transition-all duration-300 ease-out hover:opacity-100 ${b.count > 0 ? "opacity-90" : "opacity-35"}`}
                        style={{ height: `${barH}%` }}
                        title={`${b.count} réponse(s) · ${b.key}`}
                      />
                      <span class="text-[10px] font-medium text-base-content/50">{b.label}</span>
                    </div>
                  );
                })}
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
