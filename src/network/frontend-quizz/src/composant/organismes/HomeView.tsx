import { Sparkles } from "lucide-preact";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { CollectionCard } from "../molecules/CollectionCard";
import { listCollectionsUi } from "../../mocks";

export function HomeView() {
  const collections = listCollectionsUi();

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div class="mb-8 space-y-3 text-center sm:text-left">
          <p class="inline-flex items-center justify-center gap-2 rounded-full bg-flow/10 px-3 py-1 text-xs font-medium text-flow sm:justify-start">
            <Sparkles class="h-3.5 w-3.5" aria-hidden />
            Choisis une collection
          </p>
          <h1 class="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">Apprends en douceur</h1>
          <p class="mx-auto max-w-xl text-base text-base-content/65 sm:mx-0">
            Flow pour avancer, Learn pour ancrer. Des quizz clairs, un parcours agréable — données mock pour la démo.
          </p>
        </div>
        <ul class="flex flex-col gap-4">
          {collections.map((c) => (
            <li key={c.id}>
              <CollectionCard collection={c} />
            </li>
          ))}
        </ul>
      </main>
      <AppFooter />
    </div>
  );
}
