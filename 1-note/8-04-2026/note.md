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
