import { cn } from "../../../lib/cn";
import { CARD_STYLES } from "./Card.styles";
import type { CardProps } from "./Card.types";

export function Card({ children, class: className, padding = "md", ...props }: CardProps) {
  return (
    <div {...props} class={cn(CARD_STYLES.base, CARD_STYLES.paddings[padding], className)}>
      {children}
    </div>
  );
}
