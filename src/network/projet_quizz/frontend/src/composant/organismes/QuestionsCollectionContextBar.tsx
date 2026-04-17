import type { CollectionUi, QuizzModuleRow } from "../../types/quizz";

export type QuestionsCollectionContextBarProps = {
  targetCollectionNumeric: number | null;
  collections: CollectionUi[];
  allModules: QuizzModuleRow[];
  importTargetModuleId: number | null;
  setImportTargetModuleId: (id: number | null) => void;
};

/**
 * Bandeau contextuel quand une collection est ciblée : rappel du nom et lien optionnel vers une supercollection pour l’import.
 */
export function QuestionsCollectionContextBar({
  targetCollectionNumeric,
  collections,
  allModules,
  importTargetModuleId,
  setImportTargetModuleId,
}: QuestionsCollectionContextBarProps) {
  if (targetCollectionNumeric == null) return null;
  return (
    <div class="mb-4 rounded-xl border border-flow/20 bg-flow/5 px-4 py-3 text-sm text-base-content/80">
      <p class="font-medium text-base-content">
        Collection cible :{" "}
        {collections.find((c) => c.id === targetCollectionNumeric)?.nom ?? `#${targetCollectionNumeric}`}
      </p>
      <p class="mt-2 text-xs text-base-content/60">
        L’import LLM ajoute les questions ici. Tu peux forcer un lien vers une supercollection après import :
      </p>
      <label class="mt-2 block text-xs font-medium text-base-content/55" for="import-module-link">
        Supercollection (optionnel)
      </label>
      <select
        id="import-module-link"
        class="select select-bordered select-sm mt-1 max-w-md rounded-xl border-base-content/15 bg-base-100"
        value={importTargetModuleId ?? ""}
        onChange={(e) => {
          const v = (e.target as HTMLSelectElement).value;
          setImportTargetModuleId(v === "" ? null : Number(v));
        }}
      >
        <option value="">(aucune — pas de lien forcé)</option>
        {allModules.map((m) => (
          <option key={m.id} value={m.id}>
            {m.nom}
          </option>
        ))}
      </select>
    </div>
  );
}
