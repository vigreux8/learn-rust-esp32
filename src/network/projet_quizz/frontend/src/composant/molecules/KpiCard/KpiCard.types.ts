import type { ComponentChildren } from "preact";

export type KpiCardProps = {
  title: string;
  value: string;
  hint?: string;
  icon?: ComponentChildren;
  accent?: "flow" | "learn";
};
