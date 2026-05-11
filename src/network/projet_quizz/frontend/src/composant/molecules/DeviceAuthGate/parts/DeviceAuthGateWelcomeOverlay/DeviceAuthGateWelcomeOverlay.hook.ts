import { useEffect, useRef, useState } from "preact/hooks";

import type { DeviceAuthGateWelcomeOverlayProps } from "./DeviceAuthGateWelcomeOverlay.types";

export function useDeviceAuthGateWelcomeOverlay(props: DeviceAuthGateWelcomeOverlayProps) {
  const { actions } = props;
  const [fadeOut, setFadeOut] = useState(false);
  const finished = useRef(false);

  const safeDone = () => {
    if (finished.current) return;
    finished.current = true;
    actions.onDone();
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

  return {
    display: { fadeOut },
    events: {
      onTransitionEnd: (e: TransitionEvent) => {
        if (e.target !== e.currentTarget) return;
        if (e.propertyName === "opacity" && fadeOut) safeDone();
      },
    },
    data: props.data,
  };
}
