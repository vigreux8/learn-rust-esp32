import { useState } from "preact/hooks";
import { Sparkles } from "lucide-preact";
import { route } from "preact-router";
import {
  buildPlayOrdersFromPicker,
  buildPlaySessionQuery,
  playOrdersRequireUserId,
  type PlayQtype,
  type PlaySortBase,
} from "../../lib/playOrder";
import { useUserSession } from "../../lib/userSession";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { Button } from "../atomes/Button";
import { PlayModePicker } from "../molecules/PlayModePicker";

/**
 * Page d’accueil : présentation du mode quiz aléatoire et choix des modes / type avant lecture.
 */
export function HomeView() {
  const { userId } = useUserSession();
  const [neverAnswered, setNeverAnswered] = useState(false);
  const [sortBase, setSortBase] = useState<PlaySortBase>("none");
  const [errorPriority, setErrorPriority] = useState(false);
  const [shuffleExtra, setShuffleExtra] = useState(false);
  const [playQtype, setPlayQtype] = useState<PlayQtype>("melanger");
  const [playInfinite, setPlayInfinite] = useState(false);

  const goPlay = () => {
    const orders = buildPlayOrdersFromPicker({
      neverAnswered,
      sortBase,
      errorPriority,
      shuffleExtra,
    });
    const q = buildPlaySessionQuery({
      orders,
      qtype: playQtype,
      infinite: playInfinite,
      userId: playOrdersRequireUserId(orders) ? userId : undefined,
    });
    route(`/play/random${q}`);
  };

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
            Les questions viennent de toutes les collections. Combine plusieurs modes (ex. anciennes d’abord + priorité
            aux erreurs), choisis le type de questions, et éventuellement une session infinie par paquets de 15.
          </p>
          <div class="mx-auto mb-8 w-full max-w-xs space-y-5 text-left">
            <PlayModePicker
              idPrefix="home"
              neverAnswered={neverAnswered}
              onNeverAnswered={setNeverAnswered}
              sortBase={sortBase}
              onSortBase={setSortBase}
              errorPriority={errorPriority}
              onErrorPriority={setErrorPriority}
              shuffleExtra={shuffleExtra}
              onShuffleExtra={setShuffleExtra}
            />
            <div>
              <label
                class="mb-1 block text-center text-xs font-semibold uppercase tracking-wide text-base-content/45"
                for="home-play-qtype"
              >
                Type de questions
              </label>
              <select
                id="home-play-qtype"
                class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100 text-sm"
                value={playQtype}
                onChange={(e) => {
                  const v = (e.target as HTMLSelectElement).value;
                  if (v === "histoire" || v === "pratique" || v === "melanger") setPlayQtype(v);
                }}
              >
                <option value="melanger">Mélanger (tout)</option>
                <option value="histoire">Histoire</option>
                <option value="pratique">Pratique</option>
              </select>
            </div>
            <label class="flex cursor-pointer items-center justify-center gap-2 text-sm text-base-content/80">
              <input
                type="checkbox"
                class="checkbox checkbox-sm checkbox-primary"
                checked={playInfinite}
                onChange={(e) => setPlayInfinite((e.target as HTMLInputElement).checked)}
              />
              Session infinie (paquets de 15 questions)
            </label>
          </div>
          <Button
            variant="flow"
            class="btn-lg min-h-14 min-w-[220px] px-10 text-base shadow-xl shadow-flow/25 transition duration-300 hover:scale-[1.03]"
            onClick={() => goPlay()}
          >
            Commencer les quiz
          </Button>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
