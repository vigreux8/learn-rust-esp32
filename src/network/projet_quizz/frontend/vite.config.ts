import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

/** Cible Nest (127.0.0.1 évite les ambiguïtés ::1 / localhost). */
const quizzApiProxy = {
  '/api': {
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
  },
} as const

export default defineConfig({
  plugins: [preact(), tailwindcss()],
  server: {
    proxy: quizzApiProxy,
  },
  preview: {
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
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
})