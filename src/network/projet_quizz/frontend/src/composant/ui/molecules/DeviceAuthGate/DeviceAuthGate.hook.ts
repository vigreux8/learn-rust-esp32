import { useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";

import { fetchDeviceLookup, registerDeviceWithPseudot } from "../../../../lib/api";
import { DEMO_DEVICE_MAC } from "../../../../lib/config";
import type { UserSession } from "../../../../lib/userSession";

type Phase = "checking" | "api-error" | "need-pseudot" | "welcome" | "ready";

export type DeviceAuthGateView = {
  session: { providerValue: UserSession | null };
  screen: {
    checking: boolean;
    apiError: { message: string; onRetry: () => void } | null;
    pseudot: { onSubmit: (pseudot: string) => void; busy: boolean; error: string | null } | null;
    welcome: { pseudot: string; onDone: () => void } | null;
  };
  body: ComponentChildren | null;
};

export function useDeviceAuthGate(children: ComponentChildren): DeviceAuthGateView {
  const [session, setSession] = useState<UserSession | null>(null);
  const [phase, setPhase] = useState<Phase>("checking");
  const [formError, setFormError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [registerBusy, setRegisterBusy] = useState(false);
  const [lookupToken, setLookupToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setApiError(null);
    (async () => {
      try {
        const res = await fetchDeviceLookup(DEMO_DEVICE_MAC);
        if (cancelled) return;
        if (res.known) {
          setSession({ userId: res.user.id, pseudot: res.user.pseudot });
          setPhase("welcome");
        } else {
          setPhase("need-pseudot");
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Erreur inconnue.";
          setApiError(msg);
          setPhase("api-error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lookupToken]);

  const submitPseudot = async (pseudot: string) => {
    setFormError(null);
    setRegisterBusy(true);
    try {
      const r = await registerDeviceWithPseudot(DEMO_DEVICE_MAC, pseudot);
      setSession({ userId: r.userId, pseudot: r.pseudot });
      setPhase("welcome");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Echec de l enregistrement.");
    } finally {
      setRegisterBusy(false);
    }
  };

  return {
    session: {
      providerValue: phase === "ready" ? session : null,
    },
    screen: {
      checking: phase === "checking",
      apiError:
        phase === "api-error" && apiError != null
          ? { message: apiError, onRetry: () => setLookupToken((n) => n + 1) }
          : null,
      pseudot:
        phase === "need-pseudot"
          ? { onSubmit: submitPseudot, busy: registerBusy, error: formError }
          : null,
      welcome:
        phase === "welcome" && session != null
          ? { pseudot: session.pseudot, onDone: () => setPhase("ready") }
          : null,
    },
    body: phase === "ready" && session != null ? children : null,
  };
}
