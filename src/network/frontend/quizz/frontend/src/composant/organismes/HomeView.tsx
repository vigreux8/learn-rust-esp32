import { Sparkles } from "lucide-preact";
import { route } from "preact-router";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { Button } from "../atomes/Button";

export function HomeView() {
  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <main class="fl-page-enter flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div class="max-w-md text-center">
          <p class="mb-4 inline-flex items-center gap-2 rounded-full bg-flow/10 px-4 py-1.5 text-xs font-medium text-flow transition duration-300">
            <Sparkles class="h-4 w-4" aria-hidden />
            Mode découverte
          </p>
          <h1 class="mb-3 text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
            Prêt à apprendre ?
          </h1>
          <p class="mb-10 text-base leading-relaxed text-base-content/65">
            Les questions sont tirées au hasard parmi toutes les collections. Un parcours fluide, sans choisir de thème
            d’abord.
          </p>
          <Button
            variant="flow"
            class="btn-lg min-h-14 min-w-[220px] px-10 text-base shadow-xl shadow-flow/25 transition duration-300 hover:scale-[1.03]"
            onClick={() => route("/play/random")}
          >
            Commencer les quiz
          </Button>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
