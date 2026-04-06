# Front-end

- **DaisyUI**
- **Tailwind CSS**

---

## Info

DaisyUI (qui s'appuie sur Tailwind CSS) permet de ne **pratiquement plus créer de fichiers `.css` séparés**.  
Les classes de style sont directement écrites dans tes fichiers `.tsx` (composants Preact).

C'est déroutant au début, mais pour un projet ESP32, c'est une **arme secrète**.  
**Voici pourquoi :**

---

### 1. Comment ça marche concrètement ?

Au lieu d'écrire ceci :

```css
/* mon_style.css */
.mon-bouton {
  background: blue;
  border-radius: 5px;
  padding: 10px;
}
```

On écrit directement dans un composant Preact :

```tsx
// DaisyUI simplifie Tailwind en donnant des noms "parlants"
<button className="btn btn-primary shadow-lg">Action Servo</button>
```

- `btn` : Donne la forme de base d'un bouton.
- `btn-primary` : Applique la couleur principale du thème.
- `shadow-lg` : Ajoute une ombre portée.

---

### 2. Pourquoi c'est génial pour l'ESP32 ?

- **Zéro JS inutile** :  
  Contrairement à PrimeReact (qui envoie du JS pour chaque menu/bouton), DaisyUI c'est **100% CSS**.  
  L'ESP32 n'a pas à « calculer » le composant : il envoie juste du HTML/CSS.

---

## Installer Tailwind

_Simple et rapide ! Pour un projet **Vite + Preact** :_

Ouvre un terminal **dans le dossier frontend** (celui avec `package.json`).

---

### 1. Installation des paquets

```bash
npm install -D tailwindcss postcss autoprefixer daisyui
```

---

### 2. Initialisation des fichiers de configuration

```bash
npx tailwindcss init -p
```

---

### 3. Configuration de `tailwind.config.js`

Ouvre `tailwind.config.js` et remplace tout par :

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  // Optionnel : Choisis tes thèmes préférés ici
  daisyui: {
    themes: ["light", "dark", "cupcake", "retro"],
  },
};
```

---

### 4. Importation des directives dans ton CSS

Dans ton fichier CSS principal (`src/index.css` ou `src/style.css`) **remplace tout par** :

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### Vérification

Ajoute dans `App.tsx` (ou `main.tsx`) ce code de test :

```tsx
export function App() {
  return (
    <div className="p-10 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Contrôle ESP32</h1>
      {/* Un bouton DaisyUI */}
      <button className="btn btn-primary">Action Servo</button>
      {/* Un switch Toggle */}
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">LED État</span>
          <input type="checkbox" className="toggle toggle-success" />
        </label>
      </div>
    </div>
  );
}
```

---

### Pourquoi c'est le _Combo Ultime_ pour l’ESP32 ?

- **Vite** détecte les classes utilisées.
- `npm run build` génère un **CSS minuscule** avec juste les styles nécessaires.
- L’ESP32 n’a à servir que **quelques octets**, pas une bibliothèque entière.

> **Astuce Flash :**  
> Pour occuper tout l’écran sur mobile (super utile avec l’ESP32), ajoute `data-theme="dark"` sur la balise `<html>` dans `index.html`.

---

### Besoin d’une jauge stylée pour afficher la position servo temps réel ? Dis-le-moi !

---

# Back-end / Code métier

## 1. L’option "Légère" : `rusqlite` (le standard)

- **Pas un ORM, mais un wrapper :**
  - Tu écris ton SQL toi-même
  - Rust s’occupe de transformer les résultats en struct

**Avantages :**

- Très rapide
- Très peu de RAM consommée
- Ultra-stable sur ESP32

**Inconvénient :**

- Tu dois écrire tes `SELECT * FROM ...` toi-même

```rust
#[derive(Debug)]
struct ServoConfig {
    id: i32,
    angle: i32,
}

// Récupérer une config
let mut stmt = conn.prepare("SELECT id, angle FROM configs WHERE id = ?1")?;
let config = stmt.query_row([1], |row| {
    Ok(ServoConfig {
        id: row.get(0)?,
        angle: row.get(1)?,
    })
})?;
```

---

# Serde

- **Serde :**  
  Le traducteur universel (JSON <-> struct Rust)
- **Rusqlite :**  
  Le bibliothécaire (struct Rust <-> base SQLite sur SD)

---

# Pourquoi les utiliser ensemble ?

Dans ton projet ESP32, ils forment **une chaîne de traitement** :

**Exemple : Changement d’angle d’un servo depuis le front**

1. **Frontend (Preact) :** Envoie un JSON : `{"id": 1, "angle": 90}`
2. **Réseau (ESP32) :** Reçoit le texte brut
3. **Serde (Rust) :** Transforme en `ServoConfig { id: i32, angle: i32 }`
4. **Rusqlite (Rust) :** Exécute : `UPDATE servos SET angle = 90 WHERE id = 1`

**Pourquoi ce duo ?**

- L’ORM fait tout d’un bloc (`JSON -> Objet -> DB`), mais c’est lourd.
- **Serde + Rusqlite**, c’est à la carte.  
  Tu gardes la **main sur chaque étape** : vital pour la RAM sur ESP32.

---

- **Serveur :** Garde `esp-idf-svc`, le plus stable pour servos + SD.
- **Données :** Un struct Rust par table (5 environ) → code plus simple à débugger.
- **JSON :** Utilise Serde juste pour les échanges entre front/back.

_Résumé :_

- `ESP-IDF-SVC` = cœur du serveur
- `Serde` = usine à JSON
- `Rusqlite` = accès à la carte SD

---

# À savoir : serde_rusqlite

**Le cas classique (sans serde_rusqlite) :**

1. SQLite lit une ligne
2. Rust : tu crées une struct `User { name: String }`
3. Serde fait la conversion en JSON pour l’envoi
4. Front reçoit `{"name": "Jean"}`

_C’est propre et sécurisé._

**Avec serde_rusqlite :**

- Tu convertis directement le résultat SQL en JSON (sans struct intermédiaire Rust).
- Tu gagnes quelques lignes.

**Mais sur ESP32, il est souvent préférable de garder le chemin classique** :

- Tu peux **valider** les données avant envoi
- Moins de RAM cachée consommée
