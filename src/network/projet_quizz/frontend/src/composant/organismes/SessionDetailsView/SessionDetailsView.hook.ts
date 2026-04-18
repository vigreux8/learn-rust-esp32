import { useEffect, useState } from "preact/hooks";
import { route } from "preact-router";
import { fetchSessionDetail } from "../../../lib/api";
import { useUserSession } from "../../../lib/userSession";
import type { SessionDetail } from "../../../types/quizz";
import type { SessionDetailsViewProps } from "./SessionDetailsView.types";

export function useSessionDetailsView(props: SessionDetailsViewProps) {
  const { sessionId } = props;
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

  const status = {
    loading,
    notFound: notFound || session == null,
  };

  const navigation = {
    toDashboard: () => route("/dashboard"),
  };

  return {
    status,
    navigation,
    session,
  };
}
