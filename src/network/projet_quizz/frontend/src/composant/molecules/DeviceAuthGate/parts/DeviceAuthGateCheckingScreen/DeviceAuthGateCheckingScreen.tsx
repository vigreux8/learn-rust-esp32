export function DeviceAuthGateCheckingScreen() {
  return (
    <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-base-100/95">
      <span class="loading loading-spinner loading-md text-flow" aria-hidden />
      <p class="text-sm text-base-content/60">Reconnaissance de l appareil...</p>
    </div>
  );
}
