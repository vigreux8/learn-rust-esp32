import { route } from "preact-router";
import { GraduationCap } from "lucide-preact";
import { cn } from "../../../../lib/cn";
import { useRoutePath } from "../../../../lib/routePathContext";
import { isActivePath } from "./AppHeader.metier";
import { HEADER_LINKS } from "./AppHeader.types";
import { APP_HEADER_STYLES } from "./AppHeader.styles";

export type AppHeaderProps = {
  /** Si défini, appelé avant `route()`. Retourner `false` annule la navigation. */
  beforeNavigate?: (href: string) => boolean | Promise<boolean>;
};

export function AppHeader(props: AppHeaderProps = {}) {
  const { beforeNavigate } = props;
  const path = useRoutePath();

  const go = (href: string) => {
    if (beforeNavigate == null) {
      route(href);
      return;
    }
    void Promise.resolve(beforeNavigate(href)).then((ok) => {
      if (ok === false) return;
      route(href);
    });
  };

  return (
    <header class={APP_HEADER_STYLES.header}>
      <div class={APP_HEADER_STYLES.container}>
        <button type="button" onClick={() => go("/")} class={APP_HEADER_STYLES.brandButton}>
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
                onClick={() => go(href)}
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
