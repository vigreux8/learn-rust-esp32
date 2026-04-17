import type { HeaderLink } from "./AppHeader.types";

export const HEADER_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/collections", label: "Collection" },
  { href: "/questions", label: "Question" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/database", label: "Export/Import" },
] as const satisfies readonly HeaderLink[];

export function pathWithoutQuery(p: string): string {
  const i = p.indexOf("?");
  return i >= 0 ? p.slice(0, i) : p;
}

export function isActivePath(current: string, href: string): boolean {
  const cur = pathWithoutQuery(current);
  if (href === "/") return cur === "/" || cur === "";
  return cur === href || cur.startsWith(`${href}/`);
}
