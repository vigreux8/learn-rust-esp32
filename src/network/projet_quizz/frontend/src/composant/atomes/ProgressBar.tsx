import { cn } from "../../lib/cn";

export type ProgressBarProps = {
  value: number;
  max: number;
  class?: string;
};

/**
 * Barre de progression native avec libellé et pourcentage pour suivre l’avancement d’un parcours (ex. quiz).
 */
export function ProgressBar({ value, max, class: className }: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));

  return (
    <div class={cn("w-full", className)}>
      <progress
        class="flowlearn-progress progress h-3 w-full rounded-full bg-base-200/80"
        value={value}
        max={max}
      />
      <div class="mt-1 flex justify-between text-xs text-base-content/60">
        <span>Progression</span>
        <span class="font-medium text-flow">{pct}%</span>
      </div>
    </div>
  );
}
