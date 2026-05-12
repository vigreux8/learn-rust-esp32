import { useEffect, useState } from "preact/hooks";
import { X } from "lucide-preact";
import { Button } from "../../../../ui/atomes/Button/Button";
import type { GraphCreateNormaleCollectionModalProps } from "./GraphCreateNormaleCollectionModal.types";

/**
 * Modal création collection « normale » depuis le graphe (même champs métier que la page Collections).
 */
export function GraphCreateNormaleCollectionModal({
  open,
  busy,
  error,
  tagOptions,
  onClose,
  onSubmit,
}: GraphCreateNormaleCollectionModalProps) {
  const [nom, setNom] = useState("");
  const [tagCollectionId, setTagCollectionId] = useState<number | "">("");

  useEffect(() => {
    if (!open) {
      setNom("");
      setTagCollectionId("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="graph-create-coll-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        class="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-base-content/15 bg-base-100 p-5 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <h2 id="graph-create-coll-title" class="text-lg font-semibold text-base-content">
            Nouvelle collection sur le graphe
          </h2>
          <button
            type="button"
            class="btn btn-ghost btn-sm btn-square shrink-0"
            aria-label="Fermer"
            disabled={busy}
            onClick={onClose}
          >
            <X class="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div class="flex flex-col gap-3">
          <div>
            <label class="mb-1 block text-xs font-medium text-base-content/65" for="graph-new-coll-nom">
              Nom
            </label>
            <input
              id="graph-new-coll-nom"
              class="input input-bordered input-sm w-full rounded-xl border-base-content/15 bg-base-100"
              type="text"
              value={nom}
              disabled={busy}
              onInput={(e) => setNom((e.target as HTMLInputElement).value)}
            />
          </div>
          <div>
            <label
              class="mb-1 block text-xs font-medium text-base-content/65"
              for="graph-new-coll-tag"
            >
              Étiquette / collection de regroupement (optionnel)
            </label>
            <select
              id="graph-new-coll-tag"
              class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100"
              value={tagCollectionId === "" ? "" : String(tagCollectionId)}
              disabled={busy || tagOptions.length === 0}
              onChange={(e) => {
                const v = (e.target as HTMLSelectElement).value;
                setTagCollectionId(v === "" ? "" : Number(v));
              }}
            >
              <option value="">—</option>
              {tagOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </div>
          {error ? <p class="text-xs text-error">{error}</p> : null}
          <div class="flex justify-end gap-2">
            <Button variant="outline" class="btn-sm" disabled={busy} onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="flow"
              class="btn-sm"
              disabled={busy || !nom.trim()}
              onClick={() => onSubmit({ nom: nom.trim(), tagCollectionId })}
            >
              {busy ? "Création…" : "Créer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
