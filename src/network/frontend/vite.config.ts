import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  build: {
    // Destination des fichiers pour le NetworkManager
    outDir: '../site_compiled', 
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