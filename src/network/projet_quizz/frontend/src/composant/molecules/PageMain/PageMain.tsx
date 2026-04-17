import type { ComponentChildren } from "preact";
import { cn } from "../../../lib/cn";
import { PAGE_MAIN_STYLES } from "./PageMain.styles";

export type PageMainProps = {
  children: ComponentChildren;
  class?: string;
  narrow?: boolean;
};

export function PageMain({ children, class: className, narrow }: PageMainProps) {
  return (
    <main
      class={cn(
        PAGE_MAIN_STYLES.base,
        narrow ? PAGE_MAIN_STYLES.narrow : PAGE_MAIN_STYLES.wide,
        className,
      )}
    >
      {children}
    </main>
  );
}
