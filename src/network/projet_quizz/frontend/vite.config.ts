import { defineConfig, loadEnv } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  /** Cible Nest (127.0.0.1 évite les ambiguïtés ::1 / localhost). Voir `.env` / `.env_template`. */
  const apiProxyTarget =
    env.QUIZZ_API_PROXY_TARGET?.trim() || 'http://127.0.0.1:3001'

  const quizzApiProxy = {
    '/api': {
      target: apiProxyTarget,
      changeOrigin: true,
    },
  } as const

  return {
    plugins: [preact(), tailwindcss()],
    server: {
      port: 5174,
      proxy: quizzApiProxy,
      allowedHosts: true,
    },
    preview: {
      port: 5174,
      proxy: quizzApiProxy,
    },
    build: {
      // `src/network/site_compiled` (relatif : projet_quizz/frontend → ../../)
      outDir: '../../site_compiled',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Supprime les hashes (ex: main.js au lieu de main-asdf123.js)
          // pour que tes routes Rust restent fixes
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
    },
  }
})