import type { ComponentChildren, ComponentProps } from "preact";
import { cn } from "../../../lib/cn";
import { CARD_STYLES } from "./Card.styles";

export type CardProps = ComponentProps<"div"> & {
  children: ComponentChildren;
  class?: string;
  padding?: "sm" | "md" | "lg";
};

export function Card({ children, class: className, padding = "md", ...props }: CardProps) {
  return (
    <div {...props} class={cn(CARD_STYLES.base, CARD_STYLES.paddings[padding], className)}>
      {children}
    </div>
  );
}
