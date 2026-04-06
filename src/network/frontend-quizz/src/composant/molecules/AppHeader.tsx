import { route } from "preact-router";
import { GraduationCap } from "lucide-preact";
import { useRoutePath } from "../../lib/routePathContext";
import { cn } from "../../lib/cn";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/collections", label: "Collection" },
  { href: "/questions", label: "Question" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

function isActive(current: string, href: string) {
  if (href === "/") return current === "/" || current === "";
  return current === href || current.startsWith(`${href}/`);
}

export function AppHeader() {
  const path = useRoutePath();

  return (
    <header class="sticky top-0 z-40 border-b border-base-content/5 bg-base-100/80 backdrop-blur-lg transition-shadow duration-300">
      <div class="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <button
          type="button"
          onClick={() => route("/")}
          class="flex items-center gap-2.5 rounded-full px-1 py-1 text-left transition duration-300 ease-out hover:opacity-90 active:scale-[0.98]"
        >
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-flow to-learn text-white shadow-lg shadow-flow/20">
            <GraduationCap class="h-5 w-5" aria-hidden />
          </span>
          <div class="leading-tight">
            <p class="text-lg font-semibold tracking-tight text-base-content">FlowLearn</p>
            <p class="text-xs text-base-content/50">Flow · Learn</p>
          </div>
        </button>

        <nav
          class="flex flex-wrap items-center justify-center gap-1.5 sm:justify-end"
          aria-label="Navigation principale"
        >
          {links.map(({ href, label }) => {
            const active = isActive(path, href);
            return (
              <button
                key={href}
                type="button"
                onClick={() => route(href)}
                class={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-out active:scale-[0.97]",
                  active
                    ? "bg-flow text-white shadow-xl shadow-flow/25 hover:scale-[1.03] hover:brightness-110 hover:shadow-xl hover:shadow-flow/35"
                    : "text-base-content/70 hover:bg-learn/14 hover:text-learn hover:scale-[1.02]",
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
