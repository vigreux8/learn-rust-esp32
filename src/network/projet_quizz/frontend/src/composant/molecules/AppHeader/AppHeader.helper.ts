
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

/**
 * Retourne le chemin sans la chaîne de requête (`?key=value`).
 *
 * @param p - Chemin ou URL (ex. `/play/1?mode=random`).
 * @returns Le même chemin tronqué avant le premier `?`.
 */
function pathWithoutQuery(p: string): string {
  const i = p.indexOf("?");
  return i >= 0 ? p.slice(0, i) : p;
}


