# Architecture — backend `quizz`

## Vue métier

Le backend couvre quatre domaines principaux :

- **`devices`** : identifier un appareil par `adresse_mac` et le lier à un `user`.
- **`quizz`** : catalogue (collections, modules, questions, réponses), tirage / filtres, import JSON (dont flux type LLM), édition ciblée.
- **`stats`** : enregistrement des résultats (`user_kpi`) et lecture agrégée (sessions, tableaux de bord).
- **`admin`** : opérations sensibles sur la base (export SQL/JSON, import JSON avec fusion, import SQL avec confirmation).

La persistance est **SQLite** ; l’accès se fait via **Prisma** avec l’adaptateur **`better-sqlite3`**.

## Technologies

| Élément | Détail |
|---------|--------|
| Runtime API | **NestJS** 11, plateforme **Express** |
| ORM | **Prisma** 7 (`schema.prisma`, migrations) |
| SQLite | **`better-sqlite3`** + `@prisma/adapter-better-sqlite3` |
| Validation | **class-validator** / **class-transformer** |
| Config Prisma « app » | **`prisma.config.ts`** (`defineConfig`, chemin migrations, commande de seed) |
| Tests | **Jest** (unitaires `*.spec.ts`, e2e dans `test/`) |

## Arborescence du dossier `backend/`

```text
backend/
├── package.json
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── eslint.config.mjs
├── .prettierrc
├── prisma.config.ts              # Config Prisma (datasource via DATABASE_URL, seed)
├── quizz.db                      # Fichier SQLite local (dev ; non versionné idéalement)
├── architecture.md
├── README.md
├── prisma/
│   ├── schema.prisma             # Modèles Prisma (SQLite)
│   ├── seed.ts                   # Données initiales (via `npm run db:seed`)
│   └── migrations/               # Historique SQL généré par Prisma Migrate
├── ddb/                          # Documentation / artefacts SQL hors runtime Nest
│   ├── readme.md
│   ├── inject.sql                # Script de référence pour injection / schéma cible
│   ├── v1/ … v3/, v2.5/         # Versions DBML + SQL + exports de référence
│   └── …
├── generated/                    # Client ou types générés (selon config locale ; ignorer si absent)
├── src/                          # Code Nest (voir section dédiée)
└── test/
    ├── jest-e2e.json
    └── app.e2e-spec.ts
```

### Dossiers / fichiers **peu typiques** d’un squelette Nest + Prisma

| Chemin | Pourquoi c’est différent du « default » |
|--------|----------------------------------------|
| **`ddb/`** | Ce n’est pas le dossier `prisma/` : il conserve des **versions de schéma** (`.dbml`, `.sql`), des **exports** et la procédure d’**injection** documentée. Utile pour migrations manuelles, comparaisons ou reprise de données hors Prisma Migrate seul. |
| **`prisma.config.ts`** | Prisma 7 permet une configuration **TypeScript** à la racine (URL DB, chemin migrations, **seed** exécutable via `npx tsx`). Complète `schema.prisma`. |
| **`src/prisma/`** | Module Nest **maison** : instancie `PrismaClient` avec l’**adaptateur SQLite**, résout le chemin fichier depuis `DATABASE_URL`, expose **`reconnect()`** après restauration de fichier `.db`. |
| **`src/admin/`** | Endpoints **dangereux** (remplacement DB, gros imports) isolés dans un module dédié avec garde-fous (confirmations, validation). |
| **`admin-sql-import.ts` / `admin-merge-json.ts`** | Logique d’import **hors** contrôleurs/services volumineux : parsing SQL, fusion JSON réutilisable / testable. |
| **`quizz/services/*.parser.ts`** | `LlmImportParser` : couche **sans DB** (validation / normalisation JSON) injectable Nest. |
| **`quizz-structure.service.ts`** | Domaine « **modules** » (super-collections) à part des lectures/écritures question/réponse classiques. |

## Arborescence `src/` (application Nest)

```text
src/
├── main.ts                       # Bootstrap Nest (écoute HTTP)
├── app.module.ts                 # Agrégation des modules métier + AppController
├── app.controller.ts             # Route racine / santé éventuelle
├── app.controller.spec.ts
├── app.service.ts                # Service minimal généré par le CLI
├── prisma/
│   ├── prisma.module.ts          # Module global exportant PrismaService
│   └── prisma.service.ts         # Cycle de vie + adaptateur better-sqlite3 + reconnect
├── devices/
│   ├── devices.module.ts
│   ├── devices.controller.ts
│   ├── devices.service.ts
│   └── dto/
│       └── devices.dto.ts
├── quizz/
│   ├── quizz.module.ts
│   ├── quizz.controller.ts
│   ├── quizz.type.ts             # Types de réponse / lignes UI exposées par l’API
│   ├── dto/
│   │   └── quizz.dto.ts          # DTO de patch / payloads d’écriture
│   └── services/
│       ├── index.ts
│       ├── quizz.service.ts      # Façade : délègue aux sous-services
│       ├── quizz-read.service.ts
│       ├── quizz-write.service.ts
│       ├── quizz-structure.service.ts
│       ├── quizz-import.parser.ts
│       └── quizz-import.service.ts
├── stats/
│   ├── stats.module.ts
│   ├── stats.controller.ts
│   ├── stats.type.ts
│   ├── dto/
│   │   └── stats.dto.ts
│   └── services/
│       ├── index.ts
│       ├── stats.service.ts      # Façade stats
│       ├── stats-kpi-read.service.ts
│       ├── stats-kpi-write.service.ts
│       └── stats-session.service.ts
└── admin/
    ├── admin.module.ts
    ├── admin.controller.ts
    ├── admin.service.ts
    ├── admin-sql-import.ts
    └── admin-merge-json.ts
```

## Description des **services** et fichiers associés

### Racine `src/`

| Fichier | Rôle |
|---------|------|
| **`main.ts`** | Crée l’application Nest et lance le serveur HTTP. |
| **`app.module.ts`** | Importe `PrismaModule`, `QuizzModule`, `DevicesModule`, `StatsModule`, `AdminModule`. |
| **`app.controller.ts` / `app.service.ts`** | Point d’ancrage CLI ; peu ou pas de logique métier quiz. |

### `prisma/`

| Fichier | Rôle |
|---------|------|
| **`prisma.module.ts`** | Déclare `PrismaService` en **global** pour injection dans tous les modules. |
| **`prisma.service.ts`** | Construit `PrismaClient` avec **`PrismaBetterSqlite3`**, calcule le chemin SQLite depuis `DATABASE_URL`, **`$disconnect`** au destroy, **`reconnect()`** pour recharger le client après copie de fichier DB. |

### `devices/`

| Fichier | Rôle |
|---------|------|
| **`devices.service.ts`** | Cœur métier appareil : lookup par MAC, association `user` / `user_device`, règles d’unicité. |
| **`devices.controller.ts`** | Endpoints `lookup` / `register` (noms exacts selon implémentation). |
| **`dto/devices.dto.ts`** | Validation des entrées (`adresse_mac`, pseudo, etc.). |

### `quizz/services/`

| Service | Rôle |
|---------|------|
| **`quizz.service.ts`** | **Façade** : les contrôleurs injectent ce service ; il **orchestre** les appels vers read / write / structure / import. |
| **`quizz-read.service.ts`** | Lectures Prisma : collections, questions, réponses, liaisons `question_collection`, tirages aléatoires / filtres, mapping vers types UI (`quizz.type.ts`). |
| **`quizz-write.service.ts`** | Mises à jour ciblées : modification / suppression de questions avec validations métier et intégrité référentielle. |
| **`quizz-structure.service.ts`** | Gestion des **modules** (niveau au-dessus des collections) : liste, création, rattachement de collections aux modules, opérations de structure catalogue. |
| **`quizz-import.parser.ts`** | **`LlmImportParser`** (`@Injectable`) : valide et normalise le **JSON** d’import (forme collections / questions / 4 réponses / une bonne réponse) **sans toucher à la DB**. |
| **`quizz-import.service.ts`** | Résolution d’utilisateur, **transactions** Prisma : création en masse de collections, questions, réponses et liens. |
| **`index.ts`** | Réexporte les services du dossier pour des imports courts dans `quizz.module.ts`. |

Fichiers **non-service** du module `quizz` :

| Fichier | Rôle |
|---------|------|
| **`quizz.controller.ts`** | Routes HTTP du domaine quiz (liste, détail, jeu, import, patch). |
| **`quizz.module.ts`** | Enregistre contrôleur + providers (façade + sous-services + parser). |
| **`quizz.type.ts`** | Types de réponse API (`CollectionUi`, `QuestionUi`, lignes module, etc.). |
| **`dto/quizz.dto.ts`** | DTO de requête (ex. patch question). |

### `stats/services/`

| Service | Rôle |
|---------|------|
| **`stats.service.ts`** | **Façade** : point d’entrée unique pour les opérations stats exposées au contrôleur. |
| **`stats-kpi-read.service.ts`** | Lecture des **`user_kpi`** (listes, filtres éventuels pour le dashboard). |
| **`stats-kpi-write.service.ts`** | Création d’enregistrements KPI avec validations (utilisateur, question, réponse, cohérence des liens). |
| **`stats-session.service.ts`** | Agrégations **sessions** : résumés par période / collection, détail d’une session. |
| **`index.ts`** | Barrel file des exports services. |

Fichiers associés : **`stats.controller.ts`**, **`stats.type.ts`**, **`dto/stats.dto.ts`**, **`stats.module.ts`**.

### `admin/`

| Fichier | Rôle |
|---------|------|
| **`admin.service.ts`** | Export de la base en **SQL** ou **JSON**, import JSON avec **merge**, import SQL avec **confirmation** explicite ; peut s’appuyer sur **`reconnect()`** après restauration. |
| **`admin.controller.ts`** | Routes sous préfixe `admin/` : téléchargement `export.sql` / `export.json`, `POST` import JSON/SQL. |
| **`admin-sql-import.ts`** | Logique bas niveau d’**exécution / parsing** de script SQL (hors controller). |
| **`admin-merge-json.ts`** | Logique de **fusion** de documents JSON importés avec l’existant. |
| **`admin.module.ts`** | Module Nest regroupant contrôleur + service admin. |

---

Pour la place du quizz dans le dépôt **servomoteur** (firmware, autres frontends), voir [`architecture.md`](../../../architecture.md) et le résumé [`../architecture.md`](../architecture.md).
