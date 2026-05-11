import { Button } from "../../../../ui/atomes/Button/Button";
import type { UnsavedChainLeaveModalProps } from "./UnsavedChainLeaveModal.types";

export function UnsavedChainLeaveModal(props: UnsavedChainLeaveModalProps) {
  if (!props.open) return null;

  const locked = props.saveBusy || props.discardBusy;

  return (
    <div
      class="fixed inset-0 z-60 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-chain-leave-title"
      onMouseDown={(e) => {
        if (!locked && e.target === e.currentTarget) props.onCancel();
      }}
    >
      <div
        class="w-full max-w-md rounded-2xl border border-base-content/15 bg-base-100 p-5 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="unsaved-chain-leave-title" class="text-lg font-semibold text-base-content">
          Modifications non enregistrées
        </h2>
        <p class="mt-2 text-sm text-base-content/70">
          L’ordre de la suite logique a été modifié mais pas encore sauvegardé. Que souhaites-tu faire avant de
          quitter ?
        </p>
        <div class="mt-6 flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" type="button" disabled={locked} onClick={props.onCancel}>
            Annuler
          </Button>
          <Button
            variant="outline"
            type="button"
            class="inline-flex items-center gap-2 border-warning/35 text-warning"
            disabled={locked}
            onClick={() => void props.onDiscard()}
          >
            {props.discardBusy ? <span class="loading loading-spinner loading-sm" aria-hidden /> : null}
            Ignorer
          </Button>
          <Button
            variant="learn"
            type="button"
            class="inline-flex items-center gap-2"
            disabled={locked}
            onClick={() => void props.onSave()}
          >
            {props.saveBusy ? <span class="loading loading-spinner loading-sm" aria-hidden /> : null}
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
