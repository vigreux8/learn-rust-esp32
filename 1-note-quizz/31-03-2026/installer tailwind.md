pourquoi tailwind a une version vite et une version sans vite ces quoi la différence dans qu’elle cas on utilise l’un ou l’autre ?

Npm run dev

# installer tailwind et daisy:

## step 0 witch vite :

npm install -D tailwindcss @tailwindcss/vite daisyui

## step 1 :

Ton `vite.config.js` est correct pour **Vite + Preact + Tailwind v4** :

```
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [preact(), tailwindcss()],
  ...
})
```

## step 2 :

### 2. Garde `src/index.css` ultra simple

Pour tester, mets seulement ça :

```
@import "tailwindcss";
@plugin "daisyui";
```
