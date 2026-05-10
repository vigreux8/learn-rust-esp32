import { useCallback, useRef, useState } from "preact/hooks";
import { useQuestionReflexionBootstrap } from "./hooks/useQuestionReflexionBootstrap";
import { useQuestionReflexionChainDraft } from "./hooks/useQuestionReflexionChainDraft";
import { useQuestionReflexionGroupeListe } from "./hooks/useQuestionReflexionGroupeListe";
import { useQuestionReflexionLeaveGuard } from "./hooks/useQuestionReflexionLeaveGuard";
import { useQuestionReflexionQuestionEdit } from "./hooks/useQuestionReflexionQuestionEdit";
import type { QuestionReflexionViewProps } from "./QuestionReflexionView.types";

export function useQuestionReflexionViewState(props: QuestionReflexionViewProps) {
  const chainFlushRef = useRef<((cid: number, gid: number | null) => Promise<void>) | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const confirmLeaveRef = useRef<() => Promise<boolean>>(() => Promise.resolve(true));

  const bootstrap = useQuestionReflexionBootstrap({
    route: props.route,
    chainFlush: chainFlushRef,
  });

  const chain = useQuestionReflexionChainDraft({
    bootstrap,
    chainFlush: chainFlushRef,
    status: { setOperationError },
    integrations: { getConfirmLeave: () => confirmLeaveRef.current() },
  });

  const leave = useQuestionReflexionLeaveGuard({
    chain: {
      chainDirtyRef: chain.chainDirtyRef,
      saveChainDraft: chain.saveChainDraft,
      loadChainFor: chain.loadChainFor,
      chainBusy: chain.chainBusy,
    },
    routing: {
      collectionIdNum: bootstrap.routing.collectionIdNum,
      selectedGroupeIdRef: bootstrap.data.selectedGroupeIdRef,
    },
  });

  confirmLeaveRef.current = leave.confirmLeaveIfNeeded;

  const groupe = useQuestionReflexionGroupeListe({
    bootstrap,
    status: { setOperationError },
    integrations: {
      loadChainFor: chain.loadChainFor,
      reloadGroupesOnly: chain.reloadGroupesOnly,
    },
  });

  const questionEdit = useQuestionReflexionQuestionEdit({
    routing: { collectionIdNum: chain.routing.collectionIdNum },
    data: {
      collection: bootstrap.data.collection,
      setCollection: bootstrap.data.setCollection,
    },
    refs: {
      localPoolDraftsRef: chain.localPoolDraftsRef,
      chainDirtyRef: chain.chainDirtyRef,
      selectedGroupeIdRef: bootstrap.data.selectedGroupeIdRef,
    },
    chain: {
      setOrdered: chain.setOrdered,
      setPool: chain.setPool,
      setLocalPoolDrafts: chain.setLocalPoolDrafts,
      loadChainFor: chain.loadChainFor,
    },
    refCategories: chain.refCategories,
    categoryTypeForId: chain.categoryTypeForId,
    status: { setOperationError },
  });

  const removeQuestion = useCallback(
    async (id: number) => {
      await chain.removeQuestionFromChain(id);
      if (questionEdit.editDetail?.id === id) {
        questionEdit.closeQuestionModal();
      }
    },
    [chain, questionEdit],
  );

  return {
    routing: chain.routing,
    status: {
      loading: chain.loading,
      loadError: chain.loadError,
      operationError,
      dismissOperationError: chain.dismissOperationError,
      isOwner: groupe.derived.isOwner,
      chainBusy: chain.chainBusy,
      chainDirty: chain.chainDirty,
      chainSaveBlockedByDrafts: chain.chainSaveBlockedByDrafts,
      deleteBusyId: chain.deleteBusyId,
    },
    data: {
      collectionNom: chain.collectionNom,
      orderedQuestions: chain.orderedQuestions,
      chainColorLevels: chain.chainColorLevels,
      poolQuestions: chain.poolQuestions,
      search: chain.search,
      refCategories: chain.refCategories,
      groupes: chain.groupes,
      selectedGroupeId: chain.selectedGroupeId,
    },
    liste: {
      onSelectGroupe: chain.onSelectGroupe,
      createModalOpen: groupe.modal.createModalOpen,
      groupeFormMode: groupe.modal.groupeFormMode,
      createNom: groupe.modal.createNom,
      createDescription: groupe.modal.createDescription,
      createBusy: groupe.modal.createBusy,
      deleteBusy: groupe.modal.deleteGroupeBusy,
      canDeleteSelected: groupe.derived.isOwner && groupe.derived.selectedGroupeId != null,
      canEditSelected: groupe.derived.isOwner && groupe.derived.selectedGroupeId != null,
      onOpenCreate: groupe.modal.onOpenCreate,
      onOpenEdit: groupe.modal.onOpenEdit,
      onCloseCreate: groupe.modal.onCloseCreate,
      onChangeCreateNom: groupe.modal.onChangeCreateNom,
      onChangeCreateDescription: groupe.modal.onChangeCreateDescription,
      onSubmitCreate: groupe.modal.onSubmitCreate,
      onDeleteSelected: groupe.modal.onDeleteSelected,
    },
    filtres: {
      onSearchChange: chain.setSearch,
    },
    dragDrop: {
      onDragEnd: chain.onDragEnd,
    },
    chain: {
      onMoveOrdered: chain.moveOrdered,
    },
    actions: {
      reload: chain.reloadAll,
      openEditModal: questionEdit.openEditModal,
      removeQuestion,
      saveChainDraft: chain.saveChainDraft,
      confirmLeaveIfNeeded: leave.confirmLeaveIfNeeded,
      navigateAwayToCollections: chain.navigateAwayToCollections,
    },
    unsavedLeaveModal: leave.unsavedLeaveModal,
    llmImport:
      groupe.derived.isOwner && chain.routing.collectionIdNum != null
        ? {
            data: {
              collectionId: chain.routing.collectionIdNum,
              collectionNom: chain.collectionNom,
              poolQuestions: chain.llmPromptPoolStems,
              disabled: chain.chainBusy,
            },
            actions: {
              onImportLocalPayload: chain.ingestLlmImportLocally,
            },
          }
        : undefined,
    editModal: questionEdit.editModal,
  };
}
