import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { route } from "preact-router";
import { Layers, Trash2 } from "lucide-preact";
import {
  assignCollectionToModule,
  createEmptyCollection,
  createQuizzModule,
  deleteQuizzModule,
  fetchCollections,
  fetchModules,
  unassignCollectionFromModule,
} from "../../lib/api";
import { useUserSession } from "../../lib/userSession";
import type { CollectionUi, QuizzModuleRow } from "../../types/quizz";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { CollectionCard } from "../molecules/CollectionCard";
import { PageMain } from "../molecules/PageMain";
import { Button } from "../atomes/Button";

export type CollectionFilter = "all" | "mine" | `user-${number}`;

function filterCollections(
  list: CollectionUi[],
  filter: CollectionFilter,
  myUserId: number,
): CollectionUi[] {
  if (filter === "all") return list;
  if (filter === "mine") return list.filter((c) => c.user_id === myUserId);
  if (filter.startsWith("user-")) {
    const uid = Number(filter.slice(5));
    if (Number.isFinite(uid)) return list.filter((c) => c.user_id === uid);
  }
  return list;
}

function applyModuleFilter(
  list: CollectionUi[],
  moduleFilter: number | "all",
): CollectionUi[] {
  if (moduleFilter === "all") return list;
  return list.filter((c) => (c.modules ?? []).some((m) => m.id === moduleFilter));
}

export function CollectionsView() {
  const { userId } = useUserSession();
  const [collections, setCollections] = useState<CollectionUi[]>([]);
  const [modules, setModules] = useState<QuizzModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CollectionFilter>("all");
  /** Filtre croisé : supercollection (`quizz_module`), indépendant du filtre créateur. */
  const [moduleFilter, setModuleFilter] = useState<number | "all">("all");
  const [newModuleName, setNewModuleName] = useState("");
  const [createModuleBusy, setCreateModuleBusy] = useState(false);
  const [createModuleError, setCreateModuleError] = useState<string | null>(null);
  const [assignBusyCollectionId, setAssignBusyCollectionId] = useState<number | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [deleteModuleBusyId, setDeleteModuleBusyId] = useState<number | null>(null);
  const [deleteModuleError, setDeleteModuleError] = useState<string | null>(null);
  const [newCollName, setNewCollName] = useState("");
  const [newCollModuleId, setNewCollModuleId] = useState<number | "">("");
  const [createCollBusy, setCreateCollBusy] = useState(false);
  const [createCollError, setCreateCollError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [list, mods] = await Promise.all([fetchCollections(), fetchModules()]);
    return { list, mods };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { list, mods } = await loadData();
        if (!cancelled) {
          setCollections(list);
          setModules(mods);
        }
      } catch {
        if (!cancelled) setError("fetch");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  useEffect(() => {
    if (
      moduleFilter !== "all" &&
      !modules.some((m) => m.id === moduleFilter)
    ) {
      setModuleFilter("all");
    }
  }, [modules, moduleFilter]);

  const handleCreateModule = async () => {
    const nom = newModuleName.trim();
    if (!nom) return;
    setCreateModuleBusy(true);
    setCreateModuleError(null);
    try {
      const row = await createQuizzModule(nom);
      setModules((prev) => [...prev, row].sort((a, b) => a.id - b.id));
      setNewModuleName("");
    } catch (e) {
      setCreateModuleError(e instanceof Error ? e.message : "Création impossible.");
    } finally {
      setCreateModuleBusy(false);
    }
  };

  const handleAssign = async (collectionId: number, moduleId: number) => {
    setAssignBusyCollectionId(collectionId);
    setAssignError(null);
    try {
      const updated = await assignCollectionToModule(collectionId, moduleId);
      setCollections((prev) => prev.map((c) => (c.id === collectionId ? updated : c)));
    } catch (e) {
      setAssignError(e instanceof Error ? e.message : "Assignation impossible.");
    } finally {
      setAssignBusyCollectionId(null);
    }
  };

  const handleUnassign = async (collectionId: number, moduleId: number) => {
    setAssignBusyCollectionId(collectionId);
    setAssignError(null);
    try {
      const updated = await unassignCollectionFromModule(collectionId, moduleId);
      setCollections((prev) => prev.map((c) => (c.id === collectionId ? updated : c)));
    } catch (e) {
      setAssignError(e instanceof Error ? e.message : "Retrait impossible.");
    } finally {
      setAssignBusyCollectionId(null);
    }
  };

  const handleCreateCollection = async () => {
    const nom = newCollName.trim();
    if (!nom) return;
    setCreateCollBusy(true);
    setCreateCollError(null);
    try {
      const body: { userId: number; nom: string; moduleId?: number } = {
        userId,
        nom,
      };
      if (newCollModuleId !== "") body.moduleId = Number(newCollModuleId);
      const ui = await createEmptyCollection(body);
      setCollections((prev) => [...prev, ui].sort((a, b) => a.id - b.id));
      setNewCollName("");
      setNewCollModuleId("");
      const modQ = body.moduleId != null ? `?module=${body.moduleId}` : "";
      route(`/questions/${ui.id}${modQ}`);
    } catch (e) {
      setCreateCollError(e instanceof Error ? e.message : "Création impossible.");
    } finally {
      setCreateCollBusy(false);
    }
  };

  const handleDeleteModule = async (m: QuizzModuleRow) => {
    const ok = window.confirm(
      `Supprimer la supercollection « ${m.nom} » ?\n\nLes liens avec les collections seront retirés. Les collections elles-mêmes ne sont pas supprimées.`,
    );
    if (!ok) return;
    setDeleteModuleError(null);
    setDeleteModuleBusyId(m.id);
    try {
      await deleteQuizzModule(m.id);
      setModules((prev) => prev.filter((x) => x.id !== m.id));
      setCollections((prev) =>
        prev.map((c) => ({
          ...c,
          modules: (c.modules ?? []).filter((mod) => mod.id !== m.id),
        })),
      );
    } catch (e) {
      setDeleteModuleError(e instanceof Error ? e.message : "Suppression impossible.");
    } finally {
      setDeleteModuleBusyId(null);
    }
  };

  const autresCreateurs = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of collections) {
      if (c.user_id !== userId) {
        map.set(c.user_id, c.createur_pseudot);
      }
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [collections, userId]);

  const filtered = useMemo(() => {
    const byCreator = filterCollections(collections, filter, userId);
    return applyModuleFilter(byCreator, moduleFilter);
  }, [collections, filter, userId, moduleFilter]);

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

        {loading ? (
          <p class="text-sm text-base-content/60">Chargement…</p>
        ) : error ? (
          <div class="rounded-[var(--radius-box)] border border-base-content/10 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/65">
            <p class="mb-3">Impossible de charger les collections (API indisponible ?).</p>
            <Button
              variant="flow"
              class="btn-sm"
              onClick={() => {
                setLoading(true);
                setError(null);
                loadData()
                  .then(({ list, mods }) => {
                    setCollections(list);
                    setModules(mods);
                  })
                  .catch(() => setError("fetch"))
                  .finally(() => setLoading(false));
              }}
            >
              Réessayer
            </Button>
          </div>
        ) : (
          <>
            <section class="mb-8 rounded-[var(--radius-box)] border border-base-content/10 bg-base-200/30 p-4 sm:p-5">
              <h2 class="text-sm font-semibold tracking-tight text-base-content">Supercollections</h2>
              <p class="mt-1 max-w-2xl text-xs text-base-content/55">
                Une supercollection correspond à un <code class="rounded bg-base-100 px-1 py-0.5">quizz_module</code> en
                base : tu peux en créer une nouvelle, puis rattacher tes collections ci-dessous.
              </p>
              {modules.length > 0 ? (
                <ul class="mt-3 flex flex-col gap-2">
                  {modules.map((m) => (
                    <li
                      key={m.id}
                      class="flex items-center justify-between gap-3 rounded-xl border border-learn/25 bg-learn/10 px-3 py-2"
                    >
                      <span class="min-w-0 flex-1 text-xs font-medium text-learn">{m.nom}</span>
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs shrink-0 gap-1 text-error hover:bg-error/10"
                        aria-label={`Supprimer la supercollection ${m.nom}`}
                        disabled={deleteModuleBusyId !== null || assignBusyCollectionId !== null}
                        onClick={() => void handleDeleteModule(m)}
                      >
                        {deleteModuleBusyId === m.id ? (
                          <span class="loading loading-spinner loading-xs" aria-hidden />
                        ) : (
                          <Trash2 class="h-4 w-4" aria-hidden />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p class="mt-3 text-xs text-base-content/50">Aucune supercollection pour l’instant.</p>
              )}
              {deleteModuleError ? <p class="mt-2 text-xs text-error">{deleteModuleError}</p> : null}
              <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
                <div class="flex-1">
                  <label class="mb-1 block text-xs font-medium text-base-content/60" for="new-supercollection-name">
                    Nouvelle supercollection
                  </label>
                  <input
                    id="new-supercollection-name"
                    class="input input-bordered input-sm w-full rounded-xl border-base-content/15 bg-base-100"
                    type="text"
                    placeholder="ex. Sociologie · Europe"
                    value={newModuleName}
                    disabled={createModuleBusy}
                    onInput={(e) => setNewModuleName((e.target as HTMLInputElement).value)}
                  />
                </div>
                <Button
                  variant="learn"
                  class="btn-sm shrink-0"
                  disabled={createModuleBusy || !newModuleName.trim()}
                  onClick={() => void handleCreateModule()}
                >
                  {createModuleBusy ? "Création…" : "Créer"}
                </Button>
              </div>
              {createModuleError ? <p class="mt-2 text-xs text-error">{createModuleError}</p> : null}
            </section>

            <section class="mb-8 rounded-[var(--radius-box)] border border-base-content/10 bg-base-200/30 p-4 sm:p-5">
              <h2 class="text-sm font-semibold tracking-tight text-base-content">Nouvelle collection</h2>
              <p class="mt-1 max-w-2xl text-xs text-base-content/55">
                Crée une collection vide, éventuellement déjà rattachée à une supercollection, puis ouvre la page
                Questions pour y importer via le LLM.
              </p>
              <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div class="min-w-0 flex-1 sm:min-w-[12rem]">
                  <label class="mb-1 block text-xs font-medium text-base-content/60" for="new-collection-name">
                    Nom
                  </label>
                  <input
                    id="new-collection-name"
                    class="input input-bordered input-sm w-full rounded-xl border-base-content/15 bg-base-100"
                    type="text"
                    placeholder="ex. Révisions chapitre 3"
                    value={newCollName}
                    disabled={createCollBusy}
                    onInput={(e) => setNewCollName((e.target as HTMLInputElement).value)}
                  />
                </div>
                <div class="w-full sm:w-auto sm:min-w-[10rem]">
                  <label class="mb-1 block text-xs font-medium text-base-content/60" for="new-collection-module">
                    Supercollection (optionnel)
                  </label>
                  <select
                    id="new-collection-module"
                    class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100"
                    value={newCollModuleId === "" ? "" : String(newCollModuleId)}
                    disabled={createCollBusy || modules.length === 0}
                    onChange={(e) => {
                      const v = (e.target as HTMLSelectElement).value;
                      setNewCollModuleId(v === "" ? "" : Number(v));
                    }}
                  >
                    <option value="">—</option>
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="flow"
                  class="btn-sm shrink-0"
                  disabled={createCollBusy || !newCollName.trim()}
                  onClick={() => void handleCreateCollection()}
                >
                  {createCollBusy ? "Création…" : "Créer collection"}
                </Button>
              </div>
              {createCollError ? <p class="mt-2 text-xs text-error">{createCollError}</p> : null}
            </section>

            {assignError ? (
              <p class="mb-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">{assignError}</p>
            ) : null}

            <fieldset class="mb-6">
              <legend class="mb-3 text-xs font-medium uppercase tracking-wide text-base-content/45">
                Filtrer par créateur
              </legend>
              <div class="filter">
                <input
                  class="btn btn-sm rounded-full border-0 filter-reset"
                  type="radio"
                  name="flowlearn-collections-filter"
                  aria-label="Toutes les collections"
                  title="Toutes les collections"
                  checked={filter === "all"}
                  onChange={() => setFilter("all")}
                />
                <input
                  class="btn btn-sm rounded-full border-0"
                  type="radio"
                  name="flowlearn-collections-filter"
                  aria-label="Mes collections"
                  title="Mes collections"
                  checked={filter === "mine"}
                  onChange={() => setFilter("mine")}
                />
                {autresCreateurs.map(([uid, pseudot]) => (
                  <input
                    key={uid}
                    class="btn btn-sm rounded-full border-0"
                    type="radio"
                    name="flowlearn-collections-filter"
                    aria-label={pseudot}
                    title={pseudot}
                    checked={filter === (`user-${uid}` as CollectionFilter)}
                    onChange={() => setFilter(`user-${uid}` as CollectionFilter)}
                  />
                ))}
              </div>
              <p class="mt-2 text-xs text-base-content/50">
                Filtre les collections par auteur. Combine avec « Par supercollection » ci-dessous.
              </p>
            </fieldset>

            <fieldset class="mb-8">
              <legend class="mb-3 text-xs font-medium uppercase tracking-wide text-base-content/45">
                Par supercollection
              </legend>
              {modules.length === 0 ? (
                <p class="text-xs text-base-content/50">
                  Aucune supercollection : crée-en une plus haut pour filtrer les collections rattachées.
                </p>
              ) : (
                <>
                  <label class="sr-only" for="flowlearn-module-filter-select">
                    Filtrer par supercollection
                  </label>
                  <select
                    id="flowlearn-module-filter-select"
                    class="select select-bordered select-sm w-full max-w-md rounded-xl border-base-content/15 bg-base-100"
                    value={moduleFilter === "all" ? "" : String(moduleFilter)}
                    onChange={(e) => {
                      const v = (e.target as HTMLSelectElement).value;
                      setModuleFilter(v === "" ? "all" : Number(v));
                    }}
                  >
                    <option value="">Toutes les supercollections</option>
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                  <p class="mt-2 text-xs text-base-content/50">
                    Combine avec le filtre créateur : seules les collections liées à cette supercollection sont
                    affichées.
                  </p>
                </>
              )}
            </fieldset>

            {filtered.length === 0 ? (
              <p class="rounded-[var(--radius-box)] border border-base-content/10 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/65">
                Aucune collection pour ce filtre.
              </p>
            ) : (
              <ul class="flex flex-col gap-4">
                {filtered.map((c) => (
                  <li key={c.id}>
                    <CollectionCard
                      collection={c}
                      myUserId={userId}
                      allModules={modules}
                      assignBusyCollectionId={assignBusyCollectionId}
                      onAssign={handleAssign}
                      onUnassign={handleUnassign}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </PageMain>
      <AppFooter />
    </div>
  );
}
