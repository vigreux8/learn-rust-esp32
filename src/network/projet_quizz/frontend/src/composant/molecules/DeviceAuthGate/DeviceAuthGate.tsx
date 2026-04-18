import { useEffect, useRef, useState } from "preact/hooks";
import { fetchDeviceLookup, registerDeviceWithPseudot } from "../../../lib/api";
import { DEMO_DEVICE_MAC } from "../../../lib/config";
import { UserSessionContext, type UserSession } from "../../../lib/userSession";
import { Button } from "../../atomes/Button/Button";
import { Card } from "../../atomes/Card/Card";
import { DEVICE_AUTH_GATE_STYLES } from "./DeviceAuthGate.styles";
import type { DeviceAuthGateProps } from "./DeviceAuthGate.types";

type Phase = "checking" | "api-error" | "need-pseudot" | "welcome" | "ready";

function WelcomeOverlay({ pseudot, onDone }: { pseudot: string; onDone: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  const finished = useRef(false);
  const safeDone = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = window.setTimeout(safeDone, 450);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setFadeOut(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      class={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-base-100 via-base-100/98 to-base-200/90 backdrop-blur-[2px] transition-opacity duration-[900ms] ease-out ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      onTransitionEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.propertyName === "opacity" && fadeOut) safeDone();
      }}
    >
      <p class="fl-welcome-text px-6 text-center text-2xl font-semibold tracking-tight text-base-content sm:text-3xl">
        Bienvenue, <span class="text-flow">{pseudot}</span>
        <span class="text-learn"> !</span>
      </p>
    </div>
  );
}

function PseudotScreen({
  onSubmit,
  busy,
  error,
}: {
  onSubmit: (pseudot: string) => void;
  busy: boolean;
  error: string | null;
}) {
  const [value, setValue] = useState("");

  return (
    <div class={DEVICE_AUTH_GATE_STYLES.fullscreenCenter}>
      <Card class="w-full max-w-md border-base-content/10 shadow-xl shadow-flow/5">
        <h1 class="mb-1 text-xl font-bold text-base-content">Premiere visite</h1>
        <p class="mb-4 text-sm text-base-content/65">
          Cet appareil n est pas reconnu en base (ou la base est vide). Indique ton pseudonyme pour creer ton profil
          (demo : MAC simulee <code class="rounded bg-base-200 px-1.5 py-0.5 text-xs">{DEMO_DEVICE_MAC}</code>).
        </p>
        <label class="mb-2 block text-sm font-medium text-base-content/80" for="gate-pseudot">
          Pseudonyme
        </label>
        <input
          id="gate-pseudot"
          class="input input-bordered mb-3 w-full rounded-xl border-base-content/15 bg-base-100"
          type="text"
          autoComplete="username"
          placeholder="ex. zelda_quizz"
          value={value}
          disabled={busy}
          onInput={(e) => setValue((e.target as HTMLInputElement).value)}
        />
        {error ? <p class="mb-3 text-sm text-error">{error}</p> : null}
        <Button
          variant="flow"
          class="w-full"
          disabled={busy || !value.trim()}
          onClick={() => onSubmit(value.trim())}
        >
          {busy ? "Enregistrement..." : "Continuer"}
        </Button>
      </Card>
    </div>
  );
}

function CheckingScreen() {
  return (
    <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-base-100/95">
      <span class="loading loading-spinner loading-md text-flow" aria-hidden />
      <p class="text-sm text-base-content/60">Reconnaissance de l appareil...</p>
    </div>
  );
}

function ApiErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div class={DEVICE_AUTH_GATE_STYLES.fullscreenCenter}>
      <Card class="w-full max-w-md border-base-content/10 shadow-xl shadow-flow/5">
        <h1 class="mb-1 text-xl font-bold text-base-content">Connexion au serveur</h1>
        <p class="mb-4 text-sm text-base-content/65">{message}</p>
        <Button variant="flow" class="w-full" onClick={onRetry}>
          Reessayer
        </Button>
      </Card>
    </div>
  );
}

export function DeviceAuthGate({ children }: DeviceAuthGateProps) {
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

  return (
    <UserSessionContext.Provider value={phase === "ready" ? session : null}>
      {phase === "checking" ? <CheckingScreen /> : null}
      {phase === "api-error" && apiError ? <ApiErrorScreen message={apiError} onRetry={() => setLookupToken((n) => n + 1)} /> : null}
      {phase === "need-pseudot" ? <PseudotScreen onSubmit={submitPseudot} busy={registerBusy} error={formError} /> : null}
      {phase === "welcome" && session ? <WelcomeOverlay pseudot={session.pseudot} onDone={() => setPhase("ready")} /> : null}
      {phase === "ready" && session ? children : null}
    </UserSessionContext.Provider>
  );
}
