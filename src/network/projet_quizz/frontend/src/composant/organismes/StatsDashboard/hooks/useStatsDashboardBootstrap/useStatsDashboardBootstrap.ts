import { useCallback, useEffect, useState } from "preact/hooks";
import { fetchKpis, fetchSessionSummaries } from "../../../../../lib/api";
import type { SessionSummary, UserKpiRow } from "../../../../../types/quizz";
import type { UseStatsDashboardBootstrapProps } from "./useStatsDashboardBootstrap.types";

/**
 * Données du tableau de bord stats : KPI utilisateur, résumés de sessions, chargement et erreurs.
 */
export function useStatsDashboardBootstrap({ identity }: UseStatsDashboardBootstrapProps) {
  const { userId } = identity;

  const [kpis, setKpis] = useState<UserKpiRow[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
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
    void load();
  }, [load]);

  return {
    status: { loading, error },
    data: { kpis, sessions },
    loaders: { load },
  };
}
