/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** En dev, origine Nest si autre que http://127.0.0.1:3001 (ex. autre `QUIZZ_BACKEND_PORT`). */
  readonly VITE_DEV_API_ORIGIN?: string;
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
