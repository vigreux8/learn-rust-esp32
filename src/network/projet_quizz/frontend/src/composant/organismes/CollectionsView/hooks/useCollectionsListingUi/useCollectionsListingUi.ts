import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import {
  collectDescendantCollectionIds,
  computeTreeDepth,
  orderCollectionsHierarchy,
} from "../../../../../lib/collectionHierarchyVis";
import type { PlayQtype } from "../../../../../lib/playOrder";
import type { CollectionUi } from "../../../../../types/quizz";
import type { PlayModeSettings } from "../../../../atomes/PlayModePicker/PlayModePicker.types";
import { applyTagFilter, filterCollections } from "../../CollectionsView.metier";
import type { CollectionFilter } from "../../CollectionsView.types";
import type { UseCollectionsListingUiOptions, UseCollectionsListingUiResult } from "./useCollectionsListingUi.types";

export function useCollectionsListingUi({
  identity,
  data,
}: UseCollectionsListingUiOptions): UseCollectionsListingUiResult {
  const { userId } = identity;
  const { collections } = data;

  const [filter, setFilter] = useState<CollectionFilter>("all");
  const [tagFilter, setTagFilter] = useState<number | "all">("all");
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
  const [hierarchySubtreeRootId, setHierarchySubtreeRootId] = useState<number | null>(null);
  const [hierarchySubtreeSearch, setHierarchySubtreeSearch] = useState("");
  const [hierarchySuggestFocused, setHierarchySuggestFocused] = useState(false);
  const [collectionListSearch, setCollectionListSearch] = useState("");
  const [collectionListSuggestFocused, setCollectionListSuggestFocused] = useState(false);

  const tagFilterOptions = useMemo(() => {
    const map = new Map<number, string>();
    for (const coll of collections) {
      for (const t of coll.collection_tags ?? []) {
        if (!map.has(t.id)) map.set(t.id, t.nom);
      }
    }
    return [...map.entries()]
      .map(([id, nom]) => ({ id, nom }))
      .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  }, [collections]);

  useEffect(() => {
    if (tagFilter !== "all" && !tagFilterOptions.some((tRow) => tRow.id === tagFilter)) setTagFilter("all");
  }, [tagFilter, tagFilterOptions]);

  useEffect(() => {
    if (hierarchySubtreeRootId == null) {
      setHierarchySubtreeSearch("");
      setHierarchySuggestFocused(false);
      return;
    }
    const root = collections.find((cItem) => cItem.id === hierarchySubtreeRootId);
    const hasKids = (root?.sous_collections?.length ?? 0) > 0;
    if (!root || !hasKids) setHierarchySubtreeRootId(null);
  }, [collections, hierarchySubtreeRootId]);

  const tagPickerPool = useMemo(
    () => collections.map((cItem) => ({ id: cItem.id, nom: cItem.nom })),
    [collections],
  );

  const autresCreateurs = useMemo(() => {
    const map = new Map<number, string>();
    for (const coll of collections) if (coll.user_id !== userId) map.set(coll.user_id, coll.createur_pseudot);
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [collections, userId]);

  const filtered = useMemo(
    () => applyTagFilter(filterCollections(collections, filter, userId), tagFilter),
    [collections, filter, userId, tagFilter],
  );

  const filteredSourceCount = filtered.length;

  const filteredByListSearch = useMemo(() => {
    const normalized = collectionListSearch.trim().toLowerCase();
    if (normalized === "") return filtered;
    return filtered.filter((cItem) => cItem.nom.toLowerCase().includes(normalized));
  }, [filtered, collectionListSearch]);

  const collectionListSuggestions = useMemo(() => {
    const normalized = collectionListSearch.trim().toLowerCase();
    return filtered
      .map((cItem) => ({ id: cItem.id, nom: cItem.nom }))
      .filter((suggestion) =>
        normalized === "" ? true : suggestion.nom.toLowerCase().includes(normalized),
      )
      .slice(0, 12);
  }, [filtered, collectionListSearch]);

  const showCollectionListSuggestPanel =
    collectionListSuggestFocused && collectionListSuggestions.length > 0;

  const collectionsById = useMemo(
    () => new Map(collections.map((cItem) => [cItem.id, cItem])),
    [collections],
  );

  const descendantIdSet = useMemo(() => {
    if (hierarchySubtreeRootId == null) return null;
    return collectDescendantCollectionIds(hierarchySubtreeRootId, collections);
  }, [hierarchySubtreeRootId, collections]);

  const baseForDisplayedList = useMemo(() => {
    if (hierarchySubtreeRootId == null || descendantIdSet == null) return filteredByListSearch;
    const descendantsInFilter = filteredByListSearch.filter((cItem) => descendantIdSet.has(cItem.id));
    const rootInFilter = filteredByListSearch.find((cItem) => cItem.id === hierarchySubtreeRootId);
    if (!rootInFilter) return descendantsInFilter;
    const rest = descendantsInFilter.filter((cItem) => cItem.id !== hierarchySubtreeRootId);
    return [rootInFilter, ...rest];
  }, [filteredByListSearch, hierarchySubtreeRootId, descendantIdSet]);

  const searchNorm = hierarchySubtreeSearch.trim().toLowerCase();

  const afterSearchFilter = useMemo(() => {
    if (hierarchySubtreeRootId == null) return baseForDisplayedList;
    if (searchNorm === "") return baseForDisplayedList;
    const rootId = hierarchySubtreeRootId;
    const matched = baseForDisplayedList.filter((cItem) => cItem.nom.toLowerCase().includes(searchNorm));
    const root = baseForDisplayedList.find((cItem) => cItem.id === rootId);
    if (root != null && !matched.some((cItem) => cItem.id === rootId)) {
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
      (cItem) => cItem.id === hierarchySubtreeRootId || descendantIdSet.has(cItem.id),
    );
    const normalizedSearch = hierarchySubtreeSearch.trim().toLowerCase();
    return pool
      .map((cItem) => ({ id: cItem.id, nom: cItem.nom }))
      .filter((suggestion) =>
        normalizedSearch === "" ? true : suggestion.nom.toLowerCase().includes(normalizedSearch),
      )
      .slice(0, 12);
  }, [hierarchySubtreeRootId, descendantIdSet, filtered, hierarchySubtreeSearch]);

  const showHierarchySuggestPanel =
    hierarchySubtreeRootId != null && hierarchySuggestFocused && hierarchySearchSuggestions.length > 0;

  const getTreeDepth = useCallback(
    (collection: CollectionUi) => computeTreeDepth(collection, collectionsById),
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
    setHierarchySubtreeRootId((prevRoot) => {
      if (enabled) return collectionId;
      if (prevRoot === collectionId) return null;
      return prevRoot;
    });
  }, []);

  return {
    filters: {
      filter,
      setFilter,
      tagFilter,
      setTagFilter,
      tagFilterOptions,
    },
    playback: {
      playMode,
      setPlayMode,
      playQtype,
      setPlayQtype,
      playInfinite,
      setPlayInfinite,
    },
    hierarchyViews: {
      hierarchySubtreeRootId,
      hierarchySubtreeRootNom,
      hierarchySubtreeSearch,
      setHierarchySubtreeSearch,
      hierarchySuggestFocused,
      setHierarchySubtreeRootId,
      setHierarchySuggestFocused,
      hierarchySearchSuggestions,
      showHierarchySuggestPanel,
      clearHierarchySubtree,
      setHierarchyRootFromCard,
    },
    listSearch: {
      collectionListSearch,
      setCollectionListSearch,
      collectionListSuggestFocused,
      setCollectionListSuggestFocused,
      collectionListSuggestions,
      showCollectionListSuggestPanel,
    },
    display: {
      tagPickerPool,
      filtered: displayCollections,
      filteredSourceCount,
      autresCreateurs,
      getTreeDepth,
    },
  };
}
