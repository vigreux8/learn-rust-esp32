export type HeaderLink = {
  href: string;
  label: string;
};

export const HEADER_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/collections", label: "Collection" },
  { href: "/questions", label: "Question" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/database", label: "Export/Import" },
] as const satisfies readonly HeaderLink[];