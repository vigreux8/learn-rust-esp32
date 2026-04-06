import { ChevronRight } from "lucide-preact";
import { route } from "preact-router";
import { Card } from "../atomes/Card";
import { Badge } from "../atomes/Badge";
import { Button } from "../atomes/Button";
import type { CollectionUi } from "../../mocks";

export type CollectionCardProps = {
  collection: CollectionUi;
};

export function CollectionCard({ collection }: CollectionCardProps) {
  const n = collection.questions.length;

  return (
    <Card class="group transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-flow/10">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-2">
          <Badge tone="flow">{n} question{n > 1 ? "s" : ""}</Badge>
          <h2 class="text-xl font-semibold tracking-tight text-base-content">{collection.nom}</h2>
          <p class="text-sm text-base-content/60">Collection · mise à jour {collection.update_at.slice(0, 10)}</p>
        </div>
        <Button
          variant="flow"
          class="btn-sm gap-1 self-start sm:self-center"
          onClick={() => route(`/play/${collection.id}`)}
        >
          Jouer
          <ChevronRight class="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
        </Button>
      </div>
    </Card>
  );
}
