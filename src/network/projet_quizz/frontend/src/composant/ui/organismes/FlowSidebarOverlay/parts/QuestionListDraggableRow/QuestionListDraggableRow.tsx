import { GripVertical, Pencil, Trash2 } from "lucide-preact";
import type { ComponentChildren } from "preact";
import { cn } from "../../../../../../lib/cn";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import type { QuestionListDraggableRowProps } from "./QuestionListDraggableRow.types";

/**
 * Ligne liste sidebar (question ou suite logique) : poignée drag, sélection clic, actions crayon / corbeille.
 */
export function QuestionListDraggableRow(props: QuestionListDraggableRowProps) {
  const {
    movedFlashToken,
    isPostMoveFlash,
    isSelected,
    draggable,
    onDragStart,
    onMainClick,
    title,
    actions,
  } = props;

  const showActions = actions?.onEdit != null || actions?.onDelete != null;

  return (
    <div
      data-moved-question-row={isPostMoveFlash && movedFlashToken != null ? String(movedFlashToken) : undefined}
      class={cn(
        FLOW_SIDEBAR_OVERLAY_STYLES.dragItem,
        isPostMoveFlash ? FLOW_SIDEBAR_OVERLAY_STYLES.questionRowPostMove : undefined,
        isSelected ? FLOW_SIDEBAR_OVERLAY_STYLES.questionRowSelected : undefined,
      )}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <GripVertical
        size={16}
        class={`${FLOW_SIDEBAR_OVERLAY_STYLES.grip} mt-0.5 shrink-0`}
        aria-hidden
      />
      <div
        class={cn(FLOW_SIDEBAR_OVERLAY_STYLES.questionRowMain, "cursor-pointer select-none")}
        onClick={onMainClick}
      >
        <div class={`min-w-0 flex-1 ${FLOW_SIDEBAR_OVERLAY_STYLES.questionTitleMarkdown}`}>
          {title as ComponentChildren}
        </div>
        {showActions ? (
          <div
            class={FLOW_SIDEBAR_OVERLAY_STYLES.questionRowActions}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {actions?.onEdit != null ? (
              <button
                type="button"
                class={FLOW_SIDEBAR_OVERLAY_STYLES.questionRowActionBtn}
                draggable={false}
                aria-label={actions.editAriaLabel ?? "Modifier"}
                title={actions.editTitle ?? "Modifier"}
                onClick={() => actions.onEdit?.()}
              >
                <Pencil size={13} strokeWidth={2} aria-hidden />
              </button>
            ) : null}
            {actions?.onDelete != null ? (
              <button
                type="button"
                class={FLOW_SIDEBAR_OVERLAY_STYLES.questionRowActionBtn}
                draggable={false}
                aria-label={actions.deleteAriaLabel ?? "Supprimer"}
                title={actions.deleteTitle ?? "Supprimer"}
                onClick={() => void actions.onDelete?.()}
              >
                <Trash2 size={13} strokeWidth={2} aria-hidden />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
