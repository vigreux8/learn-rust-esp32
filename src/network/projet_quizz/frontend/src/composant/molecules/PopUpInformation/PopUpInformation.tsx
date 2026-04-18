import { Button } from "../../atomes/Button";
import { POPUP_INFORMATION_STYLES } from "./PopUpInformation.styles";
import type { PopUpInformationProps } from "./PopUpInformation.types";

export function PopUpInformation({
  open,
  title,
  message,
  variant = "info",
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  busy = false,
  onConfirm,
  onCancel,
}: PopUpInformationProps) {
  if (!open) return null;
  const danger = variant === "danger";

  return (
    <div class={POPUP_INFORMATION_STYLES.overlay} role="presentation">
      <button
        type="button"
        class={POPUP_INFORMATION_STYLES.backdrop}
        aria-label="Fermer"
        disabled={busy}
        onClick={() => !busy && onCancel()}
      />
      <div
        class={`${POPUP_INFORMATION_STYLES.dialogBase} ${
          danger ? POPUP_INFORMATION_STYLES.dialogDanger : POPUP_INFORMATION_STYLES.dialogInfo
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pop-up-information-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="pop-up-information-title"
          class={`mb-3 text-lg font-semibold tracking-tight ${danger ? "text-error" : "text-base-content"}`}
        >
          {title}
        </h2>
        <p class="mb-6 whitespace-pre-line text-sm leading-relaxed text-base-content/80">{message}</p>
        <div class="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" class="btn-sm" disabled={busy} onClick={onCancel}>{cancelLabel}</Button>
          <Button
            variant={danger ? "outline" : "learn"}
            class={danger ? "btn-sm border-2 border-error/50 text-error hover:border-error hover:bg-error/10 shadow-none" : "btn-sm"}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
