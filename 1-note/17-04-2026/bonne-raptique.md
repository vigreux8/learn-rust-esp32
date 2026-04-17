# frontend :

# backend

## note structure :

1. Le DTO : "Le Contrat de la Porte" (Entrée)
   Le DTO (Data Transfer Object) sert principalement à définir ce que le Frontend envoie au Backend.

Rôle : C'est un vigile. Il vérifie que les données qui arrivent de l'extérieur (via une requête POST ou PATCH) sont conformes (ex: "est-ce que l'email est valide ?", "est-ce que le champ n'est pas vide ?").

Usage : On l'utilise dans le Controller et on le passe au Service.

Techno : Dans NestJS, on utilise des Classes avec class-validator pour que la validation se fasse automatiquement.

2. Le Type : "Le Langage Interne" (Backend)
   Le fichier .type.ts sert à définir comment les données circulent entre tes fichiers à l'intérieur du Backend.

Rôle : Il aide le développeur (toi) à ne pas faire d'erreurs dans la manipulation des objets.

Usage : Entre deux services, ou pour définir des objets complexes qui ne viennent pas forcément d'une requête HTTP (ex: un résultat de calcul, une structure de log).

Techno : Ce sont des interfaces ou des types TypeScript (ils disparaissent à la compilation).

### bonne pratique :

Le nom de ce principe est le SRP, pour Single Responsibility Principle (Principe de Responsabilité Unique).

C’est le "S" de l'acronyme SOLID, qui regroupe les cinq principes de base de la programmation orientée objet et du design logiciel de qualité.

### le flux :

Direction,Objet utilisé,Pourquoi ?
Front → Back (Requête),DTO (Classe),Pour valider les données entrantes.
Back ↔ Back (Interne),Type / Interface,Pour sécuriser le développement entre tes services.
Back → Front (Réponse),Type / DTO,Pour garantir au Front la structure de la réponse.

# note cours :

quizz/
├── quizz.module.ts <-- Déclare tout
├── quizz.controller.ts <-- Reçoit les requêtes
├── quizz.type.ts (ou interface) <-- Contrats internes
├── dto/
│ └── create-quizz.dto.ts
└── services/ <-- Tous tes services ici
├── index.ts <-- Le "Barrel file"
├── quizz.service.ts <-- Service principal
├── quizz-import.service.ts <-- Service worker
└── quizz-write.service.ts <-- Service worker

# todo :

Puisque tu es en TypeScript des deux côtés (Preact et NestJS), l'idéal est de créer un dossier de types partagés (souvent appelé shared ou libs/types).

Tu définis ton interface Quizz une seule fois.

Le Backend l'utilise pour garantir sa réponse.

Le Frontend l'utilise pour savoir ce qu'il va afficher.
projet_quizz/
├── backend/
├── frontend/
└── shared/ <-- Nouveau dossier
└── types/
├── quizz.ts (ex: interface Quizz, Question)
├── stats.ts (ex: interface KPI)
└── index.ts (pour tout exporter)
