import type { UserKpiRow } from "../../../types/quizz";
import type { DayBar, KpisAgg } from "./StatsDashboard.types";

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function parseDurationSeconds(raw: string): number | null {
  const s = raw.trim().replace(",", ".");
  if (!s) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function localYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function dailyActivityLast7Days(kpis: UserKpiRow[], now = new Date()): DayBar[] {
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

export function computeKpisAgg(
  kpis: UserKpiRow[],
  sessions: { good: number; total: number }[],
): KpisAgg {
  const total = kpis.length;
  const good = kpis.filter((k) => k.correct).length;
  const ratio = total === 0 ? 0 : Math.round((good / total) * 100);
  const times = kpis.map((k) => parseDurationSeconds(k.duree_session)).filter((n): n is number => n != null);
  const avgSec = avg(times);
  const uniqueQuestions = new Set(kpis.map((k) => k.question_id)).size;
  const sessionsTotalGood = sessions.reduce((acc, x) => acc + x.good, 0);
  const sessionsTotalAnswers = sessions.reduce((acc, x) => acc + x.total, 0);
  const sessionsHint =
    sessions.length === 0
      ? `${uniqueQuestions} question${uniqueQuestions !== 1 ? "s" : ""} distincte${uniqueQuestions !== 1 ? "s" : ""} · aucune session dans l historique`
      : `${uniqueQuestions} question${uniqueQuestions !== 1 ? "s" : ""} distincte${uniqueQuestions !== 1 ? "s" : ""} · sessions : ${sessionsTotalGood}/${sessionsTotalAnswers} bonnes reponses`;
  return {
    total,
    good,
    ratio,
    avgSecLabel: times.length === 0 ? "—" : `${avgSec.toFixed(1)} s`,
    uniqueQuestions,
    sessionsHint,
  };
}
