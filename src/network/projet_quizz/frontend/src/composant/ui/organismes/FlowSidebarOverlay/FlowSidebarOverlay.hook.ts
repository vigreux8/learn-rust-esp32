import { useCallback, useMemo, useState } from "preact/hooks";
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
  const [levelFilters, setLevelFilters] = useState<number[]>([]);

  const toggleTab = useCallback((tab: Exclude<SidebarTab, null>) => {
    setActiveTab((current) => (current === tab ? null : tab));
  }, []);

  const closePanel = useCallback(() => {
    setActiveTab(null);
  }, []);

  const toggleLevel = useCallback((level: number) => {
    setLevelFilters((prev) =>
      prev.includes(level) ? prev.filter((value) => value !== level) : [...prev, level],
    );
  }, []);

  const isLevelActive = useCallback(
    (level: number) => {
      return levelFilters.includes(level);
    },
    [levelFilters],
  );

  const filteredCollections = useMemo(() => {
    let rows = data.collections;
    if (levelFilters.length > 0) {
      rows = rows.filter((row) => levelFilters.includes(row.level));
    }
    const query = collectionSearch.trim().toLowerCase();
    if (query.length > 0) {
      rows = rows.filter((row) => row.label.toLowerCase().includes(query));
    }
    return rows;
  }, [collectionSearch, data.collections, levelFilters]);

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
      toggleLevel,
      isLevelActive,
    },
    questions: {
      search: questionSearch,
      setSearch: setQuestionSearch,
      groups: questionGroups,
    },
    drag: { onDragStart },
  };
}
