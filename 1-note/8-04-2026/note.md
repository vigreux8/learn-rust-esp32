# Le Docstring (Python) VS la Documentation JSDoc en JavaScript/TypeScript

## ✨ La syntaxe de base JSDoc

Contrairement aux commentaires classiques (`//` ou `/* */`), la JSDoc commence **toujours** par `/**` (deux astérisques).

Exemple en TypeScript :

```typescript
/**
 * Voici une description globale de ce que fait la fonction.
 * @param param1 Description du premier paramètre
 * @returns Description de la valeur renvoyée par la fonction
 * @throws {Error} Description des cas d’erreur possibles
 */
function maFonction(param1: string) { ... }
```

---

# Comprendre `@Injectable()` dans NestJS

## 📘 Mini-Cours : Les Services et l’Injection avec NestJS

### 1️⃣ Le rôle du Service (`@Injectable`)

Dans une architecture propre :

- Le **Controller** reçoit la requête et renvoie la réponse.
- Toute l’intelligence (calculs, accès base de données, validation complexe…) est déléguée à un **Service**.

Pour qu’une classe soit reconnue comme service par NestJS, on utilise le décorateur :  
`@Injectable()`.  
Cela permet à NestJS de gérer le cycle de vie de la classe.

---

### 2️⃣ Singleton : un service, une instance

- Par défaut, chaque service dans NestJS est un **singleton**.
  - ➡️ **Une seule instance** est créée et partagée dans toute l’application.
  - **Avantage :** économie de mémoire & partage efficace de ressources (ex : base de données via `PrismaService`).

---

### 3️⃣ L’injection de dépendances (DI)

L’injection de dépendances : un objet **reçoit** ses dépendances de l’extérieur, sans avoir à les créer lui-même.

**Dans ton code :**

Au lieu de faire :

```typescript
const prisma = new PrismaService();
```

Tu le déclares dans le constructeur :

```typescript
@Injectable()
export class QuizzImportService {
  constructor(private readonly prisma: PrismaService) {}
  // NestJS injecte automatiquement PrismaService ici
}
```

> ✅ **NestJS gère l’instanciation et le partage de la dépendance !**

---

### 4️⃣ Mise en pratique : transformer un parser en service

**Avant :** Le parser est une fonction simple.  
**Après :** On en fait un service injectable pour l’intégrer proprement à NestJS.

#### Étape A : Créer le service de parsing

```typescript
@Injectable()
export class QuizzImportParser {
  /** Valide et normalise le JSON du LLM */
  parse(body: unknown): ParsedLlmImportBody {
    // Logique de validation et de nettoyage (trim, types, etc.)
    // ...
  }
}
```

#### Étape B : L’injecter dans un service métier

Ton `QuizzImportService` n’a plus à savoir _comment_ parser le JSON, il délègue au parser.

```typescript
@Injectable()
export class QuizzImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: QuizzImportParser, // Injection du parser
  ) {}

  async importQuestionsFromLlmJson(body: unknown) {
    const parsed = this.parser.parse(body); // On utilise le service injecté
    // ... suite de la logique Prisma
  }
}
```

---

## 🚀 À retenir

1. **Séparation des responsabilités :**
   - Un fichier/service pour le parsing (la forme)
   - Un pour le service métier (fond/DB)
2. **@Injectable() :**
   - Indispensable pour que NestJS gère automatiquement la classe
3. **Constructor :**
   - On déclare nos outils (dépendances) ici, ils sont injectés pour nous
4. **Maintenance facilitée :**
   - Tu peux changer le moteur de base ou le parser sans toucher au reste du code !

---

> Est-ce que cette structure te convient pour ton cours ?  
> Ou veux-tu approfondir la partie sur les transactions Prisma ?

# brut :

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

## 1. Pourquoi est-ce "mieux" qu’un ORM ici ?

- **Empreinte mémoire**  
  Un ORM (comme SeaORM) va générer énormément de code générique pour gérer tous les cas possibles. `rusqlite` ne compile que ce dont tu as besoin. Sur une ESP32, chaque ko de RAM compte.

- **Contrôle total**  
  Avec 5 tables, tu vas souvent faire des jointures (ex : lier un `User` à une `ServoConfig`). En écrivant le SQL toi-même, tu es sûr que la requête est optimisée pour la vitesse de ta carte SD.

- **Débogage facile**  
  Si une requête échoue sur l’ESP32, le message d’erreur de SQLite est direct.  
  Avec un ORM, il faut parfois fouiller dans les logs pour comprendre quel SQL il a généré en secret.

---

## 2. Comment organiser proprement le code (sans ORM)

Pour ne pas avoir de code "sale", utilise le pattern Repository. Crée un fichier par table :

```rust
// src/hardware/database/servo_repo.rs

pub struct ServoRepository<'a> {
    conn: &'a Connection,
}

impl<'a> ServoRepository<'a> {
    pub fn save_angle(&self, id: i32, angle: i32) -> Result<()> {
        self.conn.execute(
            "UPDATE servos SET angle = ?1 WHERE id = ?2",
            params![angle, id],
        )?;
        Ok(())
    }

    pub fn get_all(&self) -> Result<Vec<Servo>> {
        // ... ta requête SELECT ici
    }
}
```

# techno :

1. Axum et Rocket : Les "Gros" Serveurs
   Axum et Rocket sont les frameworks web les plus populaires en Rust... mais pour les ordinateurs (serveurs Cloud, PC).

Axum : Très moderne, rapide, utilisé par les pros.

Rocket : Très facile à utiliser, mais un peu "lourd".

Pour ton ESP32 : Oublie-les. Ils sont trop gourmands en ressources. Reste sur esp-idf-svc. C'est le serveur natif d'Espressif (le fabricant de l'ESP32). Il est léger et fait exactement ce qu'il faut pour un microcontrôleur.
