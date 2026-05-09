import { useRef } from "preact/hooks";
import { useQuestionReflexionBootstrap } from "./hooks/useQuestionReflexionBootstrap";
import { useQuestionReflexionCanvas } from "./hooks/useQuestionReflexionCanvas";
import type { QuestionReflexionViewProps } from "./QuestionReflexionView.types";

export function useQuestionReflexionViewState(props: QuestionReflexionViewProps) {
  const chainFlushRef = useRef<((cid: number, gid: number | null) => Promise<void>) | null>(null);
  const bootstrap = useQuestionReflexionBootstrap({ route: props.route, chainFlush: chainFlushRef });
  return useQuestionReflexionCanvas({ bootstrap, chainFlush: chainFlushRef });
}
