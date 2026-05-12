import { createContext } from "preact";
import { useContext } from "preact/hooks";

/** Arguments pour déplacer une question entre deux collections (graphe `/node`). */
export type NodeViewGraphMoveQuestionArgs = {
  questionId: number;
  fromCollectionId: number;
  toCollectionId: number;
};

export type NodeViewGraphActionsValue = {
  moveQuestionToCollection: (args: NodeViewGraphMoveQuestionArgs) => Promise<void>;
};

export const NodeViewGraphActionsContext = createContext<NodeViewGraphActionsValue | null>(null);

/**
 * Actions exposées depuis `NodeView` pour les nœuds du graphe (ex. dépôt question → collection).
 */
export function useNodeViewGraphActions(): NodeViewGraphActionsValue | null {
  return useContext(NodeViewGraphActionsContext);
}
