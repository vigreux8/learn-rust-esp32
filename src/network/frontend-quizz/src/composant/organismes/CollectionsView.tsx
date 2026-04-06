import { Layers } from "lucide-preact";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { CollectionCard } from "../molecules/CollectionCard";
import { PageMain } from "../molecules/PageMain";
import { listCollectionsUi } from "../../mocks";

export function CollectionsView() {
  const collections = listCollectionsUi();

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <PageMain>
        <div class="mb-8 space-y-2">
          <p class="inline-flex items-center gap-2 rounded-full bg-learn/10 px-3 py-1 text-xs font-medium text-learn">
            <Layers class="h-3.5 w-3.5" aria-hidden />
            Tes collections
          </p>
          <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Choisir une collection</h1>
          <p class="max-w-xl text-sm text-base-content/60">
            Lance un quiz ciblé : uniquement les questions liées à la collection sélectionnée.
          </p>
        </div>
        <ul class="flex flex-col gap-4">
          {collections.map((c) => (
            <li key={c.id}>
              <CollectionCard collection={c} />
            </li>
          ))}
        </ul>
      </PageMain>
      <AppFooter />
    </div>
  );
}
