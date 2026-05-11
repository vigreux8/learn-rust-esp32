import type { DragEndEvent } from "@dnd-kit/dom";
import { isSortable } from "@dnd-kit/react/sortable";
import { useCallback } from "preact/hooks";
import {
  arrayMoveIds,
  parseReflexionColorTargetId,
  REFLEXION_DRAG_PALETTE_TYPE,
  REFLEXION_ORDERED_INSERT_PREFIX,
  REFLEXION_ORDERED_SORT_GROUP,
} from "../../QuestionReflexionView.metier";
import type {
  UseQuestionReflexionChainDragProps,
  UseQuestionReflexionChainDragResult,
} from "./useQuestionReflexionChainDrag.types";

/**
 * Glisser-déposer sur la vue suite logique : palette de teintes par question, insertion / réordonnancement
 * entre suite et brouillon, retrait vers le pool, et déplacement par index (`moveOrdered`).
 */
export function useQuestionReflexionChainDrag({
  refs,
  applyLocalChainIds,
  setChainColorLevels,
  setPoolReturnedIds,
}: UseQuestionReflexionChainDragProps): UseQuestionReflexionChainDragResult {
  const { orderedIdsRef } = refs;

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled === true) {
        return;
      }
      const sourceEntity = event.operation.source;
      const targetEntity = event.operation.target;
      if (sourceEntity == null) {
        return;
      }

      const paletteRaw = sourceEntity.data as { type?: string; level?: number | null } | undefined;
      if (paletteRaw?.type === REFLEXION_DRAG_PALETTE_TYPE) {
        const tid = targetEntity?.id != null ? String(targetEntity.id) : "";
        const qid = parseReflexionColorTargetId(tid);
        if (qid == null || !orderedIdsRef.current.includes(qid)) {
          return;
        }
        const lvl = paletteRaw.level;
        setChainColorLevels((prev) => {
          const next = { ...prev };
          if (lvl === null || lvl === undefined) {
            delete next[qid];
          } else {
            next[qid] = lvl;
          }
          return next;
        });
        return;
      }

      const raw = sourceEntity.data as { from?: string; questionId?: number } | undefined;
      const questionId = raw?.questionId;
      const targetId = targetEntity?.id != null ? String(targetEntity.id) : "";
      const cur = orderedIdsRef.current;

      if (targetId.startsWith(REFLEXION_ORDERED_INSERT_PREFIX)) {
        if (questionId == null || !Number.isInteger(questionId)) {
          return;
        }
        if (raw?.from !== "pool" && raw?.from !== "ordered") {
          return;
        }
        const g = Number(targetId.slice(REFLEXION_ORDERED_INSERT_PREFIX.length));
        if (!Number.isInteger(g) || g < 0) {
          return;
        }
        if (raw.from === "pool") {
          if (cur.includes(questionId)) return;
          const insertAt = Math.min(g, cur.length);
          applyLocalChainIds([...cur.slice(0, insertAt), questionId, ...cur.slice(insertAt)]);
          return;
        }
        if (raw.from === "ordered") {
          const from = cur.indexOf(questionId);
          if (from === -1) return;
          const n = cur.length;
          if (n === 0) return;
          const dest = Math.min(g, n - 1);
          if (from === dest) return;
          applyLocalChainIds(arrayMoveIds(cur, from, dest));
          return;
        }
      }

      if (isSortable(sourceEntity)) {
        const s = sourceEntity.sortable;
        if (s.group === REFLEXION_ORDERED_SORT_GROUP && s.initialIndex !== s.index) {
          const copy = [...orderedIdsRef.current];
          applyLocalChainIds(arrayMoveIds(copy, s.initialIndex, s.index));
          return;
        }
      }

      if (raw?.from !== "pool" && raw?.from !== "ordered") {
        return;
      }
      if (questionId == null || !Number.isInteger(questionId)) {
        return;
      }

      if (raw.from === "pool" && targetEntity != null && isSortable(targetEntity)) {
        const t = targetEntity.sortable;
        if (t.group === REFLEXION_ORDERED_SORT_GROUP) {
          if (cur.includes(questionId)) return;
          const insertAt = Math.min(Math.max(0, t.index), cur.length);
          applyLocalChainIds([...cur.slice(0, insertAt), questionId, ...cur.slice(insertAt)]);
          return;
        }
      }

      if (raw.from === "pool" && targetId === "drop-ordered") {
        if (cur.includes(questionId)) return;
        applyLocalChainIds([...cur, questionId]);
        return;
      }

      if (raw.from === "ordered" && targetId === "drop-pool") {
        applyLocalChainIds(cur.filter((id) => id !== questionId));
        if (questionId >= 0) {
          setPoolReturnedIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
        }
      }
    },
    [applyLocalChainIds],
  );

  const moveOrdered = useCallback(
    (index: number, delta: -1 | 1) => {
      const cur = [...orderedIdsRef.current];
      const j = index + delta;
      if (j < 0 || j >= cur.length) return;
      const t = cur[index]!;
      cur[index] = cur[j]!;
      cur[j] = t;
      applyLocalChainIds(cur);
    },
    [applyLocalChainIds],
  );

  return { onDragEnd, moveOrdered };
}
