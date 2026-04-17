import type { ComponentChildren, JSX } from "preact";
import { cn } from "../../../lib/cn";
import { BUTTON_STYLES } from "./Button.styles";

type Variant = "flow" | "learn" | "ghost" | "outline";

export type ButtonProps = {
  children: ComponentChildren;
  class?: string;
  variant?: Variant;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  "aria-label"?: string;
};

export function Button({
  children,
  class: className,
  variant = "flow",
  disabled,
  type = "button",
  onClick,
  title,
  "aria-label": ariaLabel,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      class={cn(BUTTON_STYLES.base, BUTTON_STYLES.variants[variant], className)}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
