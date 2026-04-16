import type { ComponentChildren, ComponentProps } from "preact";
import { cn } from "../../lib/cn";

export type CardProps = ComponentProps<"div"> & {
  children: ComponentChildren;
  class?: string;
  padding?: "sm" | "md" | "lg";
};

const paddings = { sm: "p-4", md: "p-6", lg: "p-8" };

export function Card({ children, class: className, padding = "md", ...props }: CardProps) {
  return (
    <div
      {...props}
      class={cn(
        "rounded-[var(--radius-box)] bg-base-100/90 backdrop-blur-sm shadow-lg shadow-flow/5 border border-base-content/5 transition-all duration-300 ease-out",
        paddings[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
