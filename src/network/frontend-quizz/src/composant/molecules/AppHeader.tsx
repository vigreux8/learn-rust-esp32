import { route } from "preact-router";
import { BarChart3, GraduationCap, Settings2 } from "lucide-preact";
import { Button } from "../atomes/Button";

export function AppHeader() {
  return (
    <header class="sticky top-0 z-30 border-b border-base-content/5 bg-base-100/75 backdrop-blur-md">
      <div class="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => route("/")}
          class="flex items-center gap-2 rounded-xl px-1 py-1 text-left transition hover:opacity-90"
        >
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-flow to-learn text-white shadow-md shadow-flow/25">
            <GraduationCap class="h-5 w-5" aria-hidden />
          </span>
          <div class="leading-tight">
            <p class="text-lg font-semibold tracking-tight text-base-content">FlowLearn</p>
            <p class="text-xs text-base-content/55">Flow · Learn</p>
          </div>
        </button>
        <nav class="flex shrink-0 items-center gap-2">
          <Button variant="ghost" class="btn-sm gap-1.5 px-3" onClick={() => route("/stats")}>
            <BarChart3 class="h-4 w-4" aria-hidden />
            <span class="hidden sm:inline">Stats</span>
          </Button>
          <Button variant="flow" class="btn-sm gap-1.5 px-3" onClick={() => route("/admin")}>
            <Settings2 class="h-4 w-4" aria-hidden />
            <span class="hidden sm:inline">Admin</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
