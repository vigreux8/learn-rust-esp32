import { useCallback, useMemo, useState } from "preact/hooks";
import { collectSubtreeCollectionIds } from "../../../../lib/collectionHierarchyVis";
import { filterFlowSidebarCollectionRows, REACT_FLOW_DND_MIME } from "./FlowSidebarOverlay.metier";
import type { FlowSidebarOverlayProps, SidebarTab } from "./FlowSidebarOverlay.types";

type QuestionGroup = {
  category: string;
  items: FlowSidebarOverlayProps["data"]["questions"];
};

/**
 * Orchestre onglets sidebar, filtres collections / questions / personnalités et drag HTML5 vers React Flow.
 */
export function useFlowSidebarOverlay(props: FlowSidebarOverlayProps) {
  const { data } = props;
  const [activeTab, setActiveTab] = useState<SidebarTab>(null);
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

  const toggleTab = useCallback((tab: Exclude<SidebarTab, null>) => {
    setActiveTab((current) => (current === tab ? null : tab));
  }, []);

  const closePanel = useCallback(() => {
    setActiveTab(null);
  }, []);

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
    const questions =
      query.length > 0
        ? data.questions.filter(
            (item) =>
              item.title.toLowerCase().includes(query) ||
              item.category.toLowerCase().includes(query),
          )
        : data.questions;
    const map = new Map<string, FlowSidebarOverlayProps["data"]["questions"]>();
    const categoryOrder: string[] = [];
    for (const item of questions) {
      const key = item.category.trim().length > 0 ? item.category : "Sans catégorie";
      if (!map.has(key)) {
        map.set(key, []);
        categoryOrder.push(key);
      }
      map.get(key)!.push(item);
    }
    const groups: QuestionGroup[] = categoryOrder.map((category) => ({
      category,
      items: map.get(category)!,
    }));
    return groups;
  }, [data.questions, questionSearch]);

  const onDragStart = useCallback((event: DragEvent, nodeType: string, payload: unknown) => {
    if (!event.dataTransfer) return;
    const body = JSON.stringify({ type: nodeType, data: payload });
    event.dataTransfer.setData(REACT_FLOW_DND_MIME, body);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  return {
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
