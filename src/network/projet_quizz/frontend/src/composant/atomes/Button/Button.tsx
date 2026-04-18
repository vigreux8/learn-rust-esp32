import { cn } from "../../../lib/cn";
import { BUTTON_STYLES } from "./Button.styles";
import type { ButtonProps } from "./Button.types";

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
