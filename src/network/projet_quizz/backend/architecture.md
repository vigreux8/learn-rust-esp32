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
| **`admin/services/`** | Admin découpé en façade + sous-services export/import pour isoler les opérations sensibles. |
| **`quizz/services/handlers/`** | Validation amont et garde-fous avant délégation vers les services métier d’import. |
| **`quizz/services/core/`** | Noyau métier écriture/structure partagé, séparé des façades et handlers. |

## Arborescence `src/` (Code source NestJS)

```text
src/
├── main.ts                       # Point d'entrée : lance le serveur NestJS
├── app.module.ts                 # Racine de l'app : agrège tous les modules métier
├── app.controller.ts             # Contrôleur racine (health check)
├── app.service.ts                # Logique racine minimale
├── prisma/                       # Couche d'accès aux données (ORM)
│   ├── prisma.module.ts          # Export global du service Prisma
│   └── prisma.service.ts         # Gestion SQLite, adaptateur et reconnexion
├── devices/                      # Module Appareils : identification MAC -> User
│   ├── devices.module.ts         # Configuration du module
│   ├── devices.controller.ts     # Routes : enregistrement et lookup
│   ├── devices.service.ts        # Métier : unicité MAC et liens user
│   └── dto/                      # Schémas de validation entrante
│       └── devices.dto.ts        # DTO : adresse_mac, pseudo
├── quizz/                        # Module Quizz : catalogue et jeu
│   ├── quizz.module.ts           # Câblage des services (façade, core, handlers)
│   ├── quizz.controller.ts       # Routes : CRUD, jeu, imports
│   ├── quizz.type.ts             # Types partagés et modèles pour l'UI
│   ├── dto/                      # Contrats de données (Validation)
│   │   ├── quizz.dto.ts          # DTO CRUD : questions, réponses, collections
│   │   ├── import-llm.dto.ts     # DTO spécifique au format JSON LLM
│   │   └── import-collection.dto.ts # DTO spécifique à l'export d'application
│   └── services/                 # Logique métier découpée par responsabilité
│       ├── index.ts              # Export centralisé des services
│       ├── quizz.service.ts      # Façade : point d'entrée unique pour le contrôleur
│       ├── quizz-read.service.ts # Lectures Prisma : filtres, tirages, mapping UI
│       ├── quizz-import.service.ts # Exécution technique des imports massifs
│       ├── core/                 # Noyau métier (Écritures DB)
│       │   ├── quizz-write.service.ts # CRUD bas niveau : create, update, delete
│       │   └── quizz-structure.service.ts # Structure : modules et liens collections
│       └── handlers/             # Police & Ouvrier (Validation & Orchestration)
│           ├── import-llm.handler.ts # Valide et lance l'import format LLM
│           └── import-collection.handler.ts # Valide et lance l'import format App
├── stats/                        # Module Statistiques : résultats et KPIs
│   ├── stats.module.ts           # Configuration du module
│   ├── stats.controller.ts       # Routes : dashboard, historique
│   ├── stats.type.ts             # Types de données agrégées
│   ├── dto/                      # Validation des envois de scores
│   │   └── stats.dto.ts          # DTO : user_kpi, session
│   └── services/                 # Analyse des performances
│       ├── index.ts              # Export centralisé
│       ├── stats.service.ts      # Façade : orchestre les KPIs et sessions
│       ├── stats-kpi-read.service.ts # Lecture et agrégation des résultats
│       ├── stats-kpi-write.service.ts # Enregistrement sécurisé des scores
│       └── stats-session.service.ts # Logique de regroupement par session
└── admin/                        # Module Admin : maintenance base de données
    ├── admin.module.ts           # Configuration du module
    ├── admin.controller.ts       # Routes : exports et imports sensibles
    ├── dto/                      # Validation des commandes admin
    │   └── admin.dto.ts          # DTO : script SQL, token confirmation
    └── services/                 # Opérations système
        ├── index.ts              # Export centralisé
        ├── admin.service.ts      # Façade : délègue aux experts export/import
        ├── export/               # Sorties de données
        │   ├── index.ts          # Export centralisé
        │   ├── sql-exporter.service.ts # Génère un dump SQL complet
        │   └── json-exporter.service.ts # Génère un dump JSON structuré
        └── import/               # Entrées de données
            ├── index.ts          # Export centralisé
            ├── sql-replace.service.ts # Remplacement total de la DB via SQL
            └── json.merge.ts     # Fusion intelligente de données JSON
```

## Rôle des dossiers (tabulation)

| Dossier | Rôle en quelques mots |
|---------|-----------------------|
| **`dto/`** | Contrat d’entrée HTTP validé (`class-validator`). |
| **`services/`** | Services injectables Nest (orchestration + métier). |
| **`services/handlers/`** | Validation/contexte amont puis délégation métier. |
| **`services/core/`** | Noyau partagé (écriture DB, structure catalogue). |
| **`services/export/`** | Génération des sorties (SQL/JSON). |
| **`services/import/`** | Entrées sensibles (replace/merge/import massif). |

## Description des modules et fichiers (raison d’être)

### Racine `src/`

| Fichier | Rôle |
|---------|------|
| **`main.ts`** | **Lanceur** : Initialise NestJS et démarre l'écoute sur le port HTTP. |
| **`app.module.ts`** | **Racine** : Point central de l'application agrégeant tous les modules métier. |
| **`app.controller.ts`** | **Santé** : Fournit des endpoints de base (ex: health check). |

### `prisma/`

| Fichier | Rôle |
|---------|------|
| **`prisma.module.ts`** | **Exportateur** : Rend le `PrismaService` disponible globalement. |
| **`prisma.service.ts`** | **Connecteur** : Gère SQLite (`better-sqlite3`), le cycle de vie et la reconnexion. |

### `devices/`

| Fichier | Rôle |
|---------|------|
| **`devices.service.ts`** | **Métier** : Gère l'identification des appareils (MAC) et les liens utilisateurs. |
| **`devices.controller.ts`** | **API** : Expose les routes d'enregistrement et de recherche d'appareils. |
| **`dto/devices.dto.ts`** | **Contrat** : Valide les données d'entrée (adresse_mac, pseudo). |

### `quizz/services/`

| Service | Rôle |
|---------|------|
| **`quizz.service.ts`** | **Façade** : Point d’entrée unique pour le contrôleur ; il **orchestre** les appels. |
| **`quizz-read.service.ts`** | **Lecteur** : Récupère les données (filtres, tirages) et les mappe pour l'UI. |
| **`quizz-import.service.ts`** | **Ouvrier** : Exécution technique des imports en transaction Prisma (insertion en masse). |
| **`core/quizz-write.service.ts`** | **Noyau** : Écritures DB bas niveau (create/update/delete) et insertion atomique. |
| **`core/quizz-structure.service.ts`** | **Noyau** : Gestion de l'arborescence (modules et rattachements de collections). |
| **`handlers/import-llm.handler.ts`** | **Police** : Valide le contexte LLM (user, catégorie) avant de lancer l'ouvrier. |
| **`handlers/import-collection.handler.ts`** | **Police** : Valide le contexte "collection app" avant de lancer l'ouvrier. |
| **`index.ts`** | **Index** : Réexporte les services pour simplifier les imports du module. |

Fichiers **non-service** du module `quizz` :

| Fichier | Rôle |
|---------|------|
| **`quizz.controller.ts`** | **API** : Définit les routes HTTP (CRUD, jeu, imports). |
| **`quizz.module.ts`** | **Câblage** : Enregistre le contrôleur et injecte tous les services. |
| **`quizz.type.ts`** | **Modèles** : Définit les types de données renvoyés au frontend (UI). |
| **`dto/quizz.dto.ts`** | **Contrat** : Valide les requêtes CRUD classiques. |
| **`dto/import-llm.dto.ts`** | **Contrat** : Valide spécifiquement le format JSON généré par LLM. |
| **`dto/import-collection.dto.ts`** | **Contrat** : Valide spécifiquement le format d'export de l'application. |

### `stats/services/`

| Service | Rôle |
|---------|------|
| **`stats.service.ts`** | **Façade** : Point d’entrée unique pour les statistiques et sessions. |
| **`stats-kpi-read.service.ts`** | **Lecteur** : Calcule et agrège les résultats (KPIs) pour le dashboard. |
| **`stats-kpi-write.service.ts`** | **Écrivain** : Enregistre les réponses et scores de manière sécurisée. |
| **`stats-session.service.ts`** | **Métier** : Gère le regroupement des réponses par session de jeu. |

### `admin/`

| Fichier | Rôle |
|---------|------|
| **`admin/services/admin.service.ts`** | **Façade** : Orchestre les opérations de maintenance système. |
| **`admin.controller.ts`** | **API** : Expose les routes d'export et d'import de la base. |
| **`admin/services/export/sql-exporter.service.ts`** | **Expert** : Génère un dump SQL complet de la base SQLite. |
| **`admin/services/export/json-exporter.service.ts`** | **Expert** : Génère un dump JSON structuré de toutes les tables. |
| **`admin/services/import/sql-replace.service.ts`** | **Expert** : Remplace la base actuelle par un script SQL (dangereux). |
| **`admin/services/import/json.merge.ts`** | **Expert** : Fusionne intelligemment des données JSON avec l'existant. |
| **`admin/dto/admin.dto.ts`** | **Contrat** : Valide les commandes d'import (script, confirmation). |
| **`admin.module.ts`** | **Câblage** : Regroupe la logique d'administration. |

---

Pour la place du quizz dans le dépôt **servomoteur** (firmware, autres frontends), voir [`architecture.md`](../../../architecture.md) et le résumé [`../architecture.md`](../architecture.md).
