import type { ComponentChildren, JSX } from "preact";

export type ButtonVariant = "flow" | "learn" | "ghost" | "outline";

export type ButtonProps = {
  children: ComponentChildren;
  class?: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  "aria-label"?: string;
  "aria-expanded"?: boolean;
};
