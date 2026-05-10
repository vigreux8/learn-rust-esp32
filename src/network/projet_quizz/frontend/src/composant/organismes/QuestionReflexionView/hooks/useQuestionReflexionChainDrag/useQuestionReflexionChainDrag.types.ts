import type { DragEndEvent } from "@dnd-kit/dom";
import type { Dispatch, StateUpdater } from "preact/hooks";

export type UseQuestionReflexionChainDragProps = {
  refs: {
    orderedIdsRef: { current: number[] };
  };
  applyLocalChainIds: (nextIds: number[]) => void;
  setChainColorLevels: Dispatch<StateUpdater<Record<number, number>>>;
  setPoolReturnedIds: Dispatch<StateUpdater<number[]>>;
};

export type UseQuestionReflexionChainDragResult = {
  onDragEnd: (event: DragEndEvent) => void;
  moveOrdered: (index: number, delta: -1 | 1) => void;
};
