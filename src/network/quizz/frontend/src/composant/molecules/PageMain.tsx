import type { ComponentChildren } from "preact";
import { cn } from "../../lib/cn";

export type PageMainProps = {
  children: ComponentChildren;
  class?: string;
  narrow?: boolean;
};

export function PageMain({ children, class: className, narrow }: PageMainProps) {
  return (
    <main
      class={cn(
        "fl-page-enter mx-auto w-full flex-1 px-4 py-6 md:py-8",
        narrow ? "max-w-2xl" : "max-w-3xl",
        className,
      )}
    >
      {children}
    </main>
  );
}
