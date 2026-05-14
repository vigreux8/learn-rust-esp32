import { createContext } from "preact";
import { useContext } from "preact/hooks";

/** Arguments pour déplacer une question entre deux collections (graphe `/node`). */
export type NodeViewGraphMoveQuestionArgs = {
  questionId: number;
  fromCollectionId: number;
  toCollectionId: number;
  /** Si défini (plusieurs ids), déplace toutes ces questions depuis `fromCollectionId`. */
  questionIds?: readonly number[];
};

/** Arguments pour déplacer une suite logique (`groupe_questions`) vers une autre collection. */
export type NodeViewGraphMoveGroupeArgs = {
  groupeId: number;
  fromCollectionId: number;
  toCollectionId: number;
  groupeIds?: readonly number[];
};

export type NodeViewGraphActionsValue = {
  moveQuestionToCollection: (args: NodeViewGraphMoveQuestionArgs) => Promise<void>;
  moveGroupeToCollection: (args: NodeViewGraphMoveGroupeArgs) => Promise<void>;
  /** Ouvre le panneau d’import LLM (même flux que la page Questions) pour une collection du graphe. */
  openLlmImportForCollection: (collectionId: number) => void;
  /** Lance `/play/:collectionId` avec les options du panneau « Mode de jeu » du canvas. */
  navigateToPlayForCollection: (collectionId: number) => void;
};

export const NodeViewGraphActionsContext = createContext<NodeViewGraphActionsValue | null>(null);

/**
 * Actions exposées depuis `NodeView` pour les nœuds du graphe (déplacement question, import LLM, lancement partie).
 */
export function useNodeViewGraphActions(): NodeViewGraphActionsValue | null {
  return useContext(NodeViewGraphActionsContext);
}
