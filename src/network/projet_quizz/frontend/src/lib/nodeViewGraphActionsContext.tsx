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

/** Mise à jour du rôle d’influence (`ref_importance_personalite`) pour un lien déjà existant. */
export type NodeViewGraphUpdatePersonaliteImportanceArgs = {
  collectionId: number;
  personaliteId: number;
  importanceType: "pionnier" | "important" | "secondaire" | null;
};

/** `collection_tag_lien` : `tagCollectionId` = collection-étiquette (#), `taggedCollectionId` = collection cible. */
export type NodeViewGraphCollectionTagArgs = {
  taggedCollectionId: number;
  tagCollectionId: number;
};

/** Retire un influenceur d’une collection (`DELETE .../collections/:id/personalites/:personaliteId`). */
export type NodeViewGraphUnassignPersonaliteArgs = {
  collectionId: number;
  personaliteId: number;
};

export type NodeViewGraphActionsValue = {
  moveQuestionToCollection: (args: NodeViewGraphMoveQuestionArgs) => Promise<void>;
  moveGroupeToCollection: (args: NodeViewGraphMoveGroupeArgs) => Promise<void>;
  /** Met à jour ou crée le lien collection ↔ personnalité avec le rôle demandé (POST API idempotent). */
  updatePersonaliteImportanceOnCollection: (
    args: NodeViewGraphUpdatePersonaliteImportanceArgs,
  ) => Promise<void>;
  /** Associe une collection-étiquette (#) à la collection du nœud (`POST .../collection-tags`). */
  assignCollectionTagOnGraph: (args: NodeViewGraphCollectionTagArgs) => Promise<void>;
  /** Retire une étiquette (`DELETE .../collection-tags/:tagCollectionId`). */
  unassignCollectionTagOnGraph: (args: NodeViewGraphCollectionTagArgs) => Promise<void>;
  /** Retire un influenceur (`DELETE .../collections/:id/personalites/:personaliteId`). */
  unassignPersonaliteFromCollectionOnGraph: (
    args: NodeViewGraphUnassignPersonaliteArgs,
  ) => Promise<void>;
  /** Ouvre la modale « Nouvelle question » (`QuestionEditModal` en variante création, comme QuestionsView). */
  openCreateQuestionModalForCollection: (collectionId: number) => void;
  /** Ouvre le panneau d’import LLM (même flux que la page Questions) pour une collection du graphe. */
  openLlmImportForCollection: (collectionId: number) => void;
  /** Lance `/play/:collectionId` avec les options du panneau « Mode de jeu » du canvas. */
  navigateToPlayForCollection: (collectionId: number) => void;
};

export const NodeViewGraphActionsContext = createContext<NodeViewGraphActionsValue | null>(null);

/**
 * Actions exposées depuis `NodeView` pour les nœuds du graphe (déplacement question, étiquettes #, influenceurs, création question, import LLM, lancement partie).
 */
export function useNodeViewGraphActions(): NodeViewGraphActionsValue | null {
  return useContext(NodeViewGraphActionsContext);
}
