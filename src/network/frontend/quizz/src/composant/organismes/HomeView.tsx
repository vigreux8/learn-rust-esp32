import { useState } from "preact/hooks";
import { Sparkles } from "lucide-preact";
import { route } from "preact-router";
import { playOrderQuerySuffix, type PlayOrder } from "../../lib/playOrder";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { Button } from "../atomes/Button";

export function HomeView() {
  const [playOrder, setPlayOrder] = useState<PlayOrder>("random");
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
          <p class="mb-6 text-base leading-relaxed text-base-content/65">
            Les questions viennent de toutes les collections. Choisis l’ordre des cartes : mélangé (défaut) ou dans un
            ordre stable (id croissant).
          </p>
          <div class="mx-auto mb-8 w-full max-w-xs text-left">
            <label
              class="mb-1 block text-center text-xs font-semibold uppercase tracking-wide text-base-content/45"
              for="home-play-order"
            >
              Mode de jeu
            </label>
            <select
              id="home-play-order"
              class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100 text-sm"
              value={playOrder}
              onChange={(e) => {
                const v = (e.target as HTMLSelectElement).value;
                setPlayOrder(v === "linear" ? "linear" : "random");
              }}
            >
              <option value="random">Aléatoire (défaut)</option>
              <option value="linear">Linéaire (ordre stable)</option>
            </select>
          </div>
          <Button
            variant="flow"
            class="btn-lg min-h-14 min-w-[220px] px-10 text-base shadow-xl shadow-flow/25 transition duration-300 hover:scale-[1.03]"
            onClick={() => route(`/play/random${playOrderQuerySuffix(playOrder)}`)}
          >
            Commencer les quiz
          </Button>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
