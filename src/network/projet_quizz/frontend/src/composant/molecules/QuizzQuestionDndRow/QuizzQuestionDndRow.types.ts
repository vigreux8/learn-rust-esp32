import type { QuizzQuestionRow } from "../../../types/quizz";

export type QuizzQuestionDndRowProps = {
  data: { row: QuizzQuestionRow };
  dnd: {
    draggableId: string;
    disabled: boolean;
    payload: Record<string, unknown>;
  };
  settings: {
    /** Poignée uniquement, ou carte entière comme zone de glissement. */
    dragActivation: "handle" | "fullCard";
    /** Affichage « index/total » sur la vignette (ex. suite ordonnée). Index en base 1. */
    sequence?: { index: number; total: number };
    /**
     * Liste triable (@dnd-kit sortable) : glisser pour réordonner dans le groupe.
     * Si absent, comportement `useDraggable` classique.
     */
    sortable?: { group: string; index: number };
  };
  actions?: {
    onEdit?: () => void;
    onDelete?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    deleteBusy?: boolean;
  };
};
