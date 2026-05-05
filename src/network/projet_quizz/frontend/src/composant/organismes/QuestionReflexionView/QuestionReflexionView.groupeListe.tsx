import { Button } from "../../atomes/Button/Button";
import { CollectionGroupEditModal } from "../../molecules/CollectionGroupEditModal";
import { SOUS_COLLECTIONS_VIEW_STYLES } from "../SousCollectionsView/SousCollectionsView.styles";
import type { GroupeQuestionsUi } from "../../../types/quizz";
import { titreGroupeQuestion } from "./QuestionReflexionView.metier";

export type ReflexionGroupeListeSectionProps = {
  collectionNom: string | null;
  groupes: GroupeQuestionsUi[];
  selectedGroupeId: number | null;
  canEdit: boolean;
  createBusy: boolean;
  deleteBusy: boolean;
  canDeleteSelected: boolean;
  canEditSelected: boolean;
  createModalOpen: boolean;
  groupeFormMode: "create" | "edit";
  createNom: string;
  createDescription: string;
  onSelectGroupe: (id: number) => void;
  onOpenCreate: () => void;
  onOpenEdit: () => void;
  onCloseCreate: () => void;
  onChangeCreateNom: (v: string) => void;
  onChangeCreateDescription: (v: string) => void;
  onSubmitCreate: () => void;
  onDeleteSelected: () => void;
};

export function ReflexionGroupeListeSection(props: ReflexionGroupeListeSectionProps) {
  return (
    <div class="flex flex-col gap-3">
      <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class={SOUS_COLLECTIONS_VIEW_STYLES.panelTitle}>Suites logiques</p>
          {props.collectionNom != null ? (
            <p class="text-xs text-base-content/55">Collection · {props.collectionNom}</p>
          ) : null}
        </div>
        <div class="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:self-center">
          <Button
            variant="outline"
            class="btn-sm border-error/40 text-error hover:bg-error/10"
            disabled={!props.canEdit || !props.canDeleteSelected || props.createBusy || props.deleteBusy}
            onClick={props.onDeleteSelected}
          >
            {props.deleteBusy ? "…" : "Supprimer"}
          </Button>
          <Button
            variant="outline"
            class="btn-sm"
            disabled={!props.canEdit || !props.canEditSelected || props.createBusy || props.deleteBusy}
            onClick={props.onOpenEdit}
          >
            Modifier
          </Button>
          <Button variant="learn" class="btn-sm shrink-0" disabled={!props.canEdit} onClick={props.onOpenCreate}>
            Créer
          </Button>
        </div>
      </div>
      <div class={SOUS_COLLECTIONS_VIEW_STYLES.sousListRow}>
        {props.groupes.map((g) => (
          <button
            key={g.id}
            type="button"
            class={
              props.selectedGroupeId === g.id
                ? `${SOUS_COLLECTIONS_VIEW_STYLES.listBtnActive} max-w-[14rem]`
                : `${SOUS_COLLECTIONS_VIEW_STYLES.listBtn} max-w-[14rem]`
            }
            onClick={() => props.onSelectGroupe(g.id)}
          >
            <span class="truncate font-medium">{titreGroupeQuestion(g)}</span>
          </button>
        ))}
      </div>
      {props.groupes.length === 0 ? (
        <p class="mt-2 text-xs text-base-content/50">
          Aucune suite nommée. Crée-en une pour enregistrer un ordre de questions distinct ; sinon la première modification de chaîne en créera une par défaut.
        </p>
      ) : null}

      <CollectionGroupEditModal
        settings={{
          open: props.createModalOpen,
          title: props.groupeFormMode === "edit" ? "Modifier la suite logique" : "Nouvelle suite logique",
          nomInputId: "gq-create-nom",
          descriptionInputId: "gq-create-desc",
        }}
        data={{
          nom: props.createNom,
          description: props.createDescription,
        }}
        status={{ busy: props.createBusy }}
        actions={{
          onClose: props.onCloseCreate,
          onChangeNom: props.onChangeCreateNom,
          onChangeDescription: props.onChangeCreateDescription,
          onSubmit: props.onSubmitCreate,
        }}
      />
    </div>
  );
}
