type LinkedModule = { id: number };

export function buildQuestionsRoutePath(collectionId: number, linkedModules: LinkedModule[]): string {
  const first = linkedModules[0];
  const q = first != null ? `?module=${first.id}` : "";
  return `/questions/${collectionId}${q}`;
}
