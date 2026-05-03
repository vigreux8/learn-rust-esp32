import { useDraggable, useDroppable } from "@dnd-kit/react";
import { GripVertical } from "lucide-preact";
import { Button } from "../../atomes/Button/Button";
import { SousCollectionLlmImportWidget } from "../../molecules/SousCollectionLlmImportWidget";
import { SOUS_COLLECTIONS_VIEW_STYLES } from "./SousCollectionsView.styles";
import type {
  SousCollectionsAssignedPanelProps,
  SousCollectionsDndPayload,
  SousCollectionsListeSectionProps,
  SousCollectionsQuestionsPanelProps,
} from "./SousCollectionsView.types";
import type { QuizzQuestionRow, SousCollectionUi } from "../../../types/quizz";

function PoolQuestionDraggable({
  row,
  disabled,
}: {
  row: QuizzQuestionRow;
  disabled: boolean;
}) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: `pool-q-${row.id}`,
    disabled,
    data: { from: "pool", questionId: row.id } satisfies SousCollectionsDndPayload,
  });
  return (
    <div
      ref={ref}
      class={SOUS_COLLECTIONS_VIEW_STYLES.questionRow}
      style={{ opacity: isDragging ? 0.45 : 1 }}
    >
      <span
        ref={handleRef}
        class="mt-0.5 text-base-content/40"
        aria-label="Déplacer la question (glisser-déposer)"
      >
        <GripVertical class="h-4 w-4" aria-hidden />
      </span>
      <div class="min-w-0 flex-1">
        <span class={SOUS_COLLECTIONS_VIEW_STYLES.badge}>{row.categorie_type}</span>
        <p class="mt-1 line-clamp-3 text-base-content/90">{row.question}</p>
      </div>
    </div>
  );
}

function AssignedQuestionDraggable({
  item,
  disabled,
}: {
  item: SousCollectionUi["questions"][number];
  disabled: boolean;
}) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: `assigned-q-${item.question_id}`,
    disabled,
    data: { from: "assigned", questionId: item.question_id } satisfies SousCollectionsDndPayload,
  });
  return (
    <div
      ref={ref}
      class={SOUS_COLLECTIONS_VIEW_STYLES.questionRow}
      style={{ opacity: isDragging ? 0.45 : 1 }}
    >
      <span
        ref={handleRef}
        class="mt-0.5 text-base-content/40"
        aria-label="Déplacer la question (glisser-déposer)"
      >
        <GripVertical class="h-4 w-4" aria-hidden />
      </span>
      <div class="min-w-0 flex-1">
        <span class={SOUS_COLLECTIONS_VIEW_STYLES.badge}>{item.categorie_type}</span>
        <p class="mt-1 line-clamp-3 text-base-content/90">{item.question}</p>
      </div>
    </div>
  );
}

export function SousCollectionsListeSection(props: SousCollectionsListeSectionProps) {
  return (
    <div class="flex flex-col gap-3">
      <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class={SOUS_COLLECTIONS_VIEW_STYLES.panelTitle}>Sous-collections</p>
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
        {props.sousCollections.map((s) => (
          <button
            key={s.id}
            type="button"
            class={
              props.selectedSousId === s.id
                ? `${SOUS_COLLECTIONS_VIEW_STYLES.listBtnActive} max-w-[14rem]`
                : `${SOUS_COLLECTIONS_VIEW_STYLES.listBtn} max-w-[14rem]`
            }
            onClick={() => props.onSelectSous(s.id)}
          >
            <span class="truncate font-medium">{s.nom}</span>
          </button>
        ))}
      </div>
      {props.sousCollections.length === 0 ? (
        <p class="mt-2 text-xs text-base-content/50">Aucune sous-collection. Crée-en une pour répartir les questions.</p>
      ) : null}

      {props.llmImport != null ? <SousCollectionLlmImportWidget {...props.llmImport} /> : null}

      {props.createModalOpen ? (
        <dialog class="modal modal-open z-50" open>
          <div class="modal-box rounded-2xl border border-base-content/10" onClick={(e) => e.stopPropagation()}>
            <h3 class="text-lg font-bold">
              {props.sousFormMode === "edit" ? "Modifier la sous-collection" : "Nouvelle sous-collection"}
            </h3>
            <label class="label mt-2" for="sc-create-nom">
              <span class="label-text">Nom</span>
            </label>
            <input
              id="sc-create-nom"
              class="input input-bordered w-full rounded-xl border-base-content/15"
              value={props.createNom}
              disabled={props.createBusy}
              onInput={(e) => props.onChangeCreateNom((e.target as HTMLInputElement).value)}
            />
            <label class="label mt-2" for="sc-create-desc">
              <span class="label-text">Description</span>
            </label>
            <textarea
              id="sc-create-desc"
              class="textarea textarea-bordered w-full rounded-xl border-base-content/15"
              rows={3}
              value={props.createDescription}
              disabled={props.createBusy}
              onInput={(e) => props.onChangeCreateDescription((e.target as HTMLTextAreaElement).value)}
            />
            <div class="modal-action">
              <button type="button" class="btn btn-ghost rounded-xl" disabled={props.createBusy} onClick={props.onCloseCreate}>
                Annuler
              </button>
              <Button variant="flow" disabled={props.createBusy || props.createNom.trim() === ""} onClick={props.onSubmitCreate}>
                {props.createBusy ? "…" : "Enregistrer"}
              </Button>
            </div>
          </div>
          <div class="modal-backdrop bg-base-content/40" role="presentation" onClick={props.onCloseCreate} />
        </dialog>
      ) : null}
    </div>
  );
}

export function SousCollectionsQuestionsColumn(props: SousCollectionsQuestionsPanelProps) {
  return (
    <div class={SOUS_COLLECTIONS_VIEW_STYLES.panel}>
      <p class={SOUS_COLLECTIONS_VIEW_STYLES.panelTitle}>Questions de la collection</p>
      <input
        type="search"
        class={SOUS_COLLECTIONS_VIEW_STYLES.searchInput}
        placeholder="Rechercher dans le texte ou le commentaire…"
        value={props.search}
        onInput={(e) => props.onSearchChange((e.target as HTMLInputElement).value)}
      />
      <div
        ref={props.poolDroppableRef}
        class={props.isPoolDropTarget ? SOUS_COLLECTIONS_VIEW_STYLES.dropZoneActive : SOUS_COLLECTIONS_VIEW_STYLES.dropZone}
      >
        <p class="mb-2 text-xs text-base-content/50">Glisse une question ici pour la retirer de la sous-collection sélectionnée.</p>
        <div class="max-h-[min(28rem,55vh)] space-y-2 overflow-y-auto pr-1">
          {props.poolQuestions.map((q) => (
            <PoolQuestionDraggable key={q.id} row={q} disabled={props.poolDraggableDisabled} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SousCollectionsAssignedColumn(props: SousCollectionsAssignedPanelProps) {
  const empty = props.selectedSous == null;
  return (
    <div class={SOUS_COLLECTIONS_VIEW_STYLES.panel}>
      <p class={SOUS_COLLECTIONS_VIEW_STYLES.panelTitle}>Questions de la sous-collection</p>
      {empty ? (
        <p class="text-sm text-base-content/55">Sélectionne une sous-collection à gauche.</p>
      ) : (
        <p class="mb-2 text-xs text-base-content/55">{props.selectedSous != null ? props.selectedSous.description : ""}</p>
      )}
      <div
        ref={props.sousDroppableRef}
        class={props.isSousDropTarget ? SOUS_COLLECTIONS_VIEW_STYLES.dropZoneActive : SOUS_COLLECTIONS_VIEW_STYLES.dropZone}
      >
        <p class="mb-2 text-xs text-base-content/50">
          {empty ? "Zone de dépôt indisponible sans sélection." : "Glisse des questions depuis la colonne centrale."}
        </p>
        <div class="max-h-[min(28rem,55vh)] space-y-2 overflow-y-auto pr-1">
          {props.assignedQuestions.map((q) => (
            <AssignedQuestionDraggable key={q.relation_id} item={q} disabled={props.assignedDraggableDisabled} />
          ))}
        </div>
      </div>
    </div>
  );
}

export type SousCollectionsDndWorkspaceProps = {
  liste: SousCollectionsListeSectionProps;
  questions: Omit<SousCollectionsQuestionsPanelProps, "poolDroppableRef" | "isPoolDropTarget"> & {
    poolDroppableDisabled: boolean;
  };
  assigned: Omit<SousCollectionsAssignedPanelProps, "sousDroppableRef" | "isSousDropTarget"> & {
    sousDroppableDisabled: boolean;
  };
};

export function SousCollectionsDndWorkspace(props: SousCollectionsDndWorkspaceProps) {
  const poolDrop = useDroppable({
    id: "drop-pool",
    data: { zone: "pool" },
    disabled: props.questions.poolDroppableDisabled,
  });
  const sousDrop = useDroppable({
    id: "drop-sous",
    data: { zone: "sous" },
    disabled: props.assigned.sousDroppableDisabled,
  });

  return (
    <div class={SOUS_COLLECTIONS_VIEW_STYLES.pageStack}>
      <div class={SOUS_COLLECTIONS_VIEW_STYLES.topBand}>
        <SousCollectionsListeSection {...props.liste} />
      </div>
      <div class={SOUS_COLLECTIONS_VIEW_STYLES.bottomGrid}>
        <SousCollectionsQuestionsColumn
          search={props.questions.search}
          onSearchChange={props.questions.onSearchChange}
          poolQuestions={props.questions.poolQuestions}
          poolDroppableRef={poolDrop.ref}
          isPoolDropTarget={poolDrop.isDropTarget}
          poolDraggableDisabled={props.questions.poolDraggableDisabled}
        />
        <SousCollectionsAssignedColumn
          selectedSous={props.assigned.selectedSous}
          assignedQuestions={props.assigned.assignedQuestions}
          sousDroppableRef={sousDrop.ref}
          isSousDropTarget={sousDrop.isDropTarget}
          assignedDraggableDisabled={props.assigned.assignedDraggableDisabled}
        />
      </div>
    </div>
  );
}
