import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { collectSubtreeCollectionIds } from "../../../../lib/collectionHierarchyVis";
import { useClosePanelOnDocumentClickOutside } from "../../../../lib/useClosePanelOnDocumentClickOutside";
import { filterFlowSidebarCollectionRows, REACT_FLOW_DND_MIME } from "./FlowSidebarOverlay.metier";
import type {
  FlowSidebarOverlayProps,
  FlowSidebarQuestionListGroup,
  SidebarTab,
} from "./FlowSidebarOverlay.types";

const FLOW_SIDEBAR_TAB_STORAGE_KEY = "quizz-node-flow-sidebar-active-tab";

const SIDEBAR_TAB_IDS: Exclude<SidebarTab, null>[] = [
  "collections",
  "collectionSubtree",
  "questions",
  "personalities",
  "create",
];

function readStoredSidebarTab(): SidebarTab {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(FLOW_SIDEBAR_TAB_STORAGE_KEY);
    if (raw == null || raw === "") return null;
    if ((SIDEBAR_TAB_IDS as readonly string[]).includes(raw)) {
      return raw as Exclude<SidebarTab, null>;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function persistSidebarTab(tab: SidebarTab): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (tab === null) sessionStorage.removeItem(FLOW_SIDEBAR_TAB_STORAGE_KEY);
    else sessionStorage.setItem(FLOW_SIDEBAR_TAB_STORAGE_KEY, tab);
  } catch {
    /* ignore */
  }
}

type QuestionGroup = FlowSidebarQuestionListGroup;

/**
 * Orchestre onglets sidebar, filtres collections / questions / personnalités et drag HTML5 vers React Flow.
 */
export function useFlowSidebarOverlay(props: FlowSidebarOverlayProps) {
  const { data, presentation } = props;
  const [activeTab, setActiveTab] = useState<SidebarTab>(() => readStoredSidebarTab());
  const [collectionSearch, setCollectionSearch] = useState("");
  const [collectionSubtreeSearch, setCollectionSubtreeSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  /** Indices de palette (0…dernier) : même regroupement visuel que les bords de carte collections. */
  const [paletteBucketFilters, setPaletteBucketFilters] = useState<number[]>([]);
  const [subtreePaletteBucketFilters, setSubtreePaletteBucketFilters] = useState<number[]>([]);
  const [personalitySearch, setPersonalitySearch] = useState("");
  /** Collection racine : personnalités liées à cette collection ou à une collection enfant. `null` = tout. */
  const [personalityBranchRootCollectionId, setPersonalityBranchRootCollectionId] = useState<
    number | null
  >(null);

  useEffect(() => {
    persistSidebarTab(activeTab);
  }, [activeTab]);

  const toggleTab = useCallback((tab: Exclude<SidebarTab, null>) => {
    setActiveTab((current) => (current === tab ? null : tab));
  }, []);

  const closePanel = useCallback(() => {
    setActiveTab(null);
  }, []);

  const openTab = useCallback((tab: Exclude<SidebarTab, null>) => {
    setActiveTab(tab);
  }, []);

  const overlayRef = useRef<HTMLDivElement>(null);

  const documentClickIgnoreRefs = useMemo(() => {
    const base = presentation?.clickOutsideIgnoreRefs ?? [];
    if (activeTab === "questions" && presentation?.reactFlowRootRef != null) {
      return [...base, presentation.reactFlowRootRef];
    }
    return [...base];
  }, [activeTab, presentation?.clickOutsideIgnoreRefs, presentation?.reactFlowRootRef]);

  useClosePanelOnDocumentClickOutside({
    open: activeTab !== null,
    containerRef: overlayRef,
    ignoreRefs: documentClickIgnoreRefs,
    onClose: closePanel,
  });

  useLayoutEffect(() => {
    const slot = presentation?.sidebarHostApiRef;
    if (slot == null) return;
    slot.current = { activeTab, closePanel, openTab };
    return () => {
      slot.current = null;
    };
  }, [activeTab, closePanel, openTab, presentation?.sidebarHostApiRef]);

  const togglePaletteBucket = useCallback((bucket: number) => {
    setPaletteBucketFilters((prev) =>
      prev.includes(bucket) ? prev.filter((value) => value !== bucket) : [...prev, bucket],
    );
  }, []);

  const toggleSubtreePaletteBucket = useCallback((bucket: number) => {
    setSubtreePaletteBucketFilters((prev) =>
      prev.includes(bucket) ? prev.filter((value) => value !== bucket) : [...prev, bucket],
    );
  }, []);

  const isPaletteBucketActive = useCallback(
    (bucket: number) => {
      return paletteBucketFilters.includes(bucket);
    },
    [paletteBucketFilters],
  );

  const isSubtreePaletteBucketActive = useCallback(
    (bucket: number) => subtreePaletteBucketFilters.includes(bucket),
    [subtreePaletteBucketFilters],
  );

  const personalitiesSource = data.personalities ?? [];
  const collectionHierarchy = data.collectionHierarchy ?? [];

  const personalityCollectionOptions = useMemo(
    () =>
      data.collections.map((row) => ({
        id: row.collectionId,
        label: row.label,
      })),
    [data.collections],
  );

  const filteredPersonalities = useMemo(() => {
    let rows = personalitiesSource;
    if (personalityBranchRootCollectionId != null && collectionHierarchy.length > 0) {
      const subtree = collectSubtreeCollectionIds(
        personalityBranchRootCollectionId,
        collectionHierarchy,
      );
      rows = rows.filter((row) => subtree.has(row.collectionId));
    }
    const query = personalitySearch.trim().toLowerCase();
    if (query.length > 0) {
      rows = rows.filter(
        (row) =>
          row.label.toLowerCase().includes(query) ||
          row.collectionLabel.toLowerCase().includes(query),
      );
    }
    return rows;
  }, [
    collectionHierarchy,
    personalityBranchRootCollectionId,
    personalitySearch,
    personalitiesSource,
  ]);

  const filteredCollections = useMemo(
    () => filterFlowSidebarCollectionRows(data.collections, paletteBucketFilters, collectionSearch),
    [collectionSearch, data.collections, paletteBucketFilters],
  );

  const filteredCollectionSubtreeRows = useMemo(
    () =>
      filterFlowSidebarCollectionRows(
        data.collections,
        subtreePaletteBucketFilters,
        collectionSubtreeSearch,
      ),
    [collectionSubtreeSearch, data.collections, subtreePaletteBucketFilters],
  );

  const questionGroups = useMemo(() => {
    const query = questionSearch.trim().toLowerCase();
    /** Recherche uniquement sur l’intitulé brut de la question ; les collections restent toutes listées. */
    const questionsFiltered =
      query.length > 0
        ? data.questions.filter((item) => item.title.toLowerCase().includes(query))
        : data.questions;

    const byCollectionId = new Map<number, FlowSidebarOverlayProps["data"]["questions"]>();
    for (const item of questionsFiltered) {
      const list = byCollectionId.get(item.collectionId);
      if (list) list.push(item);
      else byCollectionId.set(item.collectionId, [item]);
    }

    const totalByCollectionId = new Map<number, number>();
    for (const item of data.questions) {
      totalByCollectionId.set(item.collectionId, (totalByCollectionId.get(item.collectionId) ?? 0) + 1);
    }

    const hierarchy = data.collectionHierarchy ?? [];
    let rowsOrdered = data.collections;

    const canvasScopedIds = presentation?.questionsCanvasCollectionIds;
    if (canvasScopedIds !== undefined) {
      const canvasSet = new Set(canvasScopedIds);
      rowsOrdered = data.collections.filter((row) => canvasSet.has(row.collectionId));
    }

    const scopeRootId = presentation?.questionsDetailsExpandCollectionId ?? null;
    if (scopeRootId != null && hierarchy.length > 0) {
      const scopeSet = collectSubtreeCollectionIds(scopeRootId, hierarchy);
      rowsOrdered = rowsOrdered.filter((row) => scopeSet.has(row.collectionId));
    }

    const groups: QuestionGroup[] = [];
    for (const row of rowsOrdered) {
      const rawItems = byCollectionId.get(row.collectionId) ?? [];
      const items = [...rawItems].sort((a, b) => Number(a.id) - Number(b.id));
      groups.push({
        collectionId: row.collectionId,
        category: row.label,
        treeDepth: row.treeDepth,
        items,
        totalQuestionCount: totalByCollectionId.get(row.collectionId) ?? 0,
      });
    }

    return groups;
  }, [
    data.collectionHierarchy,
    data.collections,
    data.questions,
    presentation?.questionsCanvasCollectionIds,
    presentation?.questionsDetailsExpandCollectionId,
    questionSearch,
  ]);

  const onDragStart = useCallback((event: DragEvent, nodeType: string, payload: unknown) => {
    if (!event.dataTransfer) return;
    const body = JSON.stringify({ type: nodeType, data: payload });
    event.dataTransfer.setData(REACT_FLOW_DND_MIME, body);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  return {
    shell: { overlayRef },
    rail: { activeTab, toggleTab },
    panneau: { activeTab, closePanel },
    collections: {
      search: collectionSearch,
      setSearch: setCollectionSearch,
      rows: filteredCollections,
      togglePaletteBucket,
      isPaletteBucketActive,
    },
    collectionSubtree: {
      search: collectionSubtreeSearch,
      setSearch: setCollectionSubtreeSearch,
      rows: filteredCollectionSubtreeRows,
      togglePaletteBucket: toggleSubtreePaletteBucket,
      isPaletteBucketActive: isSubtreePaletteBucketActive,
    },
    questions: {
      search: questionSearch,
      setSearch: setQuestionSearch,
      groups: questionGroups,
    },
    personalities: {
      search: personalitySearch,
      setSearch: setPersonalitySearch,
      rows: filteredPersonalities,
      branchRootCollectionId: personalityBranchRootCollectionId,
      setBranchRootCollectionId: setPersonalityBranchRootCollectionId,
      collectionOptions: personalityCollectionOptions,
    },
    drag: { onDragStart },
  };
}
