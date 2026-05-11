import { Fragment } from "preact";
import { useDroppable } from "@dnd-kit/react";
import type { CollectionReflexionLlmImportWidgetProps } from "./parts/CollectionReflexionLlmImportWidget/CollectionReflexionLlmImportWidget.types";
import { CollectionReflexionLlmImportWidget } from "./parts/CollectionReflexionLlmImportWidget";
import { QUIZZ_DND_PANEL_STYLES } from "../../ui/molecules/QuizzDndQuestionPanels/QuizzDndQuestionPanels.styles";
import { QuizzQuestionDndRow } from "../../ui/molecules/QuizzQuestionDndRow";
import { ReflexionGroupeListeSection } from "./QuestionReflexionView.groupeListe";
import type { ReflexionGroupeListeSectionProps } from "./QuestionReflexionView.groupeListe";
import { QUESTION_REFLEXION_VIEW_STYLES } from "./QuestionReflexionView.styles";
import type { QuizzQuestionRow } from "../../../types/quizz";
import { cn } from "../../../lib/cn";
import { COLLECTION_TREE_LEVEL_BORDER_HEX } from "../../../lib/collectionHierarchyVis";
import { REFLEXION_ORDERED_INSERT_PREFIX, REFLEXION_ORDERED_SORT_GROUP } from "./QuestionReflexionView.metier";
import { ReflexionPaletteRail } from "./QuestionReflexionView.palette";
import { Button } from "../../ui/atomes/Button/Button";

export type ReflexionDndPayload = {
  from: "pool" | "ordered";
  questionId: number;
};

export type ReflexionTopBandProps = {
  collectionNom: string | null;
  llmImport?: CollectionReflexionLlmImportWidgetProps;
};

export function ReflexionTopBand(props: ReflexionTopBandProps) {
  return (
    <div class={QUESTION_REFLEXION_VIEW_STYLES.topBand}>
      <div class="mb-3 flex flex-col gap-1">
        <p class={QUESTION_REFLEXION_VIEW_STYLES.pageTitle}>Suite logique (réflexion)</p>
        <p class="text-sm text-base-content/60">
          Glisse les questions pour construire l’ordre de jeu : la bonne réponse mène à la suivante.
        </p>
        {props.collectionNom != null ? (
          <p class="text-xs text-base-content/55">Collection · {props.collectionNom}</p>
        ) : null}
      </div>
      {props.llmImport != null ? <CollectionReflexionLlmImportWidget {...props.llmImport} /> : null}
    </div>
  );
}

export type ReflexionPoolColumnProps = {
  search: string;
  onSearchChange: (v: string) => void;
  poolQuestions: QuizzQuestionRow[];
  poolDraggableDisabled: boolean;
  poolDroppableDisabled: boolean;
};

export function ReflexionPoolColumn(props: ReflexionPoolColumnProps) {
  const poolDrop = useDroppable({
    id: "drop-pool",
    data: { zone: "pool" },
    disabled: props.poolDroppableDisabled,
  });

  return (
    <div class={QUIZZ_DND_PANEL_STYLES.panel}>
      <p class={QUIZZ_DND_PANEL_STYLES.panelTitle}>Questions brouillon</p>
      <input
        type="search"
        class={QUIZZ_DND_PANEL_STYLES.searchInput}
        placeholder="Rechercher dans le texte ou le commentaire…"
        value={props.search}
        onInput={(e) => props.onSearchChange((e.target as HTMLInputElement).value)}
      />
      <div
        ref={poolDrop.ref}
        class={poolDrop.isDropTarget ? QUIZZ_DND_PANEL_STYLES.dropZoneActive : QUIZZ_DND_PANEL_STYLES.dropZone}
      >
        <p class="mb-2 text-xs text-base-content/50">
          Brouillon local : l’import LLM remplit cette zone sans écrire en base. Glisse vers la droite pour composer la
          suite ordonnée (sans créer de ligne en base ici). Une question déjà en collection réapparaît ici si tu la fais
          glisser depuis la suite vers cette colonne. À l’enregistrement, seules les questions réelles sont persistées ;
          les brouillons restent locaux et seront perdus en quittant la page.
        </p>
        <div class="max-h-[min(28rem,55vh)] space-y-2 overflow-y-auto pr-1">
          {props.poolQuestions.map((q) => (
            <QuizzQuestionDndRow
              key={q.id}
              data={{ row: q }}
              dnd={{
                draggableId: `pool-q-${q.id}`,
                disabled: props.poolDraggableDisabled,
                payload: { from: "pool", questionId: q.id } satisfies ReflexionDndPayload,
              }}
              settings={{ dragActivation: "fullCard" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ReflexionOrderedInsertGap(props: { index: number; disabled: boolean }) {
  const drop = useDroppable({
    id: `${REFLEXION_ORDERED_INSERT_PREFIX}${props.index}`,
    data: { zone: "ordered-insert", insertIndex: props.index },
    disabled: props.disabled,
  });

  return (
    <div
      ref={drop.ref}
      class={
        drop.isDropTarget
          ? "relative z-1 -my-0.5 h-4 shrink-0 rounded-md bg-learn/25 ring-1 ring-learn/40 transition-colors"
          : "-my-0.5 h-2 shrink-0 rounded-md transition-colors hover:bg-base-content/10"
      }
      title="Insérer ici"
      aria-hidden
    />
  );
}

export type ReflexionOrderedColumnProps = {
  orderedQuestions: QuizzQuestionRow[];
  chainColorLevels: Record<number, number>;
  orderedDraggableDisabled: boolean;
  orderedDroppableDisabled: boolean;
  chainBusy: boolean;
  deleteBusyId: number | null;
  canEdit: boolean;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onEdit: (q: QuizzQuestionRow) => void;
  onDelete: (id: number) => void;
};

export function ReflexionOrderedColumn(props: ReflexionOrderedColumnProps) {
  const orderedDrop = useDroppable({
    id: "drop-ordered",
    data: { zone: "ordered" },
    disabled: props.orderedDroppableDisabled,
  });

  const n = props.orderedQuestions.length;

  return (
    <div class={QUIZZ_DND_PANEL_STYLES.panel}>
      <p class={QUIZZ_DND_PANEL_STYLES.panelTitle}>Questions ordonnées</p>
      <p class="mb-2 text-xs text-base-content/55">
        Ordre de parcours : enchaînement parent → enfant via les bonnes réponses.
      </p>
      <div
        ref={orderedDrop.ref}
        class={orderedDrop.isDropTarget ? QUIZZ_DND_PANEL_STYLES.dropZoneActive : QUIZZ_DND_PANEL_STYLES.dropZone}
      >
        <p class="mb-2 text-xs text-base-content/50">
          Dépose une question du voisin gauche pour l’insérer (entre deux vignettes ou sur une fente colorée), ou réordonne en glissant les cartes. Glisse vers la gauche / zone « Questions brouillon » pour retirer de la suite.
        </p>
        <div class="max-h-[min(28rem,55vh)] overflow-y-auto pr-1">
          <ReflexionOrderedInsertGap
            index={0}
            disabled={props.orderedDroppableDisabled || props.chainBusy}
          />
          {props.orderedQuestions.map((q, index) => (
            <Fragment key={q.id}>
              <QuizzQuestionDndRow
                data={{ row: q }}
                visual={{
                  leftBorderHex:
                    props.chainColorLevels[q.id] != null
                      ? COLLECTION_TREE_LEVEL_BORDER_HEX[
                          Math.min(
                            Math.max(0, props.chainColorLevels[q.id]!),
                            COLLECTION_TREE_LEVEL_BORDER_HEX.length - 1,
                          )
                        ]
                      : null,
                  colorDrop:
                    props.canEdit && !props.chainBusy
                      ? { disabled: props.orderedDroppableDisabled || props.orderedDraggableDisabled }
                      : undefined,
                }}
                dnd={{
                  draggableId: `ordered-q-${q.id}`,
                  disabled: props.orderedDraggableDisabled,
                  payload: { from: "ordered", questionId: q.id } satisfies ReflexionDndPayload,
                }}
                settings={{
                  dragActivation: "fullCard",
                  sequence: { index: index + 1, total: n },
                  sortable: { group: REFLEXION_ORDERED_SORT_GROUP, index },
                }}
                actions={
                  props.canEdit
                    ? {
                        onEdit: () => props.onEdit(q),
                        onDelete: () => props.onDelete(q.id),
                        onMoveUp: () => props.onMoveUp(index),
                        onMoveDown: () => props.onMoveDown(index),
                        canMoveUp: index > 0 && !props.chainBusy,
                        canMoveDown: index < n - 1 && !props.chainBusy,
                        chainBusy: props.chainBusy,
                        rowDeleteBusy: props.deleteBusyId === q.id,
                      }
                    : undefined
                }
              />
              <ReflexionOrderedInsertGap
                index={index + 1}
                disabled={props.orderedDroppableDisabled || props.chainBusy}
              />
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export type ReflexionDndWorkspaceProps = {
  liste?: ReflexionGroupeListeSectionProps;
  band: ReflexionTopBandProps;
  pool: Omit<ReflexionPoolColumnProps, "poolDroppableRef" | "isPoolDropTarget"> & {
    poolDroppableDisabled: boolean;
  };
  ordered: Omit<ReflexionOrderedColumnProps, "orderedDroppableRef" | "isOrderedDropTarget"> & {
    orderedDroppableDisabled: boolean;
  };
  /** Désactive le drag des pastilles (non propriétaire, chaîne en cours…). */
  paletteRailDisabled: boolean;
  saveAction?: {
    disabled: boolean;
    busy: boolean;
    onSave: () => void;
  };
};

export function ReflexionDndWorkspace(props: ReflexionDndWorkspaceProps) {
  return (
    <div class={QUESTION_REFLEXION_VIEW_STYLES.pageStack}>
      {props.liste != null ? (
        <div class={QUESTION_REFLEXION_VIEW_STYLES.topBand}>
          <ReflexionGroupeListeSection {...props.liste} />
        </div>
      ) : null}
      <ReflexionTopBand {...props.band} />
      <div class={QUESTION_REFLEXION_VIEW_STYLES.gridWithPaletteRow}>
        <div class={cn(QUESTION_REFLEXION_VIEW_STYLES.bottomGrid, "min-w-0 flex-1")}>
          <ReflexionPoolColumn
            search={props.pool.search}
            onSearchChange={props.pool.onSearchChange}
            poolQuestions={props.pool.poolQuestions}
            poolDraggableDisabled={props.pool.poolDraggableDisabled}
            poolDroppableDisabled={props.pool.poolDroppableDisabled}
          />
          <ReflexionOrderedColumn
            orderedQuestions={props.ordered.orderedQuestions}
            chainColorLevels={props.ordered.chainColorLevels}
            orderedDraggableDisabled={props.ordered.orderedDraggableDisabled}
            orderedDroppableDisabled={props.ordered.orderedDroppableDisabled}
            chainBusy={props.ordered.chainBusy}
            deleteBusyId={props.ordered.deleteBusyId}
            canEdit={props.ordered.canEdit}
            onMoveUp={props.ordered.onMoveUp}
            onMoveDown={props.ordered.onMoveDown}
            onEdit={props.ordered.onEdit}
            onDelete={props.ordered.onDelete}
          />
        </div>
        <aside
          class={QUESTION_REFLEXION_VIEW_STYLES.paletteRailAside}
          aria-label="Palette de couleurs pour les vignettes"
        >
          <div class="flex w-full flex-col items-center gap-3">
            <ReflexionPaletteRail disabled={props.paletteRailDisabled} />
            {props.saveAction != null ? (
              <Button
                variant="learn"
                class="w-full max-w-[20rem] gap-2 lg:max-w-none"
                disabled={props.saveAction.disabled}
                onClick={props.saveAction.onSave}
              >
                {props.saveAction.busy ? "…" : "Save"}
              </Button>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
