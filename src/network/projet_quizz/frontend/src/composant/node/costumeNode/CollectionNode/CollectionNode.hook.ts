import { useCallback, useState } from "preact/hooks";
import type { CollectionNodeProps, CollectionNodeViewStates } from "./CollectionNode.types";

/**
 * Orchestration locale du nœud (expansion, contenu dérivé de `data`).
 * DnD-kit (`useDroppable`, etc.) pourra enrichir le bloc `dnd` plus tard.
 */
export function useCollectionNode(props: CollectionNodeProps): CollectionNodeViewStates {
  const { data, id } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const onPlay = useCallback(() => {
    data.actions?.onPlay?.(id);
  }, [data.actions, id]);

  return {
    layout: { isExpanded, toggle },
    content: {
      title: data.label,
      supercollections: data.supercollections ?? [],
      creators: data.creators ?? [],
    },
    dnd: { isOverBar: false },
    actions: { onPlay },
  };
}
