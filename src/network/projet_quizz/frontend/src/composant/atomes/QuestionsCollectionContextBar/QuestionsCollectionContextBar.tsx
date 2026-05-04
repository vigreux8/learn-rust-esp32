import { QUESTIONS_COLLECTION_CONTEXT_BAR_STYLES } from "./QuestionsCollectionContextBar.styles";
import type { QuestionsCollectionContextBarProps } from "./QuestionsCollectionContextBar.types";

export function QuestionsCollectionContextBar({
  targetCollectionNumeric,
  collections,
  importTargetTagCollectionId,
  setImportTargetTagCollectionId,
}: QuestionsCollectionContextBarProps) {
  if (targetCollectionNumeric == null) return null;
  return (
    <div class={QUESTIONS_COLLECTION_CONTEXT_BAR_STYLES.root}>
      <p class="font-medium text-base-content">
        Collection cible: {collections.find((c) => c.id === targetCollectionNumeric)?.nom ?? `#${targetCollectionNumeric}`}
      </p>
      <p class="mt-2 text-xs text-base-content/60">
        L import LLM ajoute les questions ici. Tu peux forcer un lien vers une collection-étiquette apres import:
      </p>
      <label class="mt-2 block text-xs font-medium text-base-content/55" for="import-tag-link">
        Collection-étiquette (optionnel)
      </label>
      <select
        id="import-tag-link"
        class="select select-bordered select-sm mt-1 max-w-md rounded-xl border-base-content/15 bg-base-100"
        value={importTargetTagCollectionId ?? ""}
        onChange={(e) => {
          const v = (e.target as HTMLSelectElement).value;
          setImportTargetTagCollectionId(v === "" ? null : Number(v));
        }}
      >
        <option value="">(aucune - pas de lien force)</option>
        {collections
          .filter((c) => c.id !== targetCollectionNumeric)
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
      </select>
    </div>
  );
}
