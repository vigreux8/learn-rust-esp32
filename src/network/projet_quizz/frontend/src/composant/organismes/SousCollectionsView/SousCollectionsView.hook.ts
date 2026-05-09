import { useMemo } from "preact/hooks";
import { route as routeNavigate } from "preact-router";
import { useSousCollectionsData } from "./hooks/useSousCollectionsData";
import { useSousCollectionsSousInteractions } from "./hooks/useSousCollectionsSousInteractions";
import { normalizeCollectionIdParam } from "./SousCollectionsView.metier";
import type { SousCollectionsViewProps } from "./SousCollectionsView.types";

export function useSousCollectionsViewState(props: SousCollectionsViewProps) {
  const { route } = props;
  const collectionIdNum = useMemo(() => normalizeCollectionIdParam(route.collectionId), [route.collectionId]);

  const dataSlice = useSousCollectionsData({ routing: { collectionIdNum } });

  const interactions = useSousCollectionsSousInteractions({
    routing: { collectionIdNum },
    catalogue: {
      selectedSous: dataSlice.data.selectedSous,
      selectedSousId: dataSlice.data.selectedSousId,
      setSelectedSousId: dataSlice.data.setSelectedSousId,
    },
    core: dataSlice.internals,
  });

  return {
    routing: { collectionIdNum },
    status: dataSlice.status,
    data: {
      collectionNom: dataSlice.data.collectionNom,
      sousCollections: dataSlice.data.sousCollections,
      selectedSousId: dataSlice.data.selectedSousId,
      selectedSous: dataSlice.data.selectedSous,
      poolQuestions: dataSlice.data.poolQuestions,
      assignedQuestions: dataSlice.data.selectedSous?.questions ?? [],
    },
    liste: interactions.liste,
    filtres: {
      search: dataSlice.data.search,
      onSearchChange: dataSlice.data.onSearchChange,
    },
    dragDrop: interactions.dragDrop,
    reload: dataSlice.internals.reloadAll,
    navigation: {
      toCollections: () => routeNavigate("/collections"),
    },
  };
}
