import { cn } from "../../../lib/cn";
import { getProgressPercent } from "./ProgressBar.metier";
import { PROGRESS_BAR_STYLES } from "./ProgressBar.styles";
import type { ProgressBarProps } from "./ProgressBar.types";

export function ProgressBar({ value, max, class: className }: ProgressBarProps) {
  const pct = getProgressPercent(value, max);

  return (
    <div class={cn(PROGRESS_BAR_STYLES.wrapper, className)}>
      <progress class={PROGRESS_BAR_STYLES.progress} value={value} max={max} />
      <div class={PROGRESS_BAR_STYLES.footer}>
        <span>Progression</span>
        <span class={PROGRESS_BAR_STYLES.value}>{pct}%</span>
      </div>
    </div>
  );
}
