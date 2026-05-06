import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { route } from "preact-router";
import {
  collectDescendantCollectionIds,
  computeTreeDepth,
  orderCollectionsHierarchy,
} from "../../../lib/collectionHierarchyVis";
import {
  assignCollectionTag,
  assignPersonaliteToCollection,
  createEmptyCollection,
  createPersonaliteCollection,
  deleteCollection,
  fetchCollections,
  fetchPersonalitesPicker,
  importAppCollectionQuestionsJson,
  importQuestionsJson,
  unassignCollectionTag,
  unassignPersonaliteFromCollection,
} from "../../../lib/api";
import { normalizeAndValidateAppCollectionImportText } from "../../../lib/appCollectionImportNormalize";
import { normalizeAndValidateImportText } from "../../../lib/llmImportNormalize";
import type { PlayQtype } from "../../../lib/playOrder";
import { useUserSession } from "../../../lib/userSession";
import type { CollectionUi, PersonalitePickerRowUi } from "../../../types/quizz";
import type { PlayModeSettings } from "../../atomes/PlayModePicker/PlayModePicker.types";
import { applyTagFilter, filterCollections, pendingDeleteLabels } from "./CollectionsView.metier";
import type { CollectionFilter, PendingDelete } from "./CollectionsView.types";

export function useCollectionsView() {
  const { userId } = useUserSession();

  const [collections, setCollections] = useState<CollectionUi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const [tagFilter, setTagFilter] = useState<number | "all">("all");
  const [assignBusyCollectionId, setAssignBusyCollectionId] = useState<number | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [deleteCollectionBusyId, setDeleteCollectionBusyId] = useState<number | null>(null);
  const [deleteCollectionError, setDeleteCollectionError] = useState<string | null>(null);
  const [newCollName, setNewCollName] = useState("");
  const [newCollTagId, setNewCollTagId] = useState<number | "">("");
  const [createCollBusy, setCreateCollBusy] = useState(false);
  const [createCollError, setCreateCollError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);

  const [playMode, setPlayMode] = useState<PlayModeSettings>({
    neverAnswered: false,
    wrongAnswered: false,
    sortBase: "none",
    errorPriority: false,
    shuffleExtra: false,
    includeReflexion: false,
    reflexionSharePercent: 25,
    includeChildCollections: false,
    childCollectionsMix: "famille",
    familyQuotaPercent: 100,
    familyQuotaMax: 0,
    includePersonnaliteFiches: false,
  });
  const [playQtype, setPlayQtype] = useState<PlayQtype>("melanger");
  const [playInfinite, setPlayInfinite] = useState(false);
  /** Racine dont on n’affiche que les descendants (enfants / petits-enfants). */
  const [hierarchySubtreeRootId, setHierarchySubtreeRootId] = useState<number | null>(null);
  const [hierarchySubtreeSearch, setHierarchySubtreeSearch] = useState("");
  const [hierarchySuggestFocused, setHierarchySuggestFocused] = useState(false);
  /** Recherche globale sur le titre (toutes les collections visibles après filtres créateur / module). */
  const [collectionListSearch, setCollectionListSearch] = useState("");
  const [collectionListSuggestFocused, setCollectionListSuggestFocused] = useState(false);
  const [newCollectionKind, setNewCollectionKind] = useState<"normale" | "personnalite">("normale");
  const [personnaliteModalOpen, setPersonnaliteModalOpen] = useState(false);
  const [personnaliteModalBusy, setPersonnaliteModalBusy] = useState(false);
  const [personnaliteModalError, setPersonnaliteModalError] = useState<string | null>(null);
  const [personalitesPicker, setPersonalitesPicker] = useState<PersonalitePickerRowUi[]>([]);
  const [assignPersoBusyCollectionId, setAssignPersoBusyCollectionId] = useState<number | null>(null);
  const [assignPersoError, setAssignPersoError] = useState<string | null>(null);

  const jsonImportInputRef = useRef<HTMLInputElement | null>(null);
  const [jsonImportOpen, setJsonImportOpen] = useState(false);
  const [jsonImportMode, setJsonImportMode] = useState<"app" | "llm">("app");
  const [jsonImportText, setJsonImportText] = useState("");
  const [jsonImportBusy, setJsonImportBusy] = useState(false);
  const [jsonImportMessage, setJsonImportMessage] = useState<string | null>(null);
  const [jsonImportError, setJsonImportError] = useState<string | null>(null);
  const [jsonImportCategorie, setJsonImportCategorie] = useState<"histoire" | "pratique" | "connaissance">("histoire");

  const loadBootstrap = useCallback(async (): Promise<{
    list: CollectionUi[];
    picker: PersonalitePickerRowUi[];
  }> => {
    const [list, picker] = await Promise.all([
      fetchCollections(),
      fetchPersonalitesPicker().catch(() => [] as PersonalitePickerRowUi[]),
    ]);
    return { list, picker };
  }, []);

  const tagFilterOptions = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of collections) {
      for (const t of c.collection_tags ?? []) {
        if (!map.has(t.id)) map.set(t.id, t.nom);
      }
    }
    return [...map.entries()]
      .map(([id, nom]) => ({ id, nom }))
      .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  }, [collections]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { list, picker } = await loadBootstrap();
        if (!cancelled) {
          setCollections(list);
          setPersonalitesPicker(picker);
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
  }, [loadBootstrap]);

  useEffect(() => {
    if (tagFilter !== "all" && !tagFilterOptions.some((t) => t.id === tagFilter)) setTagFilter("all");
  }, [tagFilter, tagFilterOptions]);

  const tagPickerPool = useMemo(
    () => collections.map((c) => ({ id: c.id, nom: c.nom })),
    [collections],
  );

  useEffect(() => {
    if (hierarchySubtreeRootId == null) {
      setHierarchySubtreeSearch("");
      setHierarchySuggestFocused(false);
      return;
    }
    const root = collections.find((c) => c.id === hierarchySubtreeRootId);
    const hasKids = (root?.sous_collections?.length ?? 0) > 0;
    if (!root || !hasKids) setHierarchySubtreeRootId(null);
  }, [collections, hierarchySubtreeRootId]);

  const handleAssignTag = async (collectionId: number, tagCollectionId: number) => {
    setAssignBusyCollectionId(collectionId);
    setAssignError(null);
    try {
      const updated = await assignCollectionTag(collectionId, tagCollectionId);
      setCollections((prev) => prev.map((c) => (c.id === collectionId ? updated : c)));
    } catch (e) {
      setAssignError(e instanceof Error ? e.message : "Association etiquette impossible.");
    } finally {
      setAssignBusyCollectionId(null);
    }
  };

  const handleUnassignTag = async (collectionId: number, tagCollectionId: number) => {
    setAssignBusyCollectionId(collectionId);
    setAssignError(null);
    try {
      const updated = await unassignCollectionTag(collectionId, tagCollectionId);
      setCollections((prev) => prev.map((c) => (c.id === collectionId ? updated : c)));
    } catch (e) {
      setAssignError(e instanceof Error ? e.message : "Retrait etiquette impossible.");
    } finally {
      setAssignBusyCollectionId(null);
    }
  };

  const handleCreatePersonnaliteFromModal = async (payload: {
    nom: string;
    prenom: string;
    naissance: number;
    mort: number | null;
    resumer: string;
    tagCollectionId: number | "";
  }) => {
    setPersonnaliteModalBusy(true);
    setPersonnaliteModalError(null);
    try {
      const body = {
        userId,
        nom: payload.nom,
        prenom: payload.prenom,
        naissance: payload.naissance,
        mort: payload.mort,
        resumer: payload.resumer,
        ...(payload.tagCollectionId !== "" ? { tagCollectionId: Number(payload.tagCollectionId) } : {}),
      };
      const ui = await createPersonaliteCollection(body);
      setCollections((prev) => [...prev, ui].sort((a, b) => a.id - b.id));
      const picker = await fetchPersonalitesPicker().catch(() => [] as PersonalitePickerRowUi[]);
      setPersonalitesPicker(picker);
      setPersonnaliteModalOpen(false);
      const tagQ =
        payload.tagCollectionId !== "" ? `?tagCollection=${Number(payload.tagCollectionId)}` : "";
      route(`/questions/${ui.id}${tagQ}`);
    } catch (e) {
      setPersonnaliteModalError(
        e instanceof Error ? e.message : "Creation personnalité impossible.",
      );
    } finally {
      setPersonnaliteModalBusy(false);
    }
  };

  const handleAssignPersoToCollection = async (
    collectionId: number,
    personaliteId: number,
    importanceType: "" | "pionnier" | "important" | "secondaire",
  ) => {
    setAssignPersoBusyCollectionId(collectionId);
    setAssignPersoError(null);
    try {
      const updated = await assignPersonaliteToCollection(collectionId, {
        userId,
        personaliteId,
        importanceType: importanceType === "" ? null : importanceType,
      });
      setCollections((prev) => prev.map((c) => (c.id === collectionId ? updated : c)));
    } catch (e) {
      setAssignPersoError(e instanceof Error ? e.message : "Association personnalité impossible.");
    } finally {
      setAssignPersoBusyCollectionId(null);
    }
  };

  const handleUnassignPersoFromCollection = async (
    collectionId: number,
    personaliteId: number,
  ) => {
    setAssignPersoBusyCollectionId(collectionId);
    setAssignPersoError(null);
    try {
      const updated = await unassignPersonaliteFromCollection(collectionId, personaliteId, userId);
      setCollections((prev) => prev.map((c) => (c.id === collectionId ? updated : c)));
    } catch (e) {
      setAssignPersoError(
        e instanceof Error ? e.message : "Dissociation personnalité impossible.",
      );
    } finally {
      setAssignPersoBusyCollectionId(null);
    }
  };

  const handleCreateCollection = async () => {
    const nom = newCollName.trim();
    if (!nom) return;
    setCreateCollBusy(true);
    setCreateCollError(null);
    try {
      const body: { userId: number; nom: string; tagCollectionId?: number } = { userId, nom };
      if (newCollTagId !== "") body.tagCollectionId = Number(newCollTagId);
      const ui = await createEmptyCollection(body);
      setCollections((prev) => [...prev, ui].sort((a, b) => a.id - b.id));
      setNewCollName("");
      setNewCollTagId("");
      const tagQ = body.tagCollectionId != null ? `?tagCollection=${body.tagCollectionId}` : "";
      route(`/questions/${ui.id}${tagQ}`);
    } catch (e) {
      setCreateCollError(e instanceof Error ? e.message : "Creation impossible.");
    } finally {
      setCreateCollBusy(false);
    }
  };

  const confirmDeleteBusy = pendingDelete != null && deleteCollectionBusyId !== null;

  const runConfirmedDelete = async () => {
    if (pendingDelete == null) return;
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
  };

  const confirmLabels = pendingDeleteLabels(pendingDelete);

  const autresCreateurs = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of collections) if (c.user_id !== userId) map.set(c.user_id, c.createur_pseudot);
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [collections, userId]);

  const filtered = useMemo(
    () => applyTagFilter(filterCollections(collections, filter, userId), tagFilter),
    [collections, filter, userId, tagFilter],
  );

  const filteredSourceCount = filtered.length;

  const filteredByListSearch = useMemo(() => {
    const q = collectionListSearch.trim().toLowerCase();
    if (q === "") return filtered;
    return filtered.filter((c) => c.nom.toLowerCase().includes(q));
  }, [filtered, collectionListSearch]);

  const collectionListSuggestions = useMemo(() => {
    const q = collectionListSearch.trim().toLowerCase();
    return filtered
      .map((c) => ({ id: c.id, nom: c.nom }))
      .filter((s) => (q === "" ? true : s.nom.toLowerCase().includes(q)))
      .slice(0, 12);
  }, [filtered, collectionListSearch]);

  const showCollectionListSuggestPanel =
    collectionListSuggestFocused && collectionListSuggestions.length > 0;

  const collectionsById = useMemo(
    () => new Map(collections.map((c) => [c.id, c])),
    [collections],
  );

  const descendantIdSet = useMemo(() => {
    if (hierarchySubtreeRootId == null) return null;
    return collectDescendantCollectionIds(hierarchySubtreeRootId, collections);
  }, [hierarchySubtreeRootId, collections]);

  const baseForDisplayedList = useMemo(() => {
    if (hierarchySubtreeRootId == null || descendantIdSet == null) return filteredByListSearch;
    const descendantsInFilter = filteredByListSearch.filter((c) => descendantIdSet.has(c.id));
    const rootInFilter = filteredByListSearch.find((c) => c.id === hierarchySubtreeRootId);
    if (!rootInFilter) return descendantsInFilter;
    const rest = descendantsInFilter.filter((c) => c.id !== hierarchySubtreeRootId);
    return [rootInFilter, ...rest];
  }, [filteredByListSearch, hierarchySubtreeRootId, descendantIdSet]);

  const searchNorm = hierarchySubtreeSearch.trim().toLowerCase();

  const afterSearchFilter = useMemo(() => {
    if (hierarchySubtreeRootId == null) return baseForDisplayedList;
    if (searchNorm === "") return baseForDisplayedList;
    const rootId = hierarchySubtreeRootId;
    const matched = baseForDisplayedList.filter((c) => c.nom.toLowerCase().includes(searchNorm));
    const root = baseForDisplayedList.find((c) => c.id === rootId);
    if (root != null && !matched.some((c) => c.id === rootId)) {
      return [root, ...matched];
    }
    return matched;
  }, [baseForDisplayedList, hierarchySubtreeRootId, searchNorm]);

  const displayCollections = useMemo(() => {
    if (hierarchySubtreeRootId != null) return orderCollectionsHierarchy(afterSearchFilter);
    return afterSearchFilter;
  }, [afterSearchFilter, hierarchySubtreeRootId]);

  const hierarchySubtreeRootNom =
    hierarchySubtreeRootId != null ? collectionsById.get(hierarchySubtreeRootId)?.nom ?? "" : "";

  const hierarchySearchSuggestions = useMemo(() => {
    if (hierarchySubtreeRootId == null || descendantIdSet == null) return [] as { id: number; nom: string }[];
    const pool = filtered.filter(
      (c) => c.id === hierarchySubtreeRootId || descendantIdSet.has(c.id),
    );
    const q = hierarchySubtreeSearch.trim().toLowerCase();
    const scored = pool
      .map((c) => ({ id: c.id, nom: c.nom }))
      .filter((s) => (q === "" ? true : s.nom.toLowerCase().includes(q)))
      .slice(0, 12);
    return scored;
  }, [hierarchySubtreeRootId, descendantIdSet, filtered, hierarchySubtreeSearch]);

  const showHierarchySuggestPanel =
    hierarchySubtreeRootId != null && hierarchySuggestFocused && hierarchySearchSuggestions.length > 0;

  /** Profondeur réelle dans tout l’arbre (couleurs), pas relative à la vue « sous-arbre ». */
  const getTreeDepth = useCallback(
    (c: CollectionUi) => computeTreeDepth(c, collectionsById),
    [collectionsById],
  );

  const clearHierarchySubtree = useCallback(() => {
    setHierarchySubtreeRootId(null);
    setHierarchySubtreeSearch("");
    setHierarchySuggestFocused(false);
  }, []);

  const setHierarchyRootFromCard = useCallback((collectionId: number, enabled: boolean) => {
    if (enabled) {
      setCollectionListSearch("");
      setCollectionListSuggestFocused(false);
      setHierarchySubtreeSearch("");
      setHierarchySuggestFocused(false);
    }
    setHierarchySubtreeRootId((prev) => {
      if (enabled) return collectionId;
      if (prev === collectionId) return null;
      return prev;
    });
  }, []);

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
          const { list, picker } = await loadBootstrap();
          setCollections(list);
          setPersonalitesPicker(picker);
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
      const { list, picker } = await loadBootstrap();
      setCollections(list);
      setPersonalitesPicker(picker);
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
    loadBootstrap()
      .then(({ list, picker }) => {
        setCollections(list);
        setPersonalitesPicker(picker);
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
    tagPickerPool,
    tagFilterOptions,
    pendingDelete,
    assignBusyCollectionId,
    deleteCollectionBusyId,
    newCollName,
    newCollTagId,
    createCollBusy,
    createCollError,
    onChangeNewCollName: setNewCollName,
    onChangeNewCollTagId: setNewCollTagId,
    onCreateCollection: () => void handleCreateCollection(),
    assignError,
    deleteCollectionError,
    filter,
    onChangeFilter: setFilter,
    autresCreateurs,
    tagFilter,
    onChangeTagFilter: setTagFilter,
    filtered: displayCollections,
    filteredSourceCount,
    collectionListSearch,
    onCollectionListSearch: setCollectionListSearch,
    collectionListSuggestions,
    showCollectionListSuggestPanel,
    onCollectionListSuggestFocus: () => setCollectionListSuggestFocused(true),
    onCollectionListSuggestBlur: () => {
      setTimeout(() => setCollectionListSuggestFocused(false), 150);
    },
    onPickCollectionListSuggestion: (nom: string) => {
      setCollectionListSearch(nom);
      setCollectionListSuggestFocused(false);
    },
    hierarchySubtreeRootId,
    hierarchySubtreeRootNom,
    hierarchySubtreeSearch,
    onHierarchySubtreeSearch: setHierarchySubtreeSearch,
    hierarchySearchSuggestions,
    showHierarchySuggestPanel,
    onHierarchySuggestFocus: () => setHierarchySuggestFocused(true),
    onHierarchySuggestBlur: () => {
      setTimeout(() => setHierarchySuggestFocused(false), 150);
    },
    onPickHierarchySuggestion: (nom: string) => {
      setHierarchySubtreeSearch(nom);
      setHierarchySuggestFocused(false);
    },
    clearHierarchySubtree,
    setHierarchyRootFromCard,
    getTreeDepth,
    userId,
    playMode,
    onPlayModeChange: (patch: Partial<PlayModeSettings>) => setPlayMode((prev) => ({ ...prev, ...patch })),
    playQtype,
    onPlayQtypeChange: setPlayQtype,
    playInfinite,
    onPlayInfiniteChange: setPlayInfinite,
    onAssignTag: handleAssignTag,
    onUnassignTag: handleUnassignTag,
    onRequestDeleteCollection: (collection: CollectionUi) =>
      setPendingDelete({ kind: "collection", data: collection }),
    newCollectionKind,
    onChangeNewCollectionKind: setNewCollectionKind,
    personnaliteModalOpen,
    personnaliteModalBusy,
    personnaliteModalError,
    onOpenPersonnaliteModal: () => {
      setPersonnaliteModalError(null);
      setPersonnaliteModalOpen(true);
    },
    onClosePersonnaliteModal: () => {
      if (!personnaliteModalBusy) setPersonnaliteModalOpen(false);
    },
    onSubmitPersonnaliteModal: handleCreatePersonnaliteFromModal,
    personalitesPicker,
    assignPersoBusyCollectionId,
    assignPersoError,
    onAssignPersoToCollection: handleAssignPersoToCollection,
    onUnassignPersoFromCollection: handleUnassignPersoFromCollection,
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
