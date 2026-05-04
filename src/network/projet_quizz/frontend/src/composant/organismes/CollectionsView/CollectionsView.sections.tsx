import { FileJson, Layers, Search, Trash2 } from "lucide-preact";
import type { PlayQtype } from "../../../lib/playOrder";
import type { CollectionUi, QuizzModuleRow } from "../../../types/quizz";
import { Button } from "../../atomes/Button/Button";
import { Card } from "../../atomes/Card/Card";
import { PlayModePicker } from "../../atomes/PlayModePicker/PlayModePicker";
import type { PlayModeSettings } from "../../atomes/PlayModePicker/PlayModePicker.types";
import { CollectionCard } from "../../molecules/CollectionCard/CollectionCard";
import type { CollectionFilter, PendingDelete } from "./CollectionsView.types";

export function CollectionsHeader({
  jsonImportOpen,
  jsonImportMode,
  onOpenJsonImport,
}: {
  jsonImportOpen: boolean;
  jsonImportMode: "app" | "llm";
  onOpenJsonImport: () => void;
}) {
  return (
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-2">
        <p class="inline-flex items-center gap-2 rounded-full bg-learn/10 px-3 py-1 text-xs font-medium text-learn">
          <Layers class="h-3.5 w-3.5" aria-hidden />
          Tes collections
        </p>
        <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Choisir une collection</h1>
        <p class="max-w-xl text-sm text-base-content/60">Lance un quiz cible : uniquement les questions liees a la collection selectionnee.</p>
      </div>
      <div class="flex flex-col gap-2 self-start sm:flex-row sm:items-center sm:self-auto">
        <Button variant={jsonImportOpen && jsonImportMode === "app" ? "learn" : "outline"} class="gap-2" onClick={onOpenJsonImport}>
          <FileJson class="h-4 w-4" aria-hidden />
          JSON FlowLearn
        </Button>
      </div>
    </div>
  );
}

export function JsonImportPanel({
  jsonImportOpen,
  jsonImportMode,
  jsonImportCategorie,
  jsonImportBusy,
  jsonImportText,
  jsonImportError,
  jsonImportMessage,
  onChangeCategorie,
  onOpenFilePicker,
  onChangeText,
  onRun,
}: {
  jsonImportOpen: boolean;
  jsonImportMode: "app" | "llm";
  jsonImportCategorie: "histoire" | "pratique" | "connaissance";
  jsonImportBusy: boolean;
  jsonImportText: string;
  jsonImportError: string | null;
  jsonImportMessage: string | null;
  onChangeCategorie: (value: "histoire" | "pratique" | "connaissance") => void;
  onOpenFilePicker: () => void;
  onChangeText: (value: string) => void;
  onRun: () => void;
}) {
  if (!jsonImportOpen) return null;
  return (
    <Card class="fl-reveal-enter mb-6 border-learn/15 bg-learn/6">
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-medium text-base-content">Importer des questions — {jsonImportMode === "app" ? "FlowLearn" : "LLM"}</p>
          </div>
          {jsonImportMode === "llm" ? (
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label class="text-xs font-medium text-base-content/60" for="collections-json-categorie">Categorie enregistree</label>
              <select
                id="collections-json-categorie"
                class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100 sm:w-44"
                value={jsonImportCategorie}
                disabled={jsonImportBusy}
                onChange={(e) => {
                  const v = (e.target as HTMLSelectElement).value;
                  if (v === "pratique" || v === "connaissance") onChangeCategorie(v);
                  else onChangeCategorie("histoire");
                }}
              >
                <option value="histoire">Histoire</option>
                <option value="pratique">Pratique</option>
                <option value="connaissance">Connaissance</option>
              </select>
            </div>
          ) : null}
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn btn-outline btn-sm rounded-full border-base-content/15" disabled={jsonImportBusy} onClick={onOpenFilePicker}>
            Choisir un fichier...
          </button>
        </div>
        <textarea
          class="textarea textarea-bordered w-full min-h-32 rounded-2xl border-dashed border-learn/35 bg-base-100/60 font-mono text-xs leading-relaxed"
          placeholder={jsonImportMode === "app" ? '{ "format": "flowlearn-app-collection-export", ... }' : '{ "collections": [ ... ], "questions_sans_collection": [] }'}
          value={jsonImportText}
          disabled={jsonImportBusy}
          onInput={(e) => onChangeText((e.target as HTMLTextAreaElement).value)}
        />
        {jsonImportError ? <p class="text-xs text-error">{jsonImportError}</p> : null}
        {jsonImportMessage ? <p class="text-sm text-base-content/80">{jsonImportMessage}</p> : null}
        <Button variant="flow" disabled={jsonImportBusy || !jsonImportText.trim()} onClick={onRun}>
          {jsonImportBusy ? "Import..." : "Importer en base"}
        </Button>
      </div>
    </Card>
  );
}

export function CollectionsContent({
  modules,
  pendingDelete,
  deleteModuleBusyId,
  assignBusyCollectionId,
  deleteCollectionBusyId,
  deleteModuleError,
  newModuleName,
  createModuleBusy,
  createModuleError,
  onChangeNewModuleName,
  onCreateModule,
  onRequestDeleteModule,
  newCollName,
  newCollModuleId,
  createCollBusy,
  createCollError,
  onChangeNewCollName,
  onChangeNewCollModuleId,
  onCreateCollection,
  assignError,
  deleteCollectionError,
  filter,
  onChangeFilter,
  autresCreateurs,
  moduleFilter,
  onChangeModuleFilter,
  filtered,
  filteredSourceCount,
  collectionListSearch,
  onCollectionListSearch,
  collectionListSuggestions,
  showCollectionListSuggestPanel,
  onCollectionListSuggestFocus,
  onCollectionListSuggestBlur,
  onPickCollectionListSuggestion,
  userId,
  playMode,
  onPlayModeChange,
  playQtype,
  onPlayQtypeChange,
  playInfinite,
  onPlayInfiniteChange,
  onAssign,
  onUnassign,
  onRequestDeleteCollection,
  hierarchySubtreeRootId,
  hierarchySubtreeRootNom,
  hierarchySubtreeSearch,
  onHierarchySubtreeSearch,
  hierarchySearchSuggestions,
  showHierarchySuggestPanel,
  onHierarchySuggestFocus,
  onHierarchySuggestBlur,
  onPickHierarchySuggestion,
  clearHierarchySubtree,
  setHierarchyRootFromCard,
  getTreeDepth,
}: {
  modules: QuizzModuleRow[];
  pendingDelete: PendingDelete;
  deleteModuleBusyId: number | null;
  assignBusyCollectionId: number | null;
  deleteCollectionBusyId: number | null;
  deleteModuleError: string | null;
  newModuleName: string;
  createModuleBusy: boolean;
  createModuleError: string | null;
  onChangeNewModuleName: (value: string) => void;
  onCreateModule: () => void;
  onRequestDeleteModule: (module: QuizzModuleRow) => void;
  newCollName: string;
  newCollModuleId: number | "";
  createCollBusy: boolean;
  createCollError: string | null;
  onChangeNewCollName: (value: string) => void;
  onChangeNewCollModuleId: (value: number | "") => void;
  onCreateCollection: () => void;
  assignError: string | null;
  deleteCollectionError: string | null;
  filter: CollectionFilter;
  onChangeFilter: (filter: CollectionFilter) => void;
  autresCreateurs: [number, string][];
  moduleFilter: number | "all";
  onChangeModuleFilter: (value: number | "all") => void;
  filtered: CollectionUi[];
  filteredSourceCount: number;
  collectionListSearch: string;
  onCollectionListSearch: (value: string) => void;
  collectionListSuggestions: { id: number; nom: string }[];
  showCollectionListSuggestPanel: boolean;
  onCollectionListSuggestFocus: () => void;
  onCollectionListSuggestBlur: () => void;
  onPickCollectionListSuggestion: (nom: string) => void;
  userId: number;
  playMode: PlayModeSettings;
  onPlayModeChange: (patch: Partial<PlayModeSettings>) => void;
  playQtype: PlayQtype;
  onPlayQtypeChange: (value: PlayQtype) => void;
  playInfinite: boolean;
  onPlayInfiniteChange: (value: boolean) => void;
  onAssign: (collectionId: number, moduleId: number) => void | Promise<void>;
  onUnassign: (collectionId: number, moduleId: number) => void | Promise<void>;
  onRequestDeleteCollection: (collection: CollectionUi) => void;
  hierarchySubtreeRootId: number | null;
  hierarchySubtreeRootNom: string;
  hierarchySubtreeSearch: string;
  onHierarchySubtreeSearch: (value: string) => void;
  hierarchySearchSuggestions: { id: number; nom: string }[];
  showHierarchySuggestPanel: boolean;
  onHierarchySuggestFocus: () => void;
  onHierarchySuggestBlur: () => void;
  onPickHierarchySuggestion: (nom: string) => void;
  clearHierarchySubtree: () => void;
  setHierarchyRootFromCard: (collectionId: number, enabled: boolean) => void;
  getTreeDepth: (collection: CollectionUi) => number;
}) {
  return (
    <>
      <section class="mb-8 rounded-box border border-base-content/10 bg-base-200/30 p-4 sm:p-5">
        <h2 class="text-sm font-semibold tracking-tight text-base-content">Mode de jeu (toutes les collections)</h2>
        <p class="mt-1 max-w-2xl text-xs text-base-content/55">
          Un seul réglage pour la page : le bouton « Jouer » de chaque carte utilise ces options.
        </p>
        <div class="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          <div class="w-full min-w-0 flex-1 rounded-xl border border-base-content/10 bg-base-100/50 p-3 lg:max-w-xl">
            <PlayModePicker
              idPrefix="collections-play"
              settings={playMode}
              onChange={onPlayModeChange}
            />
          </div>
          <div class="flex w-full shrink-0 flex-col gap-3 sm:max-w-xs">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-base-content/55" for="collections-play-qtype">
                Type de questions
              </label>
              <select
                id="collections-play-qtype"
                class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100"
                value={playQtype}
                onChange={(e) => {
                  const v = (e.target as HTMLSelectElement).value;
                  if (v === "histoire" || v === "pratique" || v === "connaissance" || v === "melanger") onPlayQtypeChange(v);
                }}
              >
                <option value="melanger">Mélanger</option>
                <option value="histoire">Histoire</option>
                <option value="pratique">Pratique</option>
                <option value="connaissance">Connaissance</option>
              </select>
            </div>
            <label class="flex cursor-pointer items-center gap-2 text-xs text-base-content/70">
              <input
                type="checkbox"
                class="checkbox checkbox-xs checkbox-primary"
                checked={playInfinite}
                onChange={(e) => onPlayInfiniteChange((e.target as HTMLInputElement).checked)}
              />
              Session infinie (15)
            </label>
          </div>
        </div>
      </section>

      <section class="mb-8 rounded-box border border-base-content/10 bg-base-200/30 p-4 sm:p-5">
        <h2 class="text-sm font-semibold tracking-tight text-base-content">Supercollections</h2>
        {modules.length > 0 ? (
          <ul class="mt-3 flex flex-col gap-2">
            {modules.map((m) => (
              <li key={m.id} class="flex items-center justify-between gap-3 rounded-xl border border-learn/25 bg-learn/10 px-3 py-2">
                <span class="min-w-0 flex-1 text-xs font-medium text-learn">{m.nom}</span>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs shrink-0 gap-1 text-error hover:bg-error/10"
                  aria-label={`Supprimer la supercollection ${m.nom}`}
                  disabled={deleteModuleBusyId !== null || assignBusyCollectionId !== null || deleteCollectionBusyId !== null || pendingDelete !== null}
                  onClick={() => onRequestDeleteModule(m)}
                >
                  {deleteModuleBusyId === m.id ? <span class="loading loading-spinner loading-xs" aria-hidden /> : <Trash2 class="h-4 w-4" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p class="mt-3 text-xs text-base-content/50">Aucune supercollection pour l instant.</p>
        )}
        {deleteModuleError ? <p class="mt-2 text-xs text-error">{deleteModuleError}</p> : null}
        <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div class="flex-1">
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="new-supercollection-name">Nouvelle supercollection</label>
            <input id="new-supercollection-name" class="input input-bordered input-sm w-full rounded-xl border-base-content/15 bg-base-100" type="text" value={newModuleName} disabled={createModuleBusy} onInput={(e) => onChangeNewModuleName((e.target as HTMLInputElement).value)} />
          </div>
          <Button variant="learn" class="btn-sm shrink-0" disabled={createModuleBusy || !newModuleName.trim()} onClick={onCreateModule}>
            {createModuleBusy ? "Creation..." : "Creer"}
          </Button>
        </div>
        {createModuleError ? <p class="mt-2 text-xs text-error">{createModuleError}</p> : null}
      </section>

      <section class="mb-8 rounded-box border border-base-content/10 bg-base-200/30 p-4 sm:p-5">
        <h2 class="text-sm font-semibold tracking-tight text-base-content">Nouvelle collection</h2>
        <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div class="min-w-0 flex-1 sm:min-w-48">
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="new-collection-name">Nom</label>
            <input id="new-collection-name" class="input input-bordered input-sm w-full rounded-xl border-base-content/15 bg-base-100" type="text" value={newCollName} disabled={createCollBusy} onInput={(e) => onChangeNewCollName((e.target as HTMLInputElement).value)} />
          </div>
          <div class="w-full sm:w-auto sm:min-w-40">
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="new-collection-module">Supercollection (optionnel)</label>
            <select id="new-collection-module" class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100" value={newCollModuleId === "" ? "" : String(newCollModuleId)} disabled={createCollBusy || modules.length === 0} onChange={(e) => onChangeNewCollModuleId((e.target as HTMLSelectElement).value === "" ? "" : Number((e.target as HTMLSelectElement).value))}>
              <option value="">—</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </select>
          </div>
          <Button variant="flow" class="btn-sm shrink-0" disabled={createCollBusy || !newCollName.trim()} onClick={onCreateCollection}>
            {createCollBusy ? "Creation..." : "Creer collection"}
          </Button>
        </div>
        {createCollError ? <p class="mt-2 text-xs text-error">{createCollError}</p> : null}
      </section>

      {assignError ? <p class="mb-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">{assignError}</p> : null}
      {deleteCollectionError ? <p class="mb-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">{deleteCollectionError}</p> : null}

      <fieldset class="mb-6">
        <legend class="mb-3 text-xs font-medium uppercase tracking-wide text-base-content/45">Filtrer par createur</legend>
        <div class="filter">
          <input class="btn btn-sm rounded-full border-0 filter-reset" type="radio" name="flowlearn-collections-filter" aria-label="Toutes les collections" checked={filter === "all"} onChange={() => onChangeFilter("all")} />
          <input class="btn btn-sm rounded-full border-0" type="radio" name="flowlearn-collections-filter" aria-label="Mes collections" checked={filter === "mine"} onChange={() => onChangeFilter("mine")} />
          {autresCreateurs.map(([uid, pseudot]) => (
            <input key={uid} class="btn btn-sm rounded-full border-0" type="radio" name="flowlearn-collections-filter" aria-label={pseudot} checked={filter === (`user-${uid}` as CollectionFilter)} onChange={() => onChangeFilter(`user-${uid}` as CollectionFilter)} />
          ))}
        </div>
      </fieldset>

      <fieldset class="mb-8">
        <legend class="mb-3 text-xs font-medium uppercase tracking-wide text-base-content/45">Par supercollection</legend>
        {modules.length === 0 ? (
          <p class="text-xs text-base-content/50">Aucune supercollection : cree-en une plus haut pour filtrer.</p>
        ) : (
          <select class="select select-bordered select-sm w-full max-w-md rounded-xl border-base-content/15 bg-base-100" value={moduleFilter === "all" ? "" : String(moduleFilter)} onChange={(e) => onChangeModuleFilter((e.target as HTMLSelectElement).value === "" ? "all" : Number((e.target as HTMLSelectElement).value))}>
            <option value="">Toutes les supercollections</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.nom}</option>
            ))}
          </select>
        )}
      </fieldset>

      <section class="relative mb-8 rounded-box border border-base-content/10 bg-base-200/30 p-4 sm:p-5">
        <h2 class="mb-1 text-sm font-semibold tracking-tight text-base-content">Rechercher une collection</h2>
        <p class="mb-3 max-w-xl text-xs text-base-content/55">
          Filtre la liste par titre (insensible à la casse). Suggestions au focus.
        </p>
        <div class="relative max-w-xl">
          <label class="sr-only" for="collections-global-search">Recherche par titre</label>
          <span class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base-content/40">
            <Search class="h-4 w-4" aria-hidden />
          </span>
          <input
            id="collections-global-search"
            type="search"
            autoComplete="off"
            class="input input-bordered input-sm w-full rounded-xl border-base-content/15 bg-base-100 pl-9"
            placeholder="Titre de la collection…"
            value={collectionListSearch}
            onFocus={onCollectionListSuggestFocus}
            onBlur={onCollectionListSuggestBlur}
            onInput={(e) => onCollectionListSearch((e.target as HTMLInputElement).value)}
          />
          {showCollectionListSuggestPanel ? (
            <ul
              class="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-xl border border-base-content/15 bg-base-100 py-1 shadow-lg"
              role="listbox"
            >
              {collectionListSuggestions.map((s) => (
                <li key={s.id} role="option">
                  <button
                    type="button"
                    class="flex w-full px-3 py-2 text-left text-sm hover:bg-base-200"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onPickCollectionListSuggestion(s.nom)}
                  >
                    {s.nom}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {hierarchySubtreeRootId != null ? (
        <section class="relative mb-6 rounded-box border border-flow/25 bg-flow/8 p-4 sm:p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0 flex-1 space-y-2">
              <p class="text-xs font-medium uppercase tracking-wide text-base-content/50">Vue sous-arbre</p>
              <p class="text-sm text-base-content/85">
                Collections affichées : « <span class="font-semibold text-base-content">{hierarchySubtreeRootNom}</span> » et toutes ses sous-collections (descendants).
              </p>
              <div class="relative max-w-xl">
                <label class="mb-1 block text-xs font-medium text-base-content/60" for="collections-hierarchy-search">
                  Recherche (titre)
                </label>
                <input
                  id="collections-hierarchy-search"
                  type="search"
                  autoComplete="off"
                  class="input input-bordered input-sm w-full rounded-xl border-base-content/15 bg-base-100"
                  placeholder="Filtrer par nom de collection…"
                  value={hierarchySubtreeSearch}
                  onFocus={onHierarchySuggestFocus}
                  onBlur={onHierarchySuggestBlur}
                  onInput={(e) => onHierarchySubtreeSearch((e.target as HTMLInputElement).value)}
                />
                {showHierarchySuggestPanel ? (
                  <ul
                    class="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-xl border border-base-content/15 bg-base-100 py-1 shadow-lg"
                    role="listbox"
                  >
                    {hierarchySearchSuggestions.map((s) => (
                      <li key={s.id} role="option">
                        <button
                          type="button"
                          class="flex w-full px-3 py-2 text-left text-sm hover:bg-base-200"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => onPickHierarchySuggestion(s.nom)}
                        >
                          {s.nom}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
            <Button variant="outline" class="btn-sm shrink-0" onClick={clearHierarchySubtree}>
              Tout afficher
            </Button>
          </div>
        </section>
      ) : null}

      {filteredSourceCount === 0 ? (
        <p class="rounded-box border border-base-content/10 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/65">Aucune collection pour ce filtre.</p>
      ) : filtered.length === 0 ? (
        <p class="rounded-box border border-base-content/10 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/65">
          Aucune collection ne correspond à cette recherche. Efface le champ ou modifie le titre recherché.
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
                playMode={playMode}
                playQtype={playQtype}
                playInfinite={playInfinite}
                treeDepth={getTreeDepth(c)}
                hierarchyViewToggle={
                  (c.sous_collections?.length ?? 0) > 0
                    ? {
                        checked: hierarchySubtreeRootId === c.id,
                        onChange: (v) => setHierarchyRootFromCard(c.id, v),
                      }
                    : undefined
                }
                onAssign={onAssign}
                onUnassign={onUnassign}
                interactionLocked={pendingDelete !== null}
                onDeleteCollection={onRequestDeleteCollection}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
