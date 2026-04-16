import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { route } from "preact-router";
import { FileJson, Layers, Trash2 } from "lucide-preact";
import {
  assignCollectionToModule,
  createEmptyCollection,
  createQuizzModule,
  deleteCollection,
  deleteQuizzModule,
  fetchCollections,
  fetchModules,
  importAppCollectionQuestionsJson,
  importQuestionsJson,
  unassignCollectionFromModule,
} from "../../lib/api";
import { normalizeAndValidateAppCollectionImportText } from "../../lib/appCollectionImportNormalize";
import { normalizeAndValidateImportText } from "../../lib/llmImportNormalize";
import { useUserSession } from "../../lib/userSession";
import type { CollectionUi, QuizzModuleRow } from "../../types/quizz";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { Card } from "../atomes/Card";
import { CollectionCard } from "../molecules/CollectionCard";
import { PopUpInformation } from "../molecules/PopUpInformation";
import { PageMain } from "../molecules/PageMain";
import { Button } from "../atomes/Button";

export type CollectionFilter = "all" | "mine" | `user-${number}`;

type PendingDelete =
  | null
  | { kind: "collection"; data: CollectionUi }
  | { kind: "module"; data: QuizzModuleRow };

function pendingDeleteLabels(pending: PendingDelete): { title: string; message: string } | null {
  if (pending == null) return null;
  if (pending.kind === "collection") {
    const c = pending.data;
    const total = c.questions.length;
    return {
      title: `Supprimer la collection « ${c.nom} » ?`,
      message:
        `Cette action est définitive :\n` +
        `· la collection et ses liens vers les supercollections seront supprimés ;\n` +
        `· les ${total} question${total > 1 ? "s" : ""} qui ne sont liées qu’à cette collection seront supprimées (réponses et scores inclus) ;\n` +
        `· une question encore présente dans une autre collection sera seulement détachée de celle-ci.`,
    };
  }
  const m = pending.data;
  return {
    title: `Supprimer la supercollection « ${m.nom} » ?`,
    message:
      "Les liens avec les collections seront retirés. Les collections elles-mêmes ne sont pas supprimées.",
  };
}

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

/**
 * Page collections et supercollections : liste, filtres, création, import JSON et suppressions avec confirmation.
 */
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
  const [deleteCollectionBusyId, setDeleteCollectionBusyId] = useState<number | null>(null);
  const [deleteCollectionError, setDeleteCollectionError] = useState<string | null>(null);
  const [newCollName, setNewCollName] = useState("");
  const [newCollModuleId, setNewCollModuleId] = useState<number | "">("");
  const [createCollBusy, setCreateCollBusy] = useState(false);
  const [createCollError, setCreateCollError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);

  const jsonImportInputRef = useRef<HTMLInputElement | null>(null);
  const [jsonImportOpen, setJsonImportOpen] = useState(false);
  const [jsonImportMode, setJsonImportMode] = useState<"app" | "llm">("app");
  const [jsonImportText, setJsonImportText] = useState("");
  const [jsonImportBusy, setJsonImportBusy] = useState(false);
  const [jsonImportMessage, setJsonImportMessage] = useState<string | null>(null);
  const [jsonImportError, setJsonImportError] = useState<string | null>(null);
  const [jsonImportCategorie, setJsonImportCategorie] = useState<"histoire" | "pratique">("histoire");

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

  const confirmDeleteBusy =
    pendingDelete?.kind === "collection"
      ? deleteCollectionBusyId !== null
      : pendingDelete?.kind === "module"
        ? deleteModuleBusyId !== null
        : false;

  const runConfirmedDelete = async () => {
    if (pendingDelete == null) return;
    if (pendingDelete.kind === "collection") {
      const c = pendingDelete.data;
      setDeleteCollectionBusyId(c.id);
      setDeleteCollectionError(null);
      try {
        await deleteCollection(c.id, userId);
        setCollections((prev) => prev.filter((x) => x.id !== c.id));
        setPendingDelete(null);
      } catch (e) {
        setDeleteCollectionError(
          e instanceof Error ? e.message : "Suppression de la collection impossible.",
        );
        setPendingDelete(null);
      } finally {
        setDeleteCollectionBusyId(null);
      }
      return;
    }
    const m = pendingDelete.data;
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
      setPendingDelete(null);
    } catch (e) {
      setDeleteModuleError(e instanceof Error ? e.message : "Suppression impossible.");
      setPendingDelete(null);
    } finally {
      setDeleteModuleBusyId(null);
    }
  };

  const confirmLabels = pendingDeleteLabels(pendingDelete);

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

  const handleJsonImportRun = async () => {
    setJsonImportBusy(true);
    setJsonImportError(null);
    setJsonImportMessage(null);
    try {
      if (jsonImportMode === "app") {
        const data = normalizeAndValidateAppCollectionImportText(jsonImportText);
        data.user_id = userId;
        let collectionCreeeId: number | undefined;
        try {
          const nouvelle = await createEmptyCollection({
            userId,
            nom: data.collection.nom,
          });
          collectionCreeeId = nouvelle.id;
          const res = await importAppCollectionQuestionsJson(data, {
            collectionId: nouvelle.id,
          });
          const { list, mods } = await loadData();
          setCollections(list);
          setModules(mods);
          setJsonImportText("");
          setJsonImportMessage(
            `Import réussi (FlowLearn) : collection « ${data.collection.nom} » créée, ${res.createdQuestions} question(s).`,
          );
        } catch (inner) {
          if (collectionCreeeId != null) {
            try {
              await deleteCollection(collectionCreeeId, userId);
            } catch {
              /* éviter de masquer l’erreur d’import */
            }
          }
          throw inner;
        }
        return;
      }

      const data = normalizeAndValidateImportText(jsonImportText);
      data.user_id = userId;
      const res = await importQuestionsJson(data, { categorie: jsonImportCategorie });
      const { list, mods } = await loadData();
      setCollections(list);
      setModules(mods);
      setJsonImportText("");
      setJsonImportMessage(
        res.createdCollections > 0
          ? `Import réussi (LLM) : ${res.createdQuestions} question(s), ${res.createdCollections} nouvelle(s) collection(s).`
          : `Import réussi (LLM) : ${res.createdQuestions} question(s).`,
      );
    } catch (e) {
      setJsonImportError(e instanceof Error ? e.message : "Import JSON impossible.");
    } finally {
      setJsonImportBusy(false);
    }
  };

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <PageMain>
        <input
          ref={jsonImportInputRef}
          type="file"
          accept=".json,application/json"
          class="hidden"
          onChange={async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            try {
              setJsonImportError(null);
              setJsonImportMessage(null);
              const text = await file.text();
              setJsonImportText(text);
              setJsonImportOpen(true);
            } catch {
              setJsonImportError("Lecture du fichier impossible.");
            } finally {
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />

        <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div class="space-y-2">
            <p class="inline-flex items-center gap-2 rounded-full bg-learn/10 px-3 py-1 text-xs font-medium text-learn">
              <Layers class="h-3.5 w-3.5" aria-hidden />
              Tes collections
            </p>
            <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Choisir une collection</h1>
            <p class="max-w-xl text-sm text-base-content/60">
              Lance un quiz ciblé : uniquement les questions liées à la collection sélectionnée.
            </p>
          </div>
          <div class="flex flex-col gap-2 self-start sm:flex-row sm:items-center sm:self-auto">
            <Button
              variant={jsonImportOpen && jsonImportMode === "app" ? "learn" : "outline"}
              class="gap-2"
              onClick={() => {
                setJsonImportMode("app");
                setJsonImportOpen(true);
              }}
            >
              <FileJson class="h-4 w-4" aria-hidden />
              JSON FlowLearn
            </Button>
          </div>
        </div>

        {jsonImportOpen ? (
          <Card class="fl-reveal-enter mb-6 border-learn/15 bg-learn/6">
            <div class="flex flex-col gap-3">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p class="text-sm font-medium text-base-content">
                    Importer des questions — {jsonImportMode === "app" ? "FlowLearn" : "LLM"}
                  </p>
                  <p class="mt-1 text-xs text-base-content/55">
                    {jsonImportMode === "app" ? (
                      <>
                        Une collection vide est créée avec le <code class="text-xs">collection.nom</code> du JSON,
                        puis les questions y sont importées. Chaque question inclut{" "}
                        <code class="text-xs">categorie_id</code>, <code class="text-xs">categorie_type</code> et
                        optionnellement <code class="text-xs">fakechecker</code> (sinon faux).
                      </>
                    ) : (
                      <>
                        Format LLM : catégorie choisie ci-dessous (mapping <code class="text-xs">ref_categorie</code>),
                        import via <code class="text-xs">/quizz/questions/import</code>. Les questions importées ont{" "}
                        <code class="text-xs">verifier</code> à faux en base (pas de champ dans le JSON).
                      </>
                    )}
                  </p>
                </div>
                {jsonImportMode === "llm" ? (
                  <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label class="text-xs font-medium text-base-content/60" for="collections-json-categorie">
                      Catégorie enregistrée
                    </label>
                    <select
                      id="collections-json-categorie"
                      class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100 sm:w-44"
                      value={jsonImportCategorie}
                      disabled={jsonImportBusy}
                      onChange={(e) => {
                        const v = (e.target as HTMLSelectElement).value;
                        setJsonImportCategorie(v === "pratique" ? "pratique" : "histoire");
                      }}
                    >
                      <option value="histoire">Histoire</option>
                      <option value="pratique">Pratique</option>
                    </select>
                  </div>
                ) : null}
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="btn btn-outline btn-sm rounded-full border-base-content/15"
                  disabled={jsonImportBusy}
                  onClick={() => jsonImportInputRef.current?.click()}
                >
                  Choisir un fichier…
                </button>
              </div>

              <textarea
                class="textarea textarea-bordered w-full min-h-32 rounded-2xl border-dashed border-learn/35 bg-base-100/60 font-mono text-xs leading-relaxed"
                placeholder={
                  jsonImportMode === "app"
                    ? '{ "format": "flowlearn-app-collection-export", "version": 1, "collection": { "nom": "…" }, "questions": [ { "fakechecker": false, "categorie_id": 1, ... } ] }'
                    : '{ "collections": [ ... ], "questions_sans_collection": [] }'
                }
                value={jsonImportText}
                disabled={jsonImportBusy}
                onInput={(e) => setJsonImportText((e.target as HTMLTextAreaElement).value)}
              />

              {jsonImportError ? <p class="text-xs text-error">{jsonImportError}</p> : null}
              {jsonImportMessage ? <p class="text-sm text-base-content/80">{jsonImportMessage}</p> : null}

              <Button
                variant="flow"
                disabled={jsonImportBusy || !jsonImportText.trim()}
                onClick={() => void handleJsonImportRun()}
              >
                {jsonImportBusy ? "Import…" : "Importer en base"}
              </Button>
            </div>
          </Card>
        ) : null}

        {loading ? (
          <p class="text-sm text-base-content/60">Chargement…</p>
        ) : error ? (
          <div class="rounded-box border border-base-content/10 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/65">
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
            <section class="mb-8 rounded-box border border-base-content/10 bg-base-200/30 p-4 sm:p-5">
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
                        disabled={
                          deleteModuleBusyId !== null ||
                          assignBusyCollectionId !== null ||
                          deleteCollectionBusyId !== null ||
                          pendingDelete !== null
                        }
                        onClick={() => setPendingDelete({ kind: "module", data: m })}
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

            <section class="mb-8 rounded-box border border-base-content/10 bg-base-200/30 p-4 sm:p-5">
              <h2 class="text-sm font-semibold tracking-tight text-base-content">Nouvelle collection</h2>
              <p class="mt-1 max-w-2xl text-xs text-base-content/55">
                Crée une collection vide, éventuellement déjà rattachée à une supercollection, puis ouvre la page
                Questions pour y importer via le LLM.
              </p>
              <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div class="min-w-0 flex-1 sm:min-w-48">
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
                <div class="w-full sm:w-auto sm:min-w-40">
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
            {deleteCollectionError ? (
              <p class="mb-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                {deleteCollectionError}
              </p>
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
              <p class="rounded-box border border-base-content/10 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/65">
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
                      deleteBusyCollectionId={deleteCollectionBusyId}
                      onAssign={handleAssign}
                      onUnassign={handleUnassign}
                      interactionLocked={pendingDelete !== null}
                      onDeleteCollection={(col) => setPendingDelete({ kind: "collection", data: col })}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </PageMain>
      <AppFooter />
      <PopUpInformation
        open={pendingDelete != null}
        title={confirmLabels?.title ?? ""}
        message={confirmLabels?.message ?? ""}
        variant="danger"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        busy={confirmDeleteBusy}
        onCancel={() => {
          if (!confirmDeleteBusy) setPendingDelete(null);
        }}
        onConfirm={() => void runConfirmedDelete()}
      />
    </div>
  );
}
