import { FileJson, Layers, Trash2 } from "lucide-preact";
import type { CollectionUi, QuizzModuleRow } from "../../../types/quizz";
import { Button } from "../../atomes/Button/Button";
import { Card } from "../../atomes/Card/Card";
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
  jsonImportCategorie: "histoire" | "pratique";
  jsonImportBusy: boolean;
  jsonImportText: string;
  jsonImportError: string | null;
  jsonImportMessage: string | null;
  onChangeCategorie: (value: "histoire" | "pratique") => void;
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
                onChange={(e) => onChangeCategorie((e.target as HTMLSelectElement).value === "pratique" ? "pratique" : "histoire")}
              >
                <option value="histoire">Histoire</option>
                <option value="pratique">Pratique</option>
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
  userId,
  onAssign,
  onUnassign,
  onRequestDeleteCollection,
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
  userId: number;
  onAssign: (collectionId: number, moduleId: number) => void | Promise<void>;
  onUnassign: (collectionId: number, moduleId: number) => void | Promise<void>;
  onRequestDeleteCollection: (collection: CollectionUi) => void;
}) {
  return (
    <>
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

      {filtered.length === 0 ? (
        <p class="rounded-box border border-base-content/10 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/65">Aucune collection pour ce filtre.</p>
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
