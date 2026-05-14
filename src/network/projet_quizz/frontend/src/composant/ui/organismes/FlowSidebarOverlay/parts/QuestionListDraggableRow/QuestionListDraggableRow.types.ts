import type { JSX } from "preact";

export type QuestionListDraggableRowActions = {
  onEdit?: () => void;
  onDelete?: () => void | Promise<void>;
  editAriaLabel?: string;
  editTitle?: string;
  deleteAriaLabel?: string;
  deleteTitle?: string;
};

export type QuestionListDraggableRowProps = {
  movedFlashToken?: number | string | null;
  isPostMoveFlash: boolean;
  isSelected: boolean;
  draggable: boolean;
  onDragStart: (event: JSX.TargetedDragEvent<HTMLDivElement>) => void;
  onMainClick: (event: JSX.TargetedMouseEvent<HTMLDivElement>) => void;
  title: JSX.Element | string;
  actions?: QuestionListDraggableRowActions | null;
};
