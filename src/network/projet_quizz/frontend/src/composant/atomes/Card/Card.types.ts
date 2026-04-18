import type { ComponentChildren, ComponentProps } from "preact";

export type CardProps = ComponentProps<"div"> & {
  children: ComponentChildren;
  class?: string;
  padding?: "sm" | "md" | "lg";
};
