import type { CollectionUi } from "../../../../../types/quizz";
import type { AppNode } from "../../../../node/config/flow.types";

export type UseNodeViewQuestionSidebarEditParams = {
  userId: number | null;
  setApiCollections: (value: CollectionUi[] | ((prev: CollectionUi[]) => CollectionUi[])) => void;
  setNodes: (value: AppNode[] | ((prev: AppNode[]) => AppNode[])) => void;
};
