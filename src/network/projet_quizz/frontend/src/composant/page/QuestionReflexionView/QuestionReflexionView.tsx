import { DragDropProvider } from "@dnd-kit/react";
import { ArrowLeft, Plus } from "lucide-preact";
import { AppFooter } from "../../ui/atomes/AppFooter/AppFooter";
import { AppHeader } from "../../ui/atomes/AppHeader/AppHeader";
import { Button } from "../../ui/atomes/Button/Button";
import { PageMain } from "../../ui/atomes/PageMain/PageMain";
import { UnsavedChainLeaveModal } from "./parts/UnsavedChainLeaveModal";
import { QuestionEditModal } from "../../ui/organismes/QuestionEditModal/QuestionEditModal";
import { useQuestionReflexionViewState } from "./QuestionReflexionView.hook";
import { ReflexionDndWorkspace } from "./QuestionReflexionView.sections";
import { QUESTION_REFLEXION_VIEW_STYLES } from "./QuestionReflexionView.styles";
import type { QuestionReflexionRouterInject, QuestionReflexionViewProps } from "./QuestionReflexionView.types";

export function QuestionReflexionView(router: QuestionReflexionRouterInject) {
  const props: QuestionReflexionViewProps = { route: { collectionId: router.collectionId } };
  const collect = useQuestionReflexionViewState(props);
  const navigation = collect.navigation;
  const routing = collect.routing;
  const status = collect.status;
  const data = collect.data;
  const filtres = collect.filtres;
  const dragEnd = collect.dragDrop.onDragEnd;
  const chain = collect.chain;
  const actions = collect.actions;
  const liste = collect.liste;
  const llm = collect.llmImport;
  const editModal = collect.editModal;
  const unsavedLeave = collect.unsavedLeaveModal;

  const leaveModal = (
    <UnsavedChainLeaveModal
      open={unsavedLeave.open}
      saveBusy={unsavedLeave.saveBusy}
      discardBusy={unsavedLeave.discardBusy}
      onCancel={unsavedLeave.onCancel}
      onSave={unsavedLeave.onSave}
      onDiscard={unsavedLeave.onDiscard}
    />
  );

  const guardHeaderNavigation = (_href: string) => actions.confirmLeaveIfNeeded();

  if (routing.collectionIdNum == null) {
    return (
      <>
        <div class={QUESTION_REFLEXION_VIEW_STYLES.root}>
          <AppHeader beforeNavigate={guardHeaderNavigation} />
          <PageMain>
            {navigation.showBackToNode ? (
              <div class={QUESTION_REFLEXION_VIEW_STYLES.backToNodeRow}>
                <Button variant="ghost" class="btn-sm gap-2" type="button" onClick={navigation.onBackToNode}>
                  <ArrowLeft class="h-4 w-4 shrink-0" aria-hidden />
                  Retour au graphe
                </Button>
              </div>
            ) : null}
            <p class="text-base-content/70">Identifiant de collection invalide.</p>
            <Button variant="outline" class="mt-4 gap-2" onClick={() => actions.navigateAwayToCollections()}>
              <ArrowLeft class="h-4 w-4" aria-hidden />
              Retour aux collections
            </Button>
          </PageMain>
          <AppFooter />
        </div>
        {leaveModal}
      </>
    );
  }

  if (status.loading) {
    return (
      <>
        <div class={QUESTION_REFLEXION_VIEW_STYLES.root}>
          <AppHeader beforeNavigate={guardHeaderNavigation} />
          <PageMain>
            {navigation.showBackToNode ? (
              <div class={QUESTION_REFLEXION_VIEW_STYLES.backToNodeRow}>
                <Button variant="ghost" class="btn-sm gap-2" type="button" onClick={navigation.onBackToNode}>
                  <ArrowLeft class="h-4 w-4 shrink-0" aria-hidden />
                  Retour au graphe
                </Button>
              </div>
            ) : null}
            <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 class={QUESTION_REFLEXION_VIEW_STYLES.pageTitle}>Suite logique</h1>
              <Button variant="outline" class="gap-2 self-start" onClick={() => actions.navigateAwayToCollections()}>
                <ArrowLeft class="h-4 w-4" aria-hidden />
                Collections
              </Button>
            </div>
            <div class="flex justify-center py-16">
              <span class="loading loading-spinner loading-lg text-learn" aria-label="Chargement" />
            </div>
          </PageMain>
          <AppFooter />
        </div>
        {leaveModal}
      </>
    );
  }

  if (status.loadError != null) {
    return (
      <>
        <div class={QUESTION_REFLEXION_VIEW_STYLES.root}>
          <AppHeader beforeNavigate={guardHeaderNavigation} />
          <PageMain>
            {navigation.showBackToNode ? (
              <div class={QUESTION_REFLEXION_VIEW_STYLES.backToNodeRow}>
                <Button variant="ghost" class="btn-sm gap-2" type="button" onClick={navigation.onBackToNode}>
                  <ArrowLeft class="h-4 w-4 shrink-0" aria-hidden />
                  Retour au graphe
                </Button>
              </div>
            ) : null}
            <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 class={QUESTION_REFLEXION_VIEW_STYLES.pageTitle}>Suite logique</h1>
              <Button variant="outline" class="gap-2 self-start" onClick={() => actions.navigateAwayToCollections()}>
                <ArrowLeft class="h-4 w-4" aria-hidden />
                Collections
              </Button>
            </div>
            <div class="rounded-2xl border border-error/30 bg-error/10 p-6 text-sm text-error">
              <p>{status.loadError === "invalid" ? "Paramètre d’URL invalide." : "Impossible de charger les données."}</p>
              {status.loadError !== "invalid" ? (
                <Button variant="outline" class="mt-4" onClick={actions.reload}>
                  Réessayer
                </Button>
              ) : null}
            </div>
          </PageMain>
          <AppFooter />
        </div>
        {leaveModal}
      </>
    );
  }

  const poolDraggableDisabled = !status.isOwner || status.chainBusy;
  const poolDroppableDisabled = !status.isOwner;
  const orderedDraggableDisabled = !status.isOwner || status.chainBusy;
  const orderedDroppableDisabled = !status.isOwner;

  return (
    <>
      <div class={QUESTION_REFLEXION_VIEW_STYLES.root}>
        <AppHeader beforeNavigate={guardHeaderNavigation} />
        <PageMain>
          {navigation.showBackToNode ? (
            <div class={QUESTION_REFLEXION_VIEW_STYLES.backToNodeRow}>
              <Button variant="ghost" class="btn-sm gap-2" type="button" onClick={navigation.onBackToNode}>
                <ArrowLeft class="h-4 w-4 shrink-0" aria-hidden />
                Retour au graphe
              </Button>
            </div>
          ) : null}
          <div class={QUESTION_REFLEXION_VIEW_STYLES.pageContentOuter}>
          <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0 flex-1">
            <h1 class={QUESTION_REFLEXION_VIEW_STYLES.pageTitle}>Suite logique</h1>
            <p class="mt-1 text-sm text-base-content/60">Construis une chaîne de questions dans un ordre fixe pour le jeu.</p>
          </div>
          <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {status.isOwner ? (
              <Button
                variant="flow"
                class="btn-sm gap-1 self-start"
                disabled={actions.createQuestionDisabled}
                title={
                  actions.createQuestionDisabled
                    ? "Référence des catégories indisponible"
                    : "Créer une question (formulaire comme dans la session quiz)"
                }
                type="button"
                onClick={() => actions.openCreateQuestion()}
              >
                <Plus class="h-4 w-4" aria-hidden />
                Créer une question
              </Button>
            ) : null}
            <Button variant="outline" class="gap-2 self-start" onClick={() => actions.navigateAwayToCollections()}>
              <ArrowLeft class="h-4 w-4" aria-hidden />
              Collections
            </Button>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          {status.operationError != null ? (
            <div class="flex items-start justify-between gap-3 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-base-content">
              <p>{status.operationError}</p>
              <button type="button" class="btn btn-ghost btn-xs shrink-0" onClick={status.dismissOperationError}>
                Fermer
              </button>
            </div>
          ) : null}
          {!status.isOwner ? (
            <p class="rounded-2xl border border-base-content/15 bg-base-100/80 px-4 py-3 text-sm text-base-content/75">
              Tu consultes une collection qui ne t’appartient pas : le glisser-déposer et l’édition sont désactivés.
            </p>
          ) : null}

          <DragDropProvider onDragEnd={dragEnd}>
            <ReflexionDndWorkspace
              paletteRailDisabled={orderedDraggableDisabled}
              saveAction={
                status.isOwner
                  ? {
                      disabled: !status.chainDirty || status.chainBusy,
                      busy: status.chainBusy,
                      onSave: () => void actions.saveChainDraft(),
                    }
                  : undefined
              }
              liste={{
                    collectionNom: data.collectionNom,
                    groupes: data.groupes,
                    selectedGroupeId: data.selectedGroupeId,
                    canEdit: status.isOwner,
                    createModalOpen: liste.createModalOpen,
                    groupeFormMode: liste.groupeFormMode,
                    createNom: liste.createNom,
                    createDescription: liste.createDescription,
                    createBusy: liste.createBusy,
                    deleteBusy: liste.deleteBusy,
                    canDeleteSelected: liste.canDeleteSelected,
                    canEditSelected: liste.canEditSelected,
                    onSelectGroupe: liste.onSelectGroupe,
                    onOpenCreate: liste.onOpenCreate,
                    onOpenEdit: liste.onOpenEdit,
                    onCloseCreate: liste.onCloseCreate,
                    onChangeCreateNom: liste.onChangeCreateNom,
                    onChangeCreateDescription: liste.onChangeCreateDescription,
                    onSubmitCreate: liste.onSubmitCreate,
                    onDeleteSelected: liste.onDeleteSelected,
                  }}
                  band={{
                    collectionNom: null,
                    llmImport: llm,
                  }}
                  pool={{
                    search: data.search,
                    onSearchChange: filtres.onSearchChange,
                    poolQuestions: data.poolQuestions,
                    poolDraggableDisabled,
                    poolDroppableDisabled,
                  }}
                  ordered={{
                    orderedQuestions: data.orderedQuestions,
                    chainColorLevels: data.chainColorLevels,
                    orderedDraggableDisabled,
                    orderedDroppableDisabled,
                    chainBusy: status.chainBusy,
                    deleteBusyId: status.deleteBusyId,
                    canEdit: status.isOwner,
                    onMoveUp: (index) => chain.onMoveOrdered(index, -1),
                    onMoveDown: (index) => chain.onMoveOrdered(index, 1),
                    onEdit: actions.openEditModal,
                  onDelete: actions.removeQuestion,
                }}
              />
          </DragDropProvider>
        </div>

        <QuestionEditModal
          settings={editModal.settings}
          actions={editModal.actions}
          status={editModal.status}
          data={editModal.data}
          drafts={editModal.drafts}
        />
          </div>
      </PageMain>
      <AppFooter />
    </div>
      {leaveModal}
    </>
  );
}
