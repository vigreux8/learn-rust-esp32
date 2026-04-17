import type { ComponentChildren } from "preact";
import { cn } from "../../../lib/cn";
import { BADGE_STYLES } from "./Badge.styles";

export type BadgeProps = {
  children: ComponentChildren;
  class?: string;
  tone?: "flow" | "learn" | "neutral";
};

export function Badge({ children, class: className, tone = "neutral" }: BadgeProps) {
  return (
    <span class={cn(BADGE_STYLES.base, BADGE_STYLES.tones[tone], className)}>
      {children}
    </span>
  );
}
