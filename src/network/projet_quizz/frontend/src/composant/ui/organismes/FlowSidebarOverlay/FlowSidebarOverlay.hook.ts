import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { collectSubtreeCollectionIds } from "../../../../lib/collectionHierarchyVis";
import { useClosePanelOnDocumentClickOutside } from "../../../../lib/useClosePanelOnDocumentClickOutside";
import {
  buildSidebarEnfantChipsForParents,
  buildSidebarEnfantChipsFromQuestionsFallback,
  buildSidebarParentChipsFromHierarchy,
  buildSidebarParentChipsFromQuestions,
  collectAllowedEnfantIdsUnion,
  questionMatchesSidebarCategoryFilters,
} from "./parts/QuestionListPanel/QuestionListPanel.categoryFilter.metier";
import { filterFlowSidebarCollectionRows, hierarchyHasDirectChildFor, REACT_FLOW_DND_MIME, dedupePersonalityRowsByPersonId, personalityLabelsMatchesNameTokens } from "./FlowSidebarOverlay.metier";
import type {
  FlowSidebarOverlayProps,
  FlowSidebarQuestionListGroup,
  FlowSidebarReflexionGroupeRow,
  SidebarTab,
} from "./FlowSidebarOverlay.types";

const FLOW_SIDEBAR_TAB_STORAGE_KEY = "quizz-node-flow-sidebar-active-tab";

const SIDEBAR_TAB_IDS: Exclude<SidebarTab, null>[] = [
  "collections",
  "collectionSubtree",
  "questions",
  "personalities",
  "create",
  "settings",
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
  const [questionFilterParentId, setQuestionFilterParentId] = useState<number | null>(null);
  const [questionFilterEnfantId, setQuestionFilterEnfantId] = useState<number | null>(null);
  /** Indices de palette (0…dernier) : même regroupement visuel que les bords de carte collections. */
  const [paletteBucketFilters, setPaletteBucketFilters] = useState<number[]>([]);
  const [subtreePaletteBucketFilters, setSubtreePaletteBucketFilters] = useState<number[]>([]);
  const [personalitySearch, setPersonalitySearch] = useState("");
  const [personalityCollectionSearch, setPersonalityCollectionSearch] = useState("");

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

  const refCategoriesHierarchyRows = data.refCategoriesHierarchy ?? [];

  const toggleQuestionFilterParent = useCallback((parentCategorieId: number) => {
    setQuestionFilterParentId((prev) => {
      if (prev === parentCategorieId) return null;
      return parentCategorieId;
    });
    setQuestionFilterEnfantId(null);
  }, []);

  const toggleQuestionFilterEnfant = useCallback((enfantCategorieId: number) => {
    setQuestionFilterEnfantId((prev) => (prev === enfantCategorieId ? null : enfantCategorieId));
  }, []);

  const reflexionSuitesByCollectionId = useMemo(() => {
    const m = new Map<number, { groupes: readonly FlowSidebarReflexionGroupeRow[] }>();
    const payloads = data.reflexionSuites;
    if (payloads == null) return m;
    for (const p of payloads) {
      m.set(p.collectionId, {
        groupes: p.groupes,
      });
    }
    return m;
  }, [data.reflexionSuites]);

  const parentScopeForEnfantChips = useMemo(
    () => (questionFilterParentId != null ? [questionFilterParentId] : []),
    [questionFilterParentId],
  );

  const allowedEnfantIdsForSelection = useMemo(() => {
    if (questionFilterParentId == null) return new Set<number>();
    if (refCategoriesHierarchyRows.length > 0) {
      return collectAllowedEnfantIdsUnion(refCategoriesHierarchyRows, parentScopeForEnfantChips);
    }
    return new Set(
      buildSidebarEnfantChipsFromQuestionsFallback(data.questions, parentScopeForEnfantChips).map((c) => c.id),
    );
  }, [data.questions, parentScopeForEnfantChips, questionFilterParentId, refCategoriesHierarchyRows]);

  useEffect(() => {
    if (questionFilterEnfantId == null) return;
    if (!allowedEnfantIdsForSelection.has(questionFilterEnfantId)) {
      setQuestionFilterEnfantId(null);
    }
  }, [allowedEnfantIdsForSelection, questionFilterEnfantId]);

  const questionFilterParentChips = useMemo(
    () =>
      refCategoriesHierarchyRows.length > 0
        ? buildSidebarParentChipsFromHierarchy(refCategoriesHierarchyRows)
        : buildSidebarParentChipsFromQuestions(data.questions),
    [data.questions, refCategoriesHierarchyRows],
  );

  const questionFilterEnfantChips = useMemo(() => {
    if (questionFilterParentId == null) return [];
    if (refCategoriesHierarchyRows.length > 0) {
      return buildSidebarEnfantChipsForParents(refCategoriesHierarchyRows, parentScopeForEnfantChips);
    }
    return buildSidebarEnfantChipsFromQuestionsFallback(data.questions, parentScopeForEnfantChips);
  }, [data.questions, parentScopeForEnfantChips, questionFilterParentId, refCategoriesHierarchyRows]);

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

  const personalityLabelSuggestions = useMemo(() => {
    const s = new Set<string>();
    for (const p of personalitiesSource) {
      const t = p.label.trim();
      if (t.length > 0) s.add(t);
    }
    return [...s].sort((a, b) => a.localeCompare(b, "fr")).slice(0, 400);
  }, [personalitiesSource]);

  const collectionLabelSuggestions = useMemo(() => {
    const s = new Set<string>();
    for (const c of data.collections) {
      const t = c.label.trim();
      if (t.length > 0) s.add(t);
    }
    return [...s].sort((a, b) => a.localeCompare(b, "fr")).slice(0, 400);
  }, [data.collections]);

  const filteredPersonalities = useMemo(() => {
    let rows = personalitiesSource;

    const collQ = personalityCollectionSearch.trim().toLowerCase();
    if (collQ.length > 0) {
      if (collectionHierarchy.length > 0) {
        const matchedRoots: number[] = [];
        for (const c of data.collections) {
          if (c.label.toLowerCase().includes(collQ)) matchedRoots.push(c.collectionId);
        }
        if (matchedRoots.length === 0) {
          rows = [];
        } else {
          const scope = new Set<number>();
          for (const rootId of matchedRoots) {
            for (const id of collectSubtreeCollectionIds(rootId, collectionHierarchy)) {
              scope.add(id);
            }
          }
          rows = rows.filter((row) => scope.has(row.collectionId));
        }
      } else {
        rows = rows.filter((row) => row.collectionLabel.toLowerCase().includes(collQ));
      }
    }

    const nameQ = personalitySearch.trim();
    if (nameQ.length > 0) {
      rows = rows.filter((row) => personalityLabelsMatchesNameTokens(row.label, personalitySearch));
    }

    return dedupePersonalityRowsByPersonId(rows);
  }, [
    collectionHierarchy,
    data.collections,
    personalityCollectionSearch,
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

  const collectionSubtreeOrphanRows = useMemo(() => {
    const hierarchy = data.collectionHierarchy ?? [];
    const orphans = data.collections.filter(
      (r) => r.parentCollectionId == null && !hierarchyHasDirectChildFor(r.collectionId, hierarchy),
    );
    return filterFlowSidebarCollectionRows(
      orphans,
      subtreePaletteBucketFilters,
      collectionSubtreeSearch,
    );
  }, [collectionSubtreeSearch, data.collectionHierarchy, data.collections, subtreePaletteBucketFilters]);

  const collectionSubtreeRowsExcludingOrphans = useMemo(() => {
    const hierarchy = data.collectionHierarchy ?? [];
    return filteredCollectionSubtreeRows.filter(
      (r) =>
        r.parentCollectionId != null || hierarchyHasDirectChildFor(r.collectionId, hierarchy),
    );
  }, [data.collectionHierarchy, filteredCollectionSubtreeRows]);

  const questionGroups = useMemo(() => {
    const query = questionSearch.trim().toLowerCase();
    /** Recherche uniquement sur l’intitulé brut de la question ; les collections restent toutes listées. */
    let questionsFiltered =
      query.length > 0
        ? data.questions.filter((item) => item.title.toLowerCase().includes(query))
        : data.questions;
    if (questionFilterParentId != null || questionFilterEnfantId != null) {
      questionsFiltered = questionsFiltered.filter((item) =>
        questionMatchesSidebarCategoryFilters(item, questionFilterParentId, questionFilterEnfantId),
      );
    }

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
      const reflex = reflexionSuitesByCollectionId.get(row.collectionId);
      groups.push({
        collectionId: row.collectionId,
        category: row.label,
        treeDepth: row.treeDepth,
        items,
        totalQuestionCount: totalByCollectionId.get(row.collectionId) ?? 0,
        reflexionGroupes: [...(reflex?.groupes ?? [])],
      });
    }

    return groups;
  }, [
    data.collectionHierarchy,
    data.collections,
    data.questions,
    presentation?.questionsCanvasCollectionIds,
    presentation?.questionsDetailsExpandCollectionId,
    questionFilterEnfantId,
    questionFilterParentId,
    questionSearch,
    reflexionSuitesByCollectionId,
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
      rows: collectionSubtreeRowsExcludingOrphans,
      orphanRows: collectionSubtreeOrphanRows,
      togglePaletteBucket: toggleSubtreePaletteBucket,
      isPaletteBucketActive: isSubtreePaletteBucketActive,
    },
    questions: {
      search: questionSearch,
      setSearch: setQuestionSearch,
      groups: questionGroups,
      categoryFilter: {
        parentChips: questionFilterParentChips,
        enfantChips: questionFilterEnfantChips,
        selectedParentId: questionFilterParentId,
        selectedEnfantId: questionFilterEnfantId,
      },
      toggleParentCategory: toggleQuestionFilterParent,
      toggleEnfantCategory: toggleQuestionFilterEnfant,
    },
    personalities: {
      search: personalitySearch,
      setSearch: setPersonalitySearch,
      collectionSearch: personalityCollectionSearch,
      setCollectionSearch: setPersonalityCollectionSearch,
      rows: filteredPersonalities,
      personalityLabelSuggestions,
      collectionLabelSuggestions,
    },
    drag: { onDragStart },
  };
}
