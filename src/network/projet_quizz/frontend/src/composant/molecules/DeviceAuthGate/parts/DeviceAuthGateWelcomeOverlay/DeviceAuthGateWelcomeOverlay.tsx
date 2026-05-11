import { useDeviceAuthGateWelcomeOverlay } from "./DeviceAuthGateWelcomeOverlay.hook";
import type { DeviceAuthGateWelcomeOverlayProps } from "./DeviceAuthGateWelcomeOverlay.types";

export function DeviceAuthGateWelcomeOverlay(props: DeviceAuthGateWelcomeOverlayProps) {
  const vm = useDeviceAuthGateWelcomeOverlay(props);

  return (
    <div
      class={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-base-100 via-base-100/98 to-base-200/90 backdrop-blur-[2px] transition-opacity duration-[900ms] ease-out ${
        vm.display.fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      onTransitionEnd={vm.events.onTransitionEnd}
    >
      <p class="fl-welcome-text px-6 text-center text-2xl font-semibold tracking-tight text-base-content sm:text-3xl">
        Bienvenue, <span class="text-flow">{vm.data.pseudot}</span>
        <span class="text-learn"> !</span>
      </p>
    </div>
  );
}
