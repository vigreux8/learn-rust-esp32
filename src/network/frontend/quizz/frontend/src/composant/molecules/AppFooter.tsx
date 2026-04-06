import { Wifi } from "lucide-preact";
import { APP_VERSION } from "../../mocks";

export function AppFooter() {
  return (
    <footer class="mt-auto border-t border-base-content/5 bg-base-100/50 py-4 text-center text-xs text-base-content/55">
      <div class="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4">
        <span>FlowLearn v{APP_VERSION}</span>
        <span class="hidden sm:inline text-base-content/25">·</span>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-flow/10 px-2.5 py-0.5 text-flow">
          <Wifi class="h-3.5 w-3.5" aria-hidden />
          ESP32 (mock) — connecté
        </span>
      </div>
    </footer>
  );
}
