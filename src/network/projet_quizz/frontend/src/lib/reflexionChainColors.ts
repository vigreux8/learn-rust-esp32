/** Colonne « suite ordonnée » : cible de dépôt des pastilles palette (`@dnd-kit`). */
export const REFLEXION_COLOR_TARGET_PREFIX = "reflexion-color-target-";

export function reflexionColorTargetId(questionId: number): string {
  return `${REFLEXION_COLOR_TARGET_PREFIX}${questionId}`;
}

export function parseReflexionColorTargetId(droppableId: string): number | null {
  if (!droppableId.startsWith(REFLEXION_COLOR_TARGET_PREFIX)) return null;
  const n = Number(droppableId.slice(REFLEXION_COLOR_TARGET_PREFIX.length));
  return Number.isInteger(n) ? n : null;
}
