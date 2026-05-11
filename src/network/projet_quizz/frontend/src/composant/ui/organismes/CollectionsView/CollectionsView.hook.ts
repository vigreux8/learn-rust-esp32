import type { PlayModeSettings } from "../../atomes/PlayModePicker/PlayModePicker.types";
import { useUserSession } from "../../../../lib/userSession";
import { deleteCollection } from "../../../../lib/api";
import { useCollectionsBootstrap } from "./hooks/useCollectionsBootstrap";
import { useCollectionsJsonImport } from "./hooks/useCollectionsJsonImport";
import { useCollectionsListingUi } from "./hooks/useCollectionsListingUi";
import { useCollectionsMutations } from "./hooks/useCollectionsMutations";
import type { CollectionFilter } from "./CollectionsView.types";
import { pendingDeleteLabels } from "./CollectionsView.metier";

/**
 * Orchestrateur liste des collections : bootstrap, filtres / affichage, mutations, import JSON et branchements UX
 * (navigation jouer, suppression différée).
 */
export function useCollectionsView() {
  const { userId } = useUserSession();

  const bootstrap = useCollectionsBootstrap({
    identity: { userId },
  });

  const jsonImportBloc = useCollectionsJsonImport({
    identity: { userId },
    integrations: {
      loadBootstrap: bootstrap.loaders.loadBootstrap,
      setCollections: bootstrap.data.setCollections,
      setPersonalitesPicker: bootstrap.data.setPersonalitesPicker,
      deleteCollection,
    },
  });

  const listing = useCollectionsListingUi({
    identity: { userId },
    data: { collections: bootstrap.data.collections },
  });

  const mutations = useCollectionsMutations({
    identity: { userId },
    data: {
      setCollections: bootstrap.data.setCollections,
      setPersonalitesPicker: bootstrap.data.setPersonalitesPicker,
    },
  });

  const labels = pendingDeleteLabels(mutations.confirmations.pendingDelete);

  const retry = {
    onRetryLoad: () => {
      bootstrap.loaders
        .loadBootstrap()
        .then(({ list, picker }) => {
          bootstrap.data.setCollections(list);
          bootstrap.data.setPersonalitesPicker(picker);
        })
        .catch(() => bootstrap.status.setError("fetch"));
    },
  };

  return {
    page: {
      loading: bootstrap.status.loading,
      error: bootstrap.status.error,
      userId,
    },
    header: {
      jsonImportOpen: jsonImportBloc.chrome.headerJsonImportOpen,
      jsonImportMode: jsonImportBloc.chrome.headerJsonImportMode,
      onOpenJsonImport: jsonImportBloc.chrome.onHeaderOpenFlowLearnImport,
    },
    jsonImport: {
      inputRef: jsonImportBloc.inputRef,
      open: jsonImportBloc.panel.open,
      mode: jsonImportBloc.panel.mode,
      categorie: jsonImportBloc.panel.categorie,
      busy: jsonImportBloc.panel.busy,
      text: jsonImportBloc.panel.text,
      error: jsonImportBloc.panel.error,
      message: jsonImportBloc.panel.message,
      onChangeCategorie: jsonImportBloc.panel.onChangeCategorie,
      onOpenFilePicker: jsonImportBloc.panel.onOpenFilePicker,
      onChangeText: jsonImportBloc.panel.onChangeText,
      onRun: jsonImportBloc.panel.onRun,
      onFileChange: jsonImportBloc.panel.onFileChange,
    },
    content: {
      tagPickerPool: listing.display.tagPickerPool,
      tagFilterOptions: listing.filters.tagFilterOptions,
      pendingDelete: mutations.confirmations.pendingDelete,
      assignBusyCollectionId: mutations.confirmations.assignBusyCollectionId,
      deleteCollectionBusyId: mutations.confirmations.deleteCollectionBusyId,
      newCollName: mutations.forms.newCollName,
      newCollTagId: mutations.forms.newCollTagId,
      createCollBusy: mutations.forms.createCollBusy,
      createCollError: mutations.forms.createCollError,
      onChangeNewCollName: mutations.actions.onChangeNewCollName,
      onChangeNewCollTagId: mutations.actions.onChangeNewCollTagId,
      onCreateCollection: () => void mutations.actions.onCreateCollection(),
      assignError: mutations.confirmations.assignError,
      deleteCollectionError: mutations.confirmations.deleteCollectionError,
      filter: listing.filters.filter,
      onChangeFilter: (filterKind: CollectionFilter) => listing.filters.setFilter(filterKind),
      autresCreateurs: listing.display.autresCreateurs,
      tagFilter: listing.filters.tagFilter,
      onChangeTagFilter: (tagValue: number | "all") => listing.filters.setTagFilter(tagValue),
      filtered: listing.display.filtered,
      filteredSourceCount: listing.display.filteredSourceCount,
      collectionListSearch: listing.listSearch.collectionListSearch,
      onCollectionListSearch: (searchValue: string) =>
        listing.listSearch.setCollectionListSearch(searchValue),
      collectionListSuggestions: listing.listSearch.collectionListSuggestions,
      showCollectionListSuggestPanel: listing.listSearch.showCollectionListSuggestPanel,
      onCollectionListSuggestFocus: () => listing.listSearch.setCollectionListSuggestFocused(true),
      onCollectionListSuggestBlur: () => {
        setTimeout(() => listing.listSearch.setCollectionListSuggestFocused(false), 150);
      },
      onPickCollectionListSuggestion: (nom: string) => {
        listing.listSearch.setCollectionListSearch(nom);
        listing.listSearch.setCollectionListSuggestFocused(false);
      },
      hierarchySubtreeRootId: listing.hierarchyViews.hierarchySubtreeRootId,
      hierarchySubtreeRootNom: listing.hierarchyViews.hierarchySubtreeRootNom,
      hierarchySubtreeSearch: listing.hierarchyViews.hierarchySubtreeSearch,
      onHierarchySubtreeSearch: (value: string) =>
        listing.hierarchyViews.setHierarchySubtreeSearch(value),
      hierarchySearchSuggestions: listing.hierarchyViews.hierarchySearchSuggestions,
      showHierarchySuggestPanel: listing.hierarchyViews.showHierarchySuggestPanel,
      onHierarchySuggestFocus: () => listing.hierarchyViews.setHierarchySuggestFocused(true),
      onHierarchySuggestBlur: () => {
        setTimeout(() => listing.hierarchyViews.setHierarchySuggestFocused(false), 150);
      },
      onPickHierarchySuggestion: (nom: string) => {
        listing.hierarchyViews.setHierarchySubtreeSearch(nom);
        listing.hierarchyViews.setHierarchySuggestFocused(false);
      },
      clearHierarchySubtree: listing.hierarchyViews.clearHierarchySubtree,
      setHierarchyRootFromCard: listing.hierarchyViews.setHierarchyRootFromCard,
      getTreeDepth: listing.display.getTreeDepth,
      userId,
      playMode: listing.playback.playMode,
      onPlayModeChange: (patch: Partial<PlayModeSettings>) =>
        listing.playback.setPlayMode((prev) => ({ ...prev, ...patch })),
      playQtype: listing.playback.playQtype,
      onPlayQtypeChange: listing.playback.setPlayQtype,
      playInfinite: listing.playback.playInfinite,
      onPlayInfiniteChange: listing.playback.setPlayInfinite,
      onAssignTag: mutations.actions.onAssignTag,
      onUnassignTag: mutations.actions.onUnassignTag,
      onRequestDeleteCollection: mutations.actions.onRequestDeleteCollection,
      newCollectionKind: mutations.forms.newCollectionKind,
      onChangeNewCollectionKind: mutations.actions.onChangeNewCollectionKind,
      personnaliteModalOpen: mutations.forms.personnaliteModalOpen,
      personnaliteModalBusy: mutations.forms.personnaliteModalBusy,
      personnaliteModalError: mutations.forms.personnaliteModalError,
      onOpenPersonnaliteModal: mutations.actions.onOpenPersonnaliteModal,
      onClosePersonnaliteModal: mutations.actions.onClosePersonnaliteModal,
      onSubmitPersonnaliteModal: mutations.actions.onSubmitPersonnaliteModal,
      personalitesPicker: bootstrap.data.personalitesPicker,
      assignPersoBusyCollectionId: mutations.confirmations.assignPersoBusyCollectionId,
      assignPersoError: mutations.confirmations.assignPersoError,
      onAssignPersoToCollection: mutations.actions.onAssignPersoToCollection,
      onUnassignPersoFromCollection: mutations.actions.onUnassignPersoFromCollection,
    },
    confirmPopup: {
      open: mutations.confirmations.pendingDelete != null,
      title: labels?.title ?? "",
      message: labels?.message ?? "",
      busy: mutations.confirmations.confirmBusy,
      onCancel: () => {
        if (!mutations.confirmations.confirmBusy) mutations.confirmations.dismissPendingDelete();
      },
      onConfirm: () => void mutations.confirmations.runConfirmedDelete(),
    },
    retry,
  };
}
