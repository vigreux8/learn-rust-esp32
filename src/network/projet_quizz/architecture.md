# Architecture — projet `projet_quizz`

## Résumé

`projet_quizz` est une application **full-stack TypeScript** autonome (hors chaîne de build du firmware Rust) : une **SPA Preact** parle à une **API NestJS** qui persiste les données dans **SQLite** via **Prisma**. Elle sert à gérer des collections de questions, faire jouer des quiz sur un appareil identifié par **adresse MAC**, enregistrer des **KPI / sessions** et proposer des outils **d’administration** (export / import de base).

## Backend (`backend/`)

- **Framework** : NestJS 11 (Express), validation avec `class-validator` / `class-transformer`.
- **Données** : Prisma 7 + client SQLite **`better-sqlite3`** via l’adaptateur officiel `@prisma/adapter-better-sqlite3`.
- **Organisation** : modules métier `devices`, `quizz`, `stats`, `admin`, plus un module **`prisma`** maison qui encapsule le client et le chemin fichier SQLite.
- **Particularités** : dossier **`ddb/`** (schémas DBML, scripts SQL de référence, `inject.sql`), **`prisma.config.ts`** (config Prisma « app » : migrations, seed), endpoints admin pour **sauvegardes / fusion / import SQL** contrôlé.

Voir le détail : [`backend/architecture.md`](./backend/architecture.md).

## Frontend (`frontend/`)

- **UI** : Preact 10, routage **`preact-router`**, styles **Tailwind CSS 4** + thème **DaisyUI 5**.
- **Structure** : entrée `main.tsx` / `app.tsx`, pages sous `composant/organismes/`, design system léger en `composant/atomes/` et `composant/molecules/`, logique réseau et helpers dans `lib/`, types partagés dans `types/`.

Voir le détail : [`frontend/architecture.md`](./frontend/architecture.md).

## Lien avec le dépôt parent

Le dépôt `servomoteur` décrit la vue globale (firmware ESP32, autres frontends Vite) dans [`architecture.md`](../../../architecture.md) à la racine. Le quizz **n’est pas** embarqué dans le binaire Rust par défaut ; il vit ici pour le développement et des scénarios réseau séparés.
