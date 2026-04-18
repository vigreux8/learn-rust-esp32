/**
 * Retourne le chemin sans la chaîne de requête (`?key=value`).
 *
 * @param p - Chemin ou URL (ex. `/play/1?mode=random`).
 * @returns Le même chemin tronqué avant le premier `?`.
 */
export function pathWithoutQuery(p: string): string {
    const i = p.indexOf("?");
    return i >= 0 ? p.slice(0, i) : p;
}