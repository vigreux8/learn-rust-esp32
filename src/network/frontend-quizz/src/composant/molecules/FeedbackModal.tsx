import type { ComponentChildren } from "preact";
import { PartyPopper, XCircle } from "lucide-preact";
import { Button } from "../atomes/Button";
import { cn } from "../../lib/cn";

export type FeedbackModalProps = {
  open: boolean;
  correct: boolean;
  title: string;
  detail?: ComponentChildren;
  onNext: () => void;
};

export function FeedbackModal({ open, correct, title, detail, onNext }: FeedbackModalProps) {
  if (!open) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-base-content/20 backdrop-blur-[2px]" aria-hidden />
      <div
        class={cn(
          "relative w-full max-w-md rounded-[var(--radius-box)] border p-6 shadow-2xl transition duration-200",
          correct ? "border-flow/30 bg-base-100" : "border-learn/30 bg-base-100",
        )}
      >
        <div class="flex items-start gap-3">
          <span
            class={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md",
              correct ? "bg-flow shadow-flow/30" : "bg-learn shadow-learn/25",
            )}
          >
            {correct ? <PartyPopper class="h-6 w-6" aria-hidden /> : <XCircle class="h-6 w-6" aria-hidden />}
          </span>
          <div class="min-w-0 flex-1 space-y-1">
            <p class="text-lg font-semibold text-base-content">{title}</p>
            {detail ? <div class="text-sm text-base-content/65">{detail}</div> : null}
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <Button variant={correct ? "flow" : "learn"} onClick={onNext}>
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
