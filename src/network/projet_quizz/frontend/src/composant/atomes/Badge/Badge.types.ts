import type { ComponentChildren } from "preact";

export type BadgeProps = {
  children: ComponentChildren;
  class?: string;
  tone?: "flow" | "learn" | "neutral";
};
