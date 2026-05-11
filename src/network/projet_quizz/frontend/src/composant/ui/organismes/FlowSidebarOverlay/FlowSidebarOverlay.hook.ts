import { useCallback, useMemo, useState } from "preact/hooks";
import { collectionTreePaletteBucket } from "../../../../lib/collectionHierarchyVis";
import { REACT_FLOW_DND_MIME } from "./FlowSidebarOverlay.metier";
import type { FlowSidebarOverlayProps, SidebarTab } from "./FlowSidebarOverlay.types";

type QuestionGroup = {
  category: string;
  items: FlowSidebarOverlayProps["data"]["questions"];
};

/**
 * Orchestre onglets sidebar, filtres collections / questions et drag HTML5 vers React Flow.
 */
export function useFlowSidebarOverlay(props: FlowSidebarOverlayProps) {
  const { data } = props;
  const [activeTab, setActiveTab] = useState<SidebarTab>(null);
  const [collectionSearch, setCollectionSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  /** Indices de palette (0…dernier) : même regroupement visuel que les bords de carte collections. */
  const [paletteBucketFilters, setPaletteBucketFilters] = useState<number[]>([]);

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

  const isPaletteBucketActive = useCallback(
    (bucket: number) => {
      return paletteBucketFilters.includes(bucket);
    },
    [paletteBucketFilters],
  );

  const filteredCollections = useMemo(() => {
    let rows = data.collections;
    if (paletteBucketFilters.length > 0) {
      rows = rows.filter((row) =>
        paletteBucketFilters.includes(collectionTreePaletteBucket(row.treeDepth)),
      );
    }
    const query = collectionSearch.trim().toLowerCase();
    if (query.length > 0) {
      rows = rows.filter((row) => row.label.toLowerCase().includes(query));
    }
    return rows;
  }, [collectionSearch, data.collections, paletteBucketFilters]);

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
    for (const item of questions) {
      const key = item.category.trim().length > 0 ? item.category : "Sans catégorie";
      const bucket = map.get(key) ?? [];
      bucket.push(item);
      map.set(key, bucket);
    }
    const groups: QuestionGroup[] = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b, "fr"))
      .map(([category, items]) => ({ category, items }));
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
    questions: {
      search: questionSearch,
      setSearch: setQuestionSearch,
      groups: questionGroups,
    },
    drag: { onDragStart },
  };
}
