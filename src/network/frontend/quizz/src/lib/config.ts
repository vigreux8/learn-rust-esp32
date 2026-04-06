/** Utilisateur par défaut tant qu’il n’y a pas d’auth. */
export const DEFAULT_USER_ID = 1;

export function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api${normalized}`;
}

export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.0.0";
