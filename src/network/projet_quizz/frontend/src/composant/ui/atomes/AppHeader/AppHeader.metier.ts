import { pathWithoutQuery } from "./AppHeader.helper";

/**
 * Indique si le lien `href` doit être considéré comme actif pour le chemin courant.
 * Compare sans query string ; pour `href === "/"`, seul la racine est active.
 *
 * @param current - Chemin actuel (ex. depuis le routeur).
 * @param href - Cible du lien de navigation.
 * @returns `true` si `current` correspond exactement à `href` ou est un sous-chemin (`href/...`).
 */
export function isActivePath(current: string, href: string): boolean {
  const cur = pathWithoutQuery(current);
  if (href === "/") return cur === "/" || cur === "";
  return cur === href || cur.startsWith(`${href}/`);
}

