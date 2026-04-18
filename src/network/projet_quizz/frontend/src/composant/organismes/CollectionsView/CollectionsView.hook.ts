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
import { applyModuleFilter, filterCollections, pendingDeleteLabels } from "./CollectionsView.metier";
import type { CollectionFilter, PendingDelete } from "./CollectionsView.types";

export function useCollectionsView() {
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
      setCollections((prev) =>
        prev.map((c) => ({ ...c, modules: (c.modules ?? []).filter((mod) => mod.id !== m.id) })),
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
    for (const c of collections) if (c.user_id !== userId) map.set(c.user_id, c.createur_pseudot);
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [collections, userId]);

  const filtered = useMemo(
    () => applyModuleFilter(filterCollections(collections, filter, userId), moduleFilter),
    [collections, filter, userId, moduleFilter],
  );

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
          setJsonImportMessage(
            `Import reussi (FlowLearn) : collection « ${data.collection.nom} » creee, ${res.createdQuestions} question(s).`,
          );
        } catch (inner) {
          if (collectionCreeeId != null) {
            try {
              await deleteCollection(collectionCreeeId, userId);
            } catch {
              /* rollback best-effort */
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
          ? `Import reussi (LLM) : ${res.createdQuestions} question(s), ${res.createdCollections} nouvelle(s) collection(s).`
          : `Import reussi (LLM) : ${res.createdQuestions} question(s).`,
      );
    } catch (e) {
      setJsonImportError(e instanceof Error ? e.message : "Import JSON impossible.");
    } finally {
      setJsonImportBusy(false);
    }
  };

  const onJsonImportFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
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
      input.value = "";
    }
  };

  const onRetryLoad = () => {
    loadData()
      .then(({ list, mods }) => {
        setCollections(list);
        setModules(mods);
      })
      .catch(() => setError("fetch"));
  };

  const page = {
    loading,
    error,
    userId,
  };

  const header = {
    jsonImportOpen,
    jsonImportMode,
    onOpenJsonImport: () => {
      setJsonImportMode("app");
      setJsonImportOpen(true);
    },
  };

  const jsonImport = {
    inputRef: jsonImportInputRef,
    open: jsonImportOpen,
    mode: jsonImportMode,
    categorie: jsonImportCategorie,
    busy: jsonImportBusy,
    text: jsonImportText,
    error: jsonImportError,
    message: jsonImportMessage,
    onChangeCategorie: setJsonImportCategorie,
    onOpenFilePicker: () => jsonImportInputRef.current?.click(),
    onChangeText: setJsonImportText,
    onRun: () => void handleJsonImportRun(),
    onFileChange: (e: Event) => void onJsonImportFileChange(e),
  };

  const content = {
    modules,
    pendingDelete,
    deleteModuleBusyId,
    assignBusyCollectionId,
    deleteCollectionBusyId,
    deleteModuleError,
    newModuleName,
    createModuleBusy,
    createModuleError,
    onChangeNewModuleName: setNewModuleName,
    onCreateModule: () => void handleCreateModule(),
    onRequestDeleteModule: (module: QuizzModuleRow) => setPendingDelete({ kind: "module", data: module }),
    newCollName,
    newCollModuleId,
    createCollBusy,
    createCollError,
    onChangeNewCollName: setNewCollName,
    onChangeNewCollModuleId: setNewCollModuleId,
    onCreateCollection: () => void handleCreateCollection(),
    assignError,
    deleteCollectionError,
    filter,
    onChangeFilter: setFilter,
    autresCreateurs,
    moduleFilter,
    onChangeModuleFilter: setModuleFilter,
    filtered,
    userId,
    onAssign: handleAssign,
    onUnassign: handleUnassign,
    onRequestDeleteCollection: (collection: CollectionUi) =>
      setPendingDelete({ kind: "collection", data: collection }),
  };

  const confirmPopup = {
    open: pendingDelete != null,
    title: confirmLabels?.title ?? "",
    message: confirmLabels?.message ?? "",
    busy: confirmDeleteBusy,
    onCancel: () => {
      if (!confirmDeleteBusy) setPendingDelete(null);
    },
    onConfirm: () => void runConfirmedDelete(),
  };

  const retry = {
    onRetryLoad,
  };

  return {
    page,
    header,
    jsonImport,
    content,
    confirmPopup,
    retry,
  };
}
