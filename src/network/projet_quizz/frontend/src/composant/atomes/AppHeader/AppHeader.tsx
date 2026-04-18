import { route } from "preact-router";
import { GraduationCap } from "lucide-preact";
import { cn } from "../../../lib/cn";
import { useRoutePath } from "../../../lib/routePathContext";
import { isActivePath } from "./AppHeader.metier";
import { HEADER_LINKS } from "./AppHeader.types";
import { APP_HEADER_STYLES } from "./AppHeader.styles";

export function AppHeader() {
  const path = useRoutePath();

  return (
    <header class={APP_HEADER_STYLES.header}>
      <div class={APP_HEADER_STYLES.container}>
        <button type="button" onClick={() => route("/")} class={APP_HEADER_STYLES.brandButton}>
          <span class={APP_HEADER_STYLES.brandIcon}>
            <GraduationCap class="h-5 w-5" aria-hidden />
          </span>
          <div class="leading-tight">
            <p class="text-lg font-semibold tracking-tight text-base-content">FlowLearn</p>
            <p class="text-xs text-base-content/50">Flow · Learn</p>
          </div>
        </button>

        <nav class={APP_HEADER_STYLES.nav} aria-label="Navigation principale">
          {HEADER_LINKS.map(({ href, label }) => {
            const active = isActivePath(path, href);
            return (
              <button
                key={href}
                type="button"
                onClick={() => route(href)}
                class={cn(
                  APP_HEADER_STYLES.navLinkBase,
                  active ? APP_HEADER_STYLES.navLinkActive : APP_HEADER_STYLES.navLinkIdle,
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
