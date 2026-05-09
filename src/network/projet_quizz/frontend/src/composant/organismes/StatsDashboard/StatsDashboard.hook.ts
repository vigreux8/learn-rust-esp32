import { useMemo } from "preact/hooks";
import { route } from "preact-router";
import { useUserSession } from "../../../lib/userSession";
import {
  computeKpisAgg,
  dailyActivityLast7Days,
  presentWeekBars,
} from "./StatsDashboard.metier";
import type { StatsDashboardProps } from "./StatsDashboard.types";
import { useStatsDashboardBootstrap } from "./hooks/useStatsDashboardBootstrap";

export function useStatsDashboard(_props: StatsDashboardProps) {
  void _props;
  const { userId } = useUserSession();
  const bootstrap = useStatsDashboardBootstrap({ identity: { userId } });

  const content = useMemo(() => {
    if (bootstrap.status.loading || bootstrap.status.error != null) {
      return null;
    }
    const weekBars = dailyActivityLast7Days(bootstrap.data.kpis);
    return {
      kpisAgg: computeKpisAgg(bootstrap.data.kpis, bootstrap.data.sessions),
      weekBars: presentWeekBars(weekBars),
      sessions: bootstrap.data.sessions,
    };
  }, [
    bootstrap.data.kpis,
    bootstrap.data.sessions,
    bootstrap.status.error,
    bootstrap.status.loading,
  ]);

  return {
    page: {
      loading: bootstrap.status.loading,
      error: bootstrap.status.error != null,
      userId,
    },
    content,
    retry: {
      onRetry: () => void bootstrap.loaders.load(),
    },
    navigation: {
      onOpenSessionDetail: (sessionId: string) =>
        route(`/dashboard/session/${encodeURIComponent(sessionId)}`),
    },
  };
}
