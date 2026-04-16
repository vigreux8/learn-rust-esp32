import type { ComponentChildren } from "preact";
import { cn } from "../../lib/cn";

export type BadgeProps = {
  children: ComponentChildren;
  class?: string;
  tone?: "flow" | "learn" | "neutral";
};

/**
 * Pastille d’étiquette compacte pour catégories, identifiants ou statuts (tons flow / learn / neutre).
 */
export function Badge({ children, class: className, tone = "neutral" }: BadgeProps) {
  const tones = {
    flow: "bg-flow/15 text-flow border-flow/20",
    learn: "bg-learn/15 text-learn border-learn/20",
    neutral: "bg-base-200/80 text-base-content/70 border-base-content/10",
  };

  return (
    <span
      class={cn(
        "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
