import { useDraggable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-preact";
import { Button } from "../../atomes/Button/Button";
import { QUIZZ_DND_PANEL_STYLES } from "../QuizzDndQuestionPanels/QuizzDndQuestionPanels.styles";
import type { QuizzQuestionDndRowProps } from "./QuizzQuestionDndRow.types";

function RowFooter(props: NonNullable<QuizzQuestionDndRowProps["actions"]>) {
  const act = props;
  return (
    <div
      class="mt-1.5 flex flex-wrap items-center justify-end gap-2"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {act.onMoveUp != null && act.onMoveDown != null ? (
        <div class="mr-auto flex gap-1">
          <button
            type="button"
            class="btn btn-ghost btn-xs min-h-8 px-2"
            disabled={act.canMoveUp === false || act.deleteBusy}
            aria-label="Monter"
            onClick={act.onMoveUp}
          >
            <ChevronUp class="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-xs min-h-8 px-2"
            disabled={act.canMoveDown === false || act.deleteBusy}
            aria-label="Descendre"
            onClick={act.onMoveDown}
          >
            <ChevronDown class="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
      {act.onDelete != null ? (
        <Button
          variant="outline"
          class="btn-xs border-error/40 text-error hover:bg-error/10"
          disabled={act.deleteBusy}
          onClick={act.onDelete}
        >
          Supprimer
        </Button>
      ) : null}
      {act.onEdit != null ? (
        <Button variant="outline" class="btn-xs" disabled={act.deleteBusy} onClick={act.onEdit}>
          Modifier
        </Button>
      ) : null}
    </div>
  );
}

function QuestionCardBody(props: {
  categorieType: string;
  question: string;
  sequence?: { index: number; total: number };
}) {
  return (
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <span class={QUIZZ_DND_PANEL_STYLES.badge}>{props.categorieType}</span>
        {props.sequence != null ? (
          <span
            class="ml-auto shrink-0 tabular-nums text-xs font-medium text-base-content/55"
            aria-label={`Position ${props.sequence.index} sur ${props.sequence.total}`}
          >
            {props.sequence.index}/{props.sequence.total}
          </span>
        ) : null}
      </div>
      <p class="mt-1 line-clamp-3 text-base-content/90">{props.question}</p>
    </div>
  );
}

/** Ligne triable (suite ordonnée) : drag pour réordonner. */
function QuizzQuestionDndRowSortable(props: QuizzQuestionDndRowProps) {
  const { row } = props.data;
  const { draggableId, disabled, payload } = props.dnd;
  const { dragActivation, sequence, sortable } = props.settings;
  const sort = sortable!;

  const { ref, handleRef, isDragging } = useSortable({
    id: draggableId,
    index: sort.index,
    group: sort.group,
    disabled,
    data: payload,
  });

  /**
   * `ref` = enveloppe sortable (mesure / collision). `handleRef` = zone qui démarre le drag.
   * Si les deux pointent vers le bloc actions, les clics boutons sont avalés par le capteur pointer.
   * En mode pleine carte, seule la rangée question est poignée ; le pied reste cliquable.
   */
  const questionRowRef = dragActivation === "fullCard" ? handleRef : undefined;

  return (
    <div ref={ref} class="mb-2" style={{ opacity: isDragging ? 0.45 : 1 }}>
      <div ref={questionRowRef} class={QUIZZ_DND_PANEL_STYLES.questionRow}>
        {dragActivation === "handle" ? (
          <span
            ref={handleRef}
            class="mt-0.5 text-base-content/40"
            aria-label="Déplacer la question (glisser-déposer)"
          >
            <GripVertical class="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <QuestionCardBody categorieType={row.categorie_type} question={row.question} sequence={sequence} />
      </div>
      {props.actions != null &&
      (props.actions.onEdit != null ||
        props.actions.onDelete != null ||
        props.actions.onMoveUp != null ||
        props.actions.onMoveDown != null) ? (
        <RowFooter {...props.actions} />
      ) : null}
    </div>
  );
}

/** Ligne draggable simple (pool, ou colonnes sans tri interne). */
function QuizzQuestionDndRowDraggable(props: QuizzQuestionDndRowProps) {
  const { row } = props.data;
  const { draggableId, disabled, payload } = props.dnd;
  const { dragActivation, sequence } = props.settings;

  const { ref, handleRef, isDragging } = useDraggable({
    id: draggableId,
    disabled,
    data: payload,
  });

  const cardRef =
    dragActivation === "fullCard"
      ? (el: Element | null) => {
          ref(el);
          handleRef(el);
        }
      : ref;

  return (
    <div class="mb-2">
      <div
        ref={cardRef}
        class={QUIZZ_DND_PANEL_STYLES.questionRow}
        style={{ opacity: isDragging ? 0.45 : 1 }}
      >
        {dragActivation === "handle" ? (
          <span
            ref={handleRef}
            class="mt-0.5 text-base-content/40"
            aria-label="Déplacer la question (glisser-déposer)"
          >
            <GripVertical class="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <QuestionCardBody categorieType={row.categorie_type} question={row.question} sequence={sequence} />
      </div>
      {props.actions != null &&
      (props.actions.onEdit != null ||
        props.actions.onDelete != null ||
        props.actions.onMoveUp != null ||
        props.actions.onMoveDown != null) ? (
        <RowFooter {...props.actions} />
      ) : null}
    </div>
  );
}

export function QuizzQuestionDndRow(props: QuizzQuestionDndRowProps) {
  if (props.settings.sortable != null) {
    return <QuizzQuestionDndRowSortable {...props} />;
  }
  return <QuizzQuestionDndRowDraggable {...props} />;
}
