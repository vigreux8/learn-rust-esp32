import type { QuizzQuestionRow } from "../../../../types/quizz";

export type QuizzQuestionDndRowProps = {
  data: { row: QuizzQuestionRow };
  /** Bordure gauche / zone dépôt couleur (suite logique). */
  visual?: {
    leftBorderHex?: string | null;
    colorDrop?: { disabled: boolean };
  };
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
    /** Sauvegarde de la chaîne / opération globale : désactive déplacer et supprimer, pas « Modifier ». */
    chainBusy?: boolean;
    /** Suppression en cours pour cette ligne : désactive toute la rangée d’actions. */
    rowDeleteBusy?: boolean;
  };
};
