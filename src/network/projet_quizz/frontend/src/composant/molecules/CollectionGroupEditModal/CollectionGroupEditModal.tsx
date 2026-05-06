import { Button } from "../../atomes/Button/Button";
import type { CollectionGroupEditModalProps } from "./CollectionGroupEditModal.types";

export function CollectionGroupEditModal(props: CollectionGroupEditModalProps) {
  const { settings, data, status, actions } = props;
  if (!settings.open) return null;

  return (
    <dialog class="modal modal-open z-50" open>
      <div class="modal-box rounded-2xl border border-base-content/10" onClick={(e) => e.stopPropagation()}>
        <h3 class="text-lg font-bold">{settings.title}</h3>
        <label class="label mt-2" for={settings.nomInputId}>
          <span class="label-text">Nom</span>
        </label>
        <input
          id={settings.nomInputId}
          class="input input-bordered w-full rounded-xl border-base-content/15"
          value={data.nom}
          disabled={status.busy}
          onInput={(e) => actions.onChangeNom((e.target as HTMLInputElement).value)}
        />
        <label class="label mt-2" for={settings.descriptionInputId}>
          <span class="label-text">Description</span>
        </label>
        <textarea
          id={settings.descriptionInputId}
          class="textarea textarea-bordered w-full rounded-xl border-base-content/15"
          rows={3}
          value={data.description}
          disabled={status.busy}
          onInput={(e) => actions.onChangeDescription((e.target as HTMLTextAreaElement).value)}
        />
        <div class="modal-action">
          <button type="button" class="btn btn-ghost rounded-xl" disabled={status.busy} onClick={actions.onClose}>
            Annuler
          </button>
          <Button variant="flow" disabled={status.busy || data.nom.trim() === ""} onClick={actions.onSubmit}>
            {status.busy ? "…" : "Enregistrer"}
          </Button>
        </div>
      </div>
      <div class="modal-backdrop bg-base-content/40" role="presentation" onClick={actions.onClose} />
    </dialog>
  );
}
