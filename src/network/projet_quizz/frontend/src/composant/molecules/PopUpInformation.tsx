import { Button } from "../atomes/Button";

export type PopUpInformationProps = {
  open: boolean;
  title: string;
  /** Texte multi-lignes : les retours à la ligne (`\n`) sont conservés. */
  message: string;
  /** `danger` : accent visuel pour une action destructive. */
  variant?: "info" | "danger";
  confirmLabel?: string;
  cancelLabel?: string;
  /** Désactive les boutons et le clic sur le fond (ex. pendant un appel API). */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Modale de confirmation ou d’information (info / danger) avec message multiligne et actions Annuler / Confirmer.
 */
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
    <div class="fixed inset-0 z-[110] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        class="absolute inset-0 border-0 bg-base-content/45 p-0"
        aria-label="Fermer"
        disabled={busy}
        onClick={() => !busy && onCancel()}
      />
      <div
        class={`relative z-10 w-full max-w-md rounded-2xl border bg-base-100 p-6 shadow-2xl ${
          danger ? "border-error/25 shadow-error/10" : "border-base-content/10"
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
          <Button variant="ghost" class="btn-sm" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "outline" : "learn"}
            class={
              danger
                ? "btn-sm border-2 border-error/50 text-error hover:border-error hover:bg-error/10 shadow-none"
                : "btn-sm"
            }
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
