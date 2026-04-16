# Architecture du backend `quizz`

## Vue metier

Ce backend gere 3 domaines:

- `devices`: identifier un appareil par `adresse_mac` et lier cet appareil a un `user`.
- `quizz`: exposer les collections/questions/reponses et permettre import + edition.
- `stats`: enregistrer les resultats utilisateur (`user_kpi`) et reconstruire des sessions.

## Arborescence utile (modules uniquement)

```text
src/
├── devices/
│   ├── devices.module.ts
│   ├── devices.controller.ts
│   ├── devices.service.ts
│   └── dto/
│       └── devices.dto.ts
├── quizz/
│   ├── quizz.module.ts
│   ├── quizz.controller.ts
│   ├── quizz.type.ts
│   ├── dto/
│   │   └── quizz.dto.ts
│   └── services/
│       ├── index.ts
│       ├── quizz.service.ts
│       ├── quizz-read.service.ts
│       ├── quizz-write.service.ts
│       ├── quizz-import.parser.ts
│       └── quizz-import.service.ts
└── stats/
    ├── stats.module.ts
    ├── stats.controller.ts
    ├── stats.type.ts
    ├── dto/
    │   └── stats.dto.ts
    └── services/
        ├── index.ts
        ├── stats.service.ts
        ├── stats-kpi-read.service.ts
        ├── stats-kpi-write.service.ts
        └── stats-session.service.ts
```

## Module `devices`

- `devices.controller.ts`: expose `lookup` et `register` pour les appareils.
- `devices.service.ts`: coeur metier appareil:
  - verifie une `adresse_mac`
  - retrouve un user deja lie ou retourne `known: false`
  - cree un user et fait l'association `user_device` lors du register
  - bloque l'inscription si l'appareil est deja associe.
- `dto/devices.dto.ts`: impose les contraintes d'entree (`adresse_mac`, `pseudot`).
- `devices.module.ts`: compose controller + service du domaine.

## Module `quizz`

- `quizz.controller.ts`: endpoints du catalogue quiz:
  - lister/consulter collections
  - tirer des questions aleatoires
  - filtrer les questions
  - importer des questions
  - modifier/supprimer une question.
- `quizz.type.ts`: types de sortie API quiz (`CollectionUi`, `QuestionUi`, etc.).
- `dto/quizz.dto.ts`: payload de patch d'une question.
- `quizz.module.ts`: enregistre la facade et les sous-services.

### Sous-services `quizz/services`

- `quizz.service.ts` (facade): point d'entree unique du module, delegue aux sous-services.
- `quizz-read.service.ts`: lecture + mapping UI depuis les tables `ref_collection`, `quizz_question`, `quizz_reponse`, `question_collection`.
- `quizz-write.service.ts`: modifications ciblees (`updateQuestion`, `deleteQuestion`) avec validations metier.
- `quizz-import.parser.ts`: classe `LlmImportParser` (`@Injectable`) — validation / normalisation du JSON d'import (pas d'acces DB) : forme des collections, questions, 4 reponses, une seule correcte.
- `quizz-import.service.ts`: resolution `user_id`, transaction Prisma : cree collections/questions/reponses et liaisons.
- `index.ts`: centralise les exports pour des imports propres.

## Module `stats`

- `stats.controller.ts`: endpoints KPI et sessions utilisateur.
- `stats.type.ts`: types de sortie API (`UserKpiRow`, `SessionSummary`).
- `dto/stats.dto.ts`: validation d'entree pour creation de KPI.
- `stats.module.ts`: compose controller + facade + sous-services.

### Sous-services `stats/services`

- `stats.service.ts` (facade): delegue aux sous-services (meme pattern que `quizz`).
- `stats-kpi-read.service.ts`: liste les KPI utilisateur (`user_kpi`).
- `stats-kpi-write.service.ts`: creation KPI avec validations (user, question, reponse, lien).
- `stats-session.service.ts`: agregations sessions (resume par jour/collection, detail session).
- `index.ts`: exports des services.
