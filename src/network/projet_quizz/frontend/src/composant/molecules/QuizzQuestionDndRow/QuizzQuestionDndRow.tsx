import { ChevronDown, ChevronUp, GripVertical } from "lucide-preact";
import { cn } from "../../../lib/cn";
import { Button } from "../../atomes/Button/Button";
import { QUIZZ_DND_PANEL_STYLES } from "../QuizzDndQuestionPanels/QuizzDndQuestionPanels.styles";
import { MarkdownViewer } from "../../atomes/MarkdownViewer";
import { useQuizzQuestionDndRowDraggable, useQuizzQuestionDndRowSortable } from "./QuizzQuestionDndRow.hook";
import type { QuizzQuestionDndRowProps } from "./QuizzQuestionDndRow.types";

function RowFooter(props: NonNullable<QuizzQuestionDndRowProps["actions"]>) {
  const act = props;
  const chain = act.chainBusy === true;
  const rowLock = act.rowDeleteBusy === true;
  const lockNav = chain || rowLock;
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
            disabled={act.canMoveUp === false || lockNav}
            aria-label="Monter"
            onClick={act.onMoveUp}
          >
            <ChevronUp class="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-xs min-h-8 px-2"
            disabled={act.canMoveDown === false || lockNav}
            aria-label="Descendre"
            onClick={act.onMoveDown}
          >
            <ChevronDown class="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
      {act.onEdit != null ? (
        <Button variant="outline" class="btn-xs" disabled={rowLock} onClick={act.onEdit}>
          Modifier
        </Button>
      ) : null}
      {act.onDelete != null ? (
        <Button
          variant="outline"
          class="btn-xs border-error/40 text-error hover:bg-error/10"
          disabled={lockNav}
          onClick={act.onDelete}
        >
          Supprimer
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
      <div class="mt-1 line-clamp-3 text-base-content/90">
        <MarkdownViewer data={{ content: props.question }} />
      </div>
    </div>
  );
}

function QuizzQuestionDndRowSortable(props: QuizzQuestionDndRowProps) {
  const vm = useQuizzQuestionDndRowSortable(props);

  return (
    <div ref={vm.containerRef} class="mb-2" style={{ opacity: vm.isDragging ? 0.45 : 1 }}>
      <div
        ref={vm.innerRowRef}
        class={cn(
          QUIZZ_DND_PANEL_STYLES.questionRow,
          vm.isDropTarget && "ring-2 ring-learn/45 ring-offset-1 ring-offset-base-200",
        )}
        style={{
          ...(vm.borderHex != null && vm.borderHex !== ""
            ? {
                borderLeftWidth: "4px",
                borderLeftStyle: "solid",
                borderLeftColor: vm.borderHex,
              }
            : {}),
        }}
      >
        {vm.dragActivation === "handle" ? (
          <span
            ref={vm.handleRef}
            class="mt-0.5 text-base-content/40"
            aria-label="Déplacer la question (glisser-déposer)"
          >
            <GripVertical class="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <QuestionCardBody categorieType={vm.row.categorie_type} question={vm.row.question} sequence={vm.sequence} />
      </div>
      {vm.footer != null &&
      (vm.footer.onEdit != null ||
        vm.footer.onDelete != null ||
        vm.footer.onMoveUp != null ||
        vm.footer.onMoveDown != null) ? (
        <RowFooter {...vm.footer} />
      ) : null}
    </div>
  );
}

function QuizzQuestionDndRowDraggable(props: QuizzQuestionDndRowProps) {
  const vm = useQuizzQuestionDndRowDraggable(props);

  return (
    <div class="mb-2">
      <div
        ref={vm.cardRef}
        class={QUIZZ_DND_PANEL_STYLES.questionRow}
        style={{ opacity: vm.isDragging ? 0.45 : 1 }}
      >
        {vm.dragActivation === "handle" ? (
          <span
            ref={vm.handleRef}
            class="mt-0.5 text-base-content/40"
            aria-label="Déplacer la question (glisser-déposer)"
          >
            <GripVertical class="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <QuestionCardBody categorieType={vm.row.categorie_type} question={vm.row.question} sequence={vm.sequence} />
      </div>
      {vm.footer != null &&
      (vm.footer.onEdit != null ||
        vm.footer.onDelete != null ||
        vm.footer.onMoveUp != null ||
        vm.footer.onMoveDown != null) ? (
        <RowFooter {...vm.footer} />
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
