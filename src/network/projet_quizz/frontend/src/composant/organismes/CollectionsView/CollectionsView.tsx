import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { route } from "preact-router";
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
} from "../../../lib/api";
import { normalizeAndValidateAppCollectionImportText } from "../../../lib/appCollectionImportNormalize";
import { normalizeAndValidateImportText } from "../../../lib/llmImportNormalize";
import { useUserSession } from "../../../lib/userSession";
import type { CollectionUi, QuizzModuleRow } from "../../../types/quizz";
import { AppHeader } from "../../molecules/AppHeader/AppHeader";
import { AppFooter } from "../../molecules/AppFooter/AppFooter";
import { PageMain } from "../../molecules/PageMain/PageMain";
import { Button } from "../../atomes/Button/Button";
import { PopUpInformation } from "../../molecules/PopUpInformation/PopUpInformation";
import { applyModuleFilter, filterCollections, pendingDeleteLabels, type CollectionFilter, type PendingDelete } from "./CollectionsView.metier";
import { CollectionsContent, CollectionsHeader, JsonImportPanel } from "./CollectionsView.sections";

export function CollectionsView() {
  const { userId } = useUserSession();
  const [collections, setCollections] = useState<CollectionUi[]>([]);
  const [modules, setModules] = useState<QuizzModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CollectionFilter>("all");
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
    if (moduleFilter !== "all" && !modules.some((m) => m.id === moduleFilter)) setModuleFilter("all");
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
      setCreateModuleError(e instanceof Error ? e.message : "Creation impossible.");
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
      const body: { userId: number; nom: string; moduleId?: number } = { userId, nom };
      if (newCollModuleId !== "") body.moduleId = Number(newCollModuleId);
      const ui = await createEmptyCollection(body);
      setCollections((prev) => [...prev, ui].sort((a, b) => a.id - b.id));
      setNewCollName("");
      setNewCollModuleId("");
      const modQ = body.moduleId != null ? `?module=${body.moduleId}` : "";
      route(`/questions/${ui.id}${modQ}`);
    } catch (e) {
      setCreateCollError(e instanceof Error ? e.message : "Creation impossible.");
    } finally {
      setCreateCollBusy(false);
    }
  };

  const confirmDeleteBusy = pendingDelete?.kind === "collection" ? deleteCollectionBusyId !== null : pendingDelete?.kind === "module" ? deleteModuleBusyId !== null : false;

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
        setDeleteCollectionError(e instanceof Error ? e.message : "Suppression de la collection impossible.");
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
      setCollections((prev) => prev.map((c) => ({ ...c, modules: (c.modules ?? []).filter((mod) => mod.id !== m.id) })));
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
    for (const c of collections) if (c.user_id !== userId) map.set(c.user_id, c.createur_pseudot);
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [collections, userId]);
  const filtered = useMemo(() => applyModuleFilter(filterCollections(collections, filter, userId), moduleFilter), [collections, filter, userId, moduleFilter]);

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
          const nouvelle = await createEmptyCollection({ userId, nom: data.collection.nom });
          collectionCreeeId = nouvelle.id;
          const res = await importAppCollectionQuestionsJson(data, { collectionId: nouvelle.id });
          const { list, mods } = await loadData();
          setCollections(list);
          setModules(mods);
          setJsonImportText("");
          setJsonImportMessage(`Import reussi (FlowLearn) : collection « ${data.collection.nom} » creee, ${res.createdQuestions} question(s).`);
        } catch (inner) {
          if (collectionCreeeId != null) {
            try {
              await deleteCollection(collectionCreeeId, userId);
            } catch {}
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
          ? `Import reussi (LLM) : ${res.createdQuestions} question(s), ${res.createdCollections} nouvelle(s) collection(s).`
          : `Import reussi (LLM) : ${res.createdQuestions} question(s).`,
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

        <CollectionsHeader
          jsonImportOpen={jsonImportOpen}
          jsonImportMode={jsonImportMode}
          onOpenJsonImport={() => {
            setJsonImportMode("app");
            setJsonImportOpen(true);
          }}
        />

        <JsonImportPanel
          jsonImportOpen={jsonImportOpen}
          jsonImportMode={jsonImportMode}
          jsonImportCategorie={jsonImportCategorie}
          jsonImportBusy={jsonImportBusy}
          jsonImportText={jsonImportText}
          jsonImportError={jsonImportError}
          jsonImportMessage={jsonImportMessage}
          onChangeCategorie={setJsonImportCategorie}
          onOpenFilePicker={() => jsonImportInputRef.current?.click()}
          onChangeText={setJsonImportText}
          onRun={() => void handleJsonImportRun()}
        />

        {loading ? (
          <p class="text-sm text-base-content/60">Chargement...</p>
        ) : error ? (
          <div class="rounded-box border border-base-content/10 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/65">
            <p class="mb-3">Impossible de charger les collections (API indisponible ?).</p>
            <Button variant="flow" class="btn-sm" onClick={() => void loadData().then(({ list, mods }) => { setCollections(list); setModules(mods); }).catch(() => setError("fetch"))}>
              Reessayer
            </Button>
          </div>
        ) : (
          <CollectionsContent
            modules={modules}
            pendingDelete={pendingDelete}
            deleteModuleBusyId={deleteModuleBusyId}
            assignBusyCollectionId={assignBusyCollectionId}
            deleteCollectionBusyId={deleteCollectionBusyId}
            deleteModuleError={deleteModuleError}
            newModuleName={newModuleName}
            createModuleBusy={createModuleBusy}
            createModuleError={createModuleError}
            onChangeNewModuleName={setNewModuleName}
            onCreateModule={() => void handleCreateModule()}
            onRequestDeleteModule={(module) => setPendingDelete({ kind: "module", data: module })}
            newCollName={newCollName}
            newCollModuleId={newCollModuleId}
            createCollBusy={createCollBusy}
            createCollError={createCollError}
            onChangeNewCollName={setNewCollName}
            onChangeNewCollModuleId={setNewCollModuleId}
            onCreateCollection={() => void handleCreateCollection()}
            assignError={assignError}
            deleteCollectionError={deleteCollectionError}
            filter={filter}
            onChangeFilter={setFilter}
            autresCreateurs={autresCreateurs}
            moduleFilter={moduleFilter}
            onChangeModuleFilter={setModuleFilter}
            filtered={filtered}
            userId={userId}
            onAssign={handleAssign}
            onUnassign={handleUnassign}
            onRequestDeleteCollection={(collection) => setPendingDelete({ kind: "collection", data: collection })}
          />
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
