import { cn } from "../../../lib/cn";
import { BADGE_STYLES } from "./Badge.styles";
import type { BadgeProps } from "./Badge.types";

export function Badge({ children, class: className, tone = "neutral" }: BadgeProps) {
  return (
    <span class={cn(BADGE_STYLES.base, BADGE_STYLES.tones[tone], className)}>
      {children}
    </span>
  );
}
