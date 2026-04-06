import { useMemo, useState } from "preact/hooks";
import { Layers } from "lucide-preact";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { CollectionCard } from "../molecules/CollectionCard";
import { PageMain } from "../molecules/PageMain";
import { listCollectionsUi, MOCK_USER_ID, type CollectionUi } from "../../mocks";

export type CollectionFilter = "all" | "mine" | `user-${number}`;

function filterCollections(list: CollectionUi[], filter: CollectionFilter): CollectionUi[] {
  if (filter === "all") return list;
  if (filter === "mine") return list.filter((c) => c.user_id === MOCK_USER_ID);
  if (filter.startsWith("user-")) {
    const uid = Number(filter.slice(5));
    if (Number.isFinite(uid)) return list.filter((c) => c.user_id === uid);
  }
  return list;
}

export function CollectionsView() {
  const collections = listCollectionsUi();
  const [filter, setFilter] = useState<CollectionFilter>("all");

  const autresCreateurs = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of collections) {
      if (c.user_id !== MOCK_USER_ID) {
        map.set(c.user_id, c.createur_pseudot);
      }
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [collections]);

  const filtered = useMemo(() => filterCollections(collections, filter), [collections, filter]);

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <PageMain>
        <div class="mb-6 space-y-2">
          <p class="inline-flex items-center gap-2 rounded-full bg-learn/10 px-3 py-1 text-xs font-medium text-learn">
            <Layers class="h-3.5 w-3.5" aria-hidden />
            Tes collections
          </p>
          <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Choisir une collection</h1>
          <p class="max-w-xl text-sm text-base-content/60">
            Lance un quiz ciblé : uniquement les questions liées à la collection sélectionnée.
          </p>
        </div>

        <fieldset class="mb-8">
          <legend class="mb-3 text-xs font-medium uppercase tracking-wide text-base-content/45">Filtrer</legend>
          <div class="filter">
            <input
              class="btn btn-sm rounded-full border-0 filter-reset"
              type="radio"
              name="flowlearn-collections-filter"
              aria-label="All"
              checked={filter === "all"}
              onChange={() => setFilter("all")}
            />
            <input
              class="btn btn-sm rounded-full border-0"
              type="radio"
              name="flowlearn-collections-filter"
              aria-label="Mes collections"
              checked={filter === "mine"}
              onChange={() => setFilter("mine")}
            />
            {autresCreateurs.map(([userId, pseudot]) => (
              <input
                key={userId}
                class="btn btn-sm rounded-full border-0"
                type="radio"
                name="flowlearn-collections-filter"
                aria-label={pseudot}
                checked={filter === (`user-${userId}` as CollectionFilter)}
                onChange={() => setFilter(`user-${userId}` as CollectionFilter)}
              />
            ))}
          </div>
          <p class="mt-2 text-xs text-base-content/50">
            Après un choix, les autres filtres se replient ; utilise le × pour tout réafficher (comportement DaisyUI).
          </p>
        </fieldset>

        {filtered.length === 0 ? (
          <p class="rounded-[var(--radius-box)] border border-base-content/10 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/65">
            Aucune collection pour ce filtre.
          </p>
        ) : (
          <ul class="flex flex-col gap-4">
            {filtered.map((c) => (
              <li key={c.id}>
                <CollectionCard collection={c} />
              </li>
            ))}
          </ul>
        )}
      </PageMain>
      <AppFooter />
    </div>
  );
}
