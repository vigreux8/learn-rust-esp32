/**
 * Adresse MAC factice utilisée par le front (pas d’accès à la vraie MAC dans le navigateur).
 * Doit correspondre à `SEED_DEMO_DEVICE_MAC` dans `prisma/seed.ts`.
 */
export const DEMO_DEVICE_MAC = "DE:AD:BE:EF:00:01";

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) {
    const base = fromEnv.replace(/\/$/, "");
    return `${base}/api${normalized}`;
  }
  // En `vite dev`, appel direct vers Nest (CORS activé) : évite les échecs de proxy selon l’OS / le navigateur.
  if (import.meta.env.DEV) {
    const origin =
      import.meta.env.VITE_DEV_API_ORIGIN?.trim().replace(/\/$/, "") ||
      "http://127.0.0.1:3001";
    return `${origin}/api${normalized}`;
  }
  return `/api${normalized}`;
}

export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.0.0";
