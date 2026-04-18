import { DragDropProvider } from "@dnd-kit/react";
import { ArrowLeft } from "lucide-preact";
import { route } from "preact-router";
import { AppFooter } from "../../atomes/AppFooter/AppFooter";
import { AppHeader } from "../../atomes/AppHeader/AppHeader";
import { Button } from "../../atomes/Button/Button";
import { PageMain } from "../../atomes/PageMain/PageMain";
import { useSousCollectionsViewState } from "./SousCollectionsView.hook";
import { SousCollectionsDndWorkspace } from "./SousCollectionsView.sections";
import { SOUS_COLLECTIONS_VIEW_STYLES } from "./SousCollectionsView.styles";
import type { SousCollectionsViewProps } from "./SousCollectionsView.types";

export function SousCollectionsView(props: SousCollectionsViewProps) {
  const collect = useSousCollectionsViewState(props);
  const routing = collect.routing;
  const status = collect.status;
  const liste = collect.liste;
  const filtres = collect.filtres;
  const data = collect.data;
  const dragEnd = collect.dragDrop.onDragEnd;

  if (routing.collectionIdNum == null) {
    return (
      <div class={SOUS_COLLECTIONS_VIEW_STYLES.root}>
        <AppHeader />
        <PageMain>
          <p class="text-base-content/70">Identifiant de collection invalide.</p>
          <Button variant="outline" class="mt-4 gap-2" onClick={() => route("/collections")}>
            <ArrowLeft class="h-4 w-4" aria-hidden />
            Retour aux collections
          </Button>
        </PageMain>
        <AppFooter />
      </div>
    );
  }

  if (status.loading) {
    return (
      <div class={SOUS_COLLECTIONS_VIEW_STYLES.root}>
        <AppHeader />
        <PageMain>
          <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 class={SOUS_COLLECTIONS_VIEW_STYLES.pageTitle}>Sous-collections</h1>
            <Button variant="outline" class="gap-2 self-start" onClick={() => route("/collections")}>
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
    );
  }

  if (status.loadError != null) {
    return (
      <div class={SOUS_COLLECTIONS_VIEW_STYLES.root}>
        <AppHeader />
        <PageMain>
          <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 class={SOUS_COLLECTIONS_VIEW_STYLES.pageTitle}>Sous-collections</h1>
            <Button variant="outline" class="gap-2 self-start" onClick={() => route("/collections")}>
              <ArrowLeft class="h-4 w-4" aria-hidden />
              Collections
            </Button>
          </div>
          <div class="rounded-2xl border border-error/30 bg-error/10 p-6 text-sm text-error">
            <p>{status.loadError === "invalid" ? "Paramètre d’URL invalide." : "Impossible de charger les données."}</p>
            {status.loadError !== "invalid" ? (
              <Button variant="outline" class="mt-4" onClick={collect.reload}>
                Réessayer
              </Button>
            ) : null}
          </div>
        </PageMain>
        <AppFooter />
      </div>
    );
  }

  const poolDraggableDisabled = !status.isOwner || data.selectedSousId == null;
  const poolDroppableDisabled = !status.isOwner;
  const assignedDraggableDisabled = !status.isOwner;
  const sousDroppableDisabled = !status.isOwner || data.selectedSousId == null;

  return (
    <div class={SOUS_COLLECTIONS_VIEW_STYLES.root}>
      <AppHeader />
      <PageMain>
        <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class={SOUS_COLLECTIONS_VIEW_STYLES.pageTitle}>Sous-collections</h1>
            <p class="mt-1 text-sm text-base-content/60">Répartis les questions de la collection en sections thématiques.</p>
          </div>
          <Button variant="outline" class="gap-2 self-start" onClick={() => route("/collections")}>
            <ArrowLeft class="h-4 w-4" aria-hidden />
            Collections
          </Button>
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
              Tu consultes une collection qui ne t’appartient pas : le glisser-déposer et la création de sous-collections sont désactivés.
            </p>
          ) : null}

          <DragDropProvider onDragEnd={dragEnd}>
            <SousCollectionsDndWorkspace
              liste={{
                collectionNom: data.collectionNom,
                canEdit: status.isOwner,
                sousCollections: data.sousCollections,
                selectedSousId: data.selectedSousId,
                createModalOpen: liste.createModalOpen,
                sousFormMode: liste.sousFormMode,
                createNom: liste.createNom,
                createDescription: liste.createDescription,
                createBusy: liste.createBusy,
                deleteBusy: liste.deleteBusy,
                canDeleteSelected: liste.canDeleteSelected,
                canEditSelected: liste.canEditSelected,
                onSelectSous: liste.onSelectSous,
                onOpenCreate: liste.onOpenCreate,
                onOpenEdit: liste.onOpenEdit,
                onCloseCreate: liste.onCloseCreate,
                onChangeCreateNom: liste.onChangeCreateNom,
                onChangeCreateDescription: liste.onChangeCreateDescription,
                onSubmitCreate: liste.onSubmitCreate,
                onDeleteSelected: liste.onDeleteSelected,
                llmImport:
                  status.isOwner && routing.collectionIdNum != null && data.selectedSous != null
                    ? {
                        data: {
                          collectionId: routing.collectionIdNum,
                          sousCollectionId: data.selectedSous.id,
                          collectionNom: data.collectionNom,
                          selectedSous: data.selectedSous,
                          assignedQuestions: data.selectedSous.questions,
                          disabled: false,
                        },
                        actions: { onImportSuccess: collect.reload },
                      }
                    : undefined,
              }}
              questions={{
                search: filtres.search,
                onSearchChange: filtres.onSearchChange,
                poolQuestions: data.poolQuestions,
                poolDraggableDisabled,
                poolDroppableDisabled,
              }}
              assigned={{
                selectedSous: data.selectedSous,
                assignedQuestions: data.assignedQuestions,
                assignedDraggableDisabled,
                sousDroppableDisabled,
              }}
            />
          </DragDropProvider>
        </div>
      </PageMain>
      <AppFooter />
    </div>
  );
}
