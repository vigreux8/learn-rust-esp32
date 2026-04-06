import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [preact(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    // `src/network/site_compiled` (relatif : quizz/frontend → ../../../)
    outDir: '../../../site_compiled', 
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