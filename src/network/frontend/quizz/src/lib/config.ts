/**
 * Adresse MAC factice utilisée par le front (pas d’accès à la vraie MAC dans le navigateur).
 * Doit correspondre à `SEED_DEMO_DEVICE_MAC` dans `prisma/seed.ts`.
 */
export const DEMO_DEVICE_MAC = "DE:AD:BE:EF:00:01";

export function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api${normalized}`;
}

export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.0.0";
