import { useMemo } from "preact/hooks";
import { route } from "preact-router";
import { Trophy } from "lucide-preact";
import {
  buildPlaySessionQuery,
  isPlayOrder,
  playOrdersRequireUserId,
  type PlayOrder,
} from "../../lib/playOrder";
import { readLastQuizResult } from "../../lib/lastQuizResult";
import { useUserSession } from "../../lib/userSession";
import { AppHeader } from "../molecules/AppHeader/AppHeader";
import { AppFooter } from "../molecules/AppFooter/AppFooter";
import { Card } from "../atomes/Card/Card";
import { Button } from "../atomes/Button/Button";
import { Badge } from "../atomes/Badge/Badge";

/**
 * Affiche le bilan du dernier quiz terminé (score, pourcentage) et propose de relancer avec les mêmes paramètres.
 */
export function QuizResultsView() {
  const { userId } = useUserSession();
  const result = useMemo(() => readLastQuizResult(), []);

  if (!result) {
    return (
      <div class="flex min-h-dvh flex-col">
        <AppHeader />
        <main class="fl-page-enter mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <p class="text-base text-base-content/70">Aucun résultat récent. Lance un quiz depuis l’accueil ou une collection.</p>
          <Button variant="flow" onClick={() => route("/")}>
            Accueil
          </Button>
        </main>
        <AppFooter />
      </div>
    );
  }

  const pct = result.total <= 0 ? 0 : Math.round((result.good / result.total) * 100);
  const replay = () => {
    const orders: PlayOrder[] =
      result.playOrders != null && result.playOrders.length > 0
        ? result.playOrders
        : result.playOrder != null && isPlayOrder(result.playOrder)
          ? [result.playOrder]
          : ["random"];
    const q = buildPlaySessionQuery({
      orders,
      qtype: result.playQtype ?? "melanger",
      infinite: result.playInfinite === true,
      userId: playOrdersRequireUserId(orders) ? userId : undefined,
    });
    if (result.mode === "random") route(`/play/random${q}`);
    else if (result.collectionId != null) route(`/play/${result.collectionId}${q}`);
    else route("/collections");
  };

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <main class="fl-page-enter mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-10">
        <Card class="w-full text-center transition duration-300">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-flow to-learn text-white shadow-xl shadow-flow/25 transition duration-300 hover:scale-105">
            <Trophy class="h-7 w-7" aria-hidden />
          </div>
          <Badge tone="flow" class="mb-3">
            Session terminée
          </Badge>
          <h1 class="mb-2 text-2xl font-bold tracking-tight text-base-content">Résultat</h1>
          <p class="mb-6 text-sm text-base-content/65">{result.collectionName}</p>
          <p class="mb-1 text-4xl font-semibold text-flow">{result.good}/{result.total}</p>
          <p class="mb-8 text-sm text-base-content/55">{pct}% de bonnes réponses</p>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="flow" onClick={replay}>
              Rejouer
            </Button>
            <Button variant="outline" onClick={() => route("/collections")}>
              Collections
            </Button>
            <Button variant="ghost" onClick={() => route("/")}>
              Accueil
            </Button>
          </div>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
