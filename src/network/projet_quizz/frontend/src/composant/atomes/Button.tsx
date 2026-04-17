import type { ComponentChildren, JSX } from "preact";
import { cn } from "../../lib/cn";

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

/**
 * Bouton stylé FlowLearn (variantes flow, learn, ghost, outline) pour les actions principales et secondaires.
 */
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
  const base =
    "btn rounded-full border-0 shadow-md transition-all duration-300 ease-out hover:shadow-lg active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<Variant, string> = {
    flow: "bg-flow text-white hover:brightness-110",
    learn: "bg-learn text-white hover:brightness-110",
    ghost: "bg-base-100/80 text-flow shadow-sm hover:bg-base-100",
    outline: "bg-transparent text-flow border-2 border-flow/40 hover:border-flow hover:bg-flow/5",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      class={cn(base, variants[variant], className)}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
