import { cn } from "../../../lib/cn";
import { PAGE_MAIN_STYLES } from "./PageMain.styles";
import type { PageMainProps } from "./PageMain.types";

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
