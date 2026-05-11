import { useDraggable } from "@dnd-kit/react";
import { useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";

import { reflexionColorTargetId } from "../../../../lib/reflexionChainColors";
import type { QuizzQuestionDndRowProps } from "./QuizzQuestionDndRow.types";

export function useQuizzQuestionDndRowSortable(props: QuizzQuestionDndRowProps) {
  const { row } = props.data;
  const { draggableId, disabled, payload } = props.dnd;
  const { dragActivation, sequence, sortable } = props.settings;
  const cd = props.visual?.colorDrop;
  const sort = sortable!;

  const sortableHook = useSortable({
    id: draggableId,
    index: sort.index,
    group: sort.group,
    disabled,
    data: payload,
  });

  const colorDrop = useDroppable({
    id: reflexionColorTargetId(row.id),
    disabled: cd == null || cd.disabled,
    data: { zone: "color-target", questionId: row.id },
  });

  const borderHex = props.visual?.leftBorderHex ?? null;
  const { ref, handleRef, isDragging } = sortableHook;

  const innerRowRef =
    dragActivation === "fullCard"
      ? (el: Element | null) => {
          handleRef(el);
          colorDrop.ref(el);
        }
      : (el: Element | null) => {
          colorDrop.ref(el);
        };

  return {
    row,
    sequence,
    dragActivation,
    borderHex,
    containerRef: ref,
    innerRowRef,
    handleRef,
    isDragging,
    isDropTarget: colorDrop.isDropTarget,
    footer: props.actions,
  };
}

export function useQuizzQuestionDndRowDraggable(props: QuizzQuestionDndRowProps) {
  const { row } = props.data;
  const { draggableId, disabled, payload } = props.dnd;
  const { dragActivation, sequence } = props.settings;

  const draggableHook = useDraggable({
    id: draggableId,
    disabled,
    data: payload,
  });

  const { ref, handleRef, isDragging } = draggableHook;

  const cardRef =
    dragActivation === "fullCard"
      ? (el: Element | null) => {
          ref(el);
          handleRef(el);
        }
      : ref;

  return {
    row,
    sequence,
    dragActivation,
    cardRef,
    handleRef,
    isDragging,
    footer: props.actions,
  };
}
