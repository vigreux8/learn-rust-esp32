# frontend :

le tree par composant :

```
composant/
├── composant.tsx
├── composant.métier.ts
└── composant.styles.ts <-- On met les chaînes Tailwind ici
```


pour le moment on vas mettre tout le code métier dans .métier pour y aller par étapes et voire du potentiel code redondant



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

## service worker :

- sous service qui sert le service principale

## handler

Handler (littéralement « gestionnaire » ou « celui qui manipule ») est un composant dont le rôle est de réceptionner un événement ou une donnée spécifique et de décider de la marche à suivre.

1. Son rôle conceptuel
   Le Handler est l'étape entre la réception (le Controller) et l'exécution technique (Prisma/Base de données).

Le Controller dit : "Quelqu'un a appelé la route /import-llm, voici les données."

Le Handler répond : "Ok, je m'en occupe. Je vais vérifier si ces données sont cohérentes avec notre métier, et si c'est bon, je demande au service de base de données de les enregistrer."

Le DTO, c'est le formulaire de douane : Il vérifie que tu as rempli toutes les cases (nom, prénom, âge) et que tu n'as pas mis de lettres là où on attend des chiffres. Si le formulaire est mal rempli, tu ne passes même pas la porte (Erreur 400 Bad Request).

Le Handler, c'est l'officier de police (le contrôle d'identité) : Une fois que le formulaire est propre, l'officier regarde si tu as le droit d'entrer. Il vérifie ton passé, ton identité réelle et tes autorisations.

L'ordre logique dans ton Backend :
Client (Frontend) : Envoie les données.

Pipe (Validation DTO) : Filtre les données mal formées.

Controller : Réceptionne l'appel et siffle le Handler.

Handler (La Police) : Fait ses contrôles d'identité et de droits.

Service (Prisma/Writer) : Si la police a dit "OK", il range les données dans le coffre-fort.

# aroborence et nomenclature pour le backend :

. dto/ (Data Transfer Objects)
Rôle : La douane / Le formulaire.

Contenu : Classes TypeScript utilisant class-validator.

Ce qu'il regroupe : Les schémas de données qui arrivent du Frontend via les requêtes POST, PATCH ou les Query Params.

Exemple : create-quizz.dto.ts, update-question.dto.ts.

2. services/ (Business Logic)
   Rôle : Le cerveau et les muscles.

Contenu : Classes @Injectable().

Ce qu'il regroupe : Toute la logique métier. Comme tu l'as fait, on peut le subdiviser :

core/ : Les services fondamentaux (écriture, structure, intégrité).

handlers/ : Les spécialistes d'une action précise (import LLM, export PDF).

index.ts : Pour exporter proprement tous les services.

3. interfaces/ (ou types/)
   Rôle : Le dictionnaire / Le contrat.

Contenu : interface, type, enum.

Ce qu'il regroupe : Les définitions de formes d'objets qui circulent en interne. C'est du TypeScript pur qui disparaît à la compilation.

Exemple : quizz.type.ts ou question-status.enum.ts.

4. entities/
   Rôle : Le modèle de données métier.

Contenu : Classes.

Ce qu'il regroupe : Si tu n'utilises pas directement les types de Prisma, tu crées ici des classes qui représentent tes objets réels. Dans ton cas, Prisma génère déjà tes "entities" dans @prisma/client, donc ce dossier est souvent optionnel.

5. guards/
   Rôle : La sécurité d'accès.

Contenu : Classes implémentant CanActivate.

Ce qu'il regroupe : La logique pour savoir si un utilisateur a le droit d'accéder à ce module (ex: AdminGuard, DeviceOwnerGuard).

6. decorators/
   Rôle : Les raccourcis personnalisés.

Contenu : Fonctions de décoration.

Ce qu'il regroupe : Des outils pour simplifier ton code.

Exemple : Un décorateur @GetUser() pour récupérer l'utilisateur directement dans ton contrôleur sans fouiller dans la req.

7. interceptors/
   Rôle : Le filtre de sortie/entrée.

Contenu : Classes implémentant NestInterceptor.

Ce qu'il regroupe : Transformer les données juste avant qu'elles ne sortent (ex: masquer les IDs techniques) ou logger le temps d'exécution d'une requête.

8. utils/ (ou helpers/)
   Rôle : La boîte à outils.

Contenu : Fonctions pures (sans injection de dépendance).

Ce qu'il regroupe : Des petites fonctions mathématiques, de formatage de texte ou de manipulation de dates (slugify, formatIsoDate).
mon-module/
├── dto/ # Formulaires d'entrée
├── services/ # Logique métier
│ ├── core/ # Moteur (Write, Structure)
│ ├── handlers/ # Spécialistes (Import, Task)
│ └── index.ts # Barrel file
├── interfaces/ # Types et Enums
├── guards/ # Sécurité (Qui a le droit ?)
├── decorators/ # Raccourcis personnalisés
├── mon-module.controller.ts # Routes
└── mon-module.module.ts # Configuration

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

# handler et orchestration

3. Le Handler est comme un "Contrat d'assurance"
   Imagine ton Handler comme un contrat :

Clause 1 (Validation) : Si l'utilisateur n'est pas le bon, le contrat est nul.

Clause 2 (Orchestration) : Si la clause 1 est validée, alors on exécute les travaux dans cet ordre précis.

1. La responsabilité "Scénario" (Use Case)
   Le vrai rôle de ton Handler, c'est d'être le gardien du cas d'utilisation. Pour que le scénario "Importation LLM" réussisse, il doit obligatoirement faire deux choses :

Valider que tout est en ordre (La Police).

Déclencher les actions dans le bon ordre (L'Orchestration).

Si tu séparais ces deux rôles dans deux fichiers différents, tu te retrouverais avec un code fragmenté où tu devrais sauter d'un fichier à l'autre juste pour comprendre comment une question est importée. C'est le seul endroit où on accepte ce mélange, car ils sont indissociables du "Scénario".

2. Ce qui compte, c'est ce qu'il NE fait PAS
   Pour savoir si ton Handler dépasse ses fonctions, regarde s'il touche à la technique pure.

Il ne manipule pas SQL/Prisma directement (Il délègue au writer ou à l' importService).

Il ne formate pas les données pour le Frontend (Le Controller ou le DTO s'en chargent).

Il ne gère pas les fichiers sur le disque.

Tant qu'il reste dans le domaine de la "décision" (Valider + Ordonner), il respecte le principe de clean architecture.

3. Le Handler est comme un "Contrat d'assurance"
   Imagine ton Handler comme un contrat :

Clause 1 (Validation) : Si l'utilisateur n'est pas le bon, le contrat est nul.

Clause 2 (Orchestration) : Si la clause 1 est validée, alors on exécute les travaux dans cet ordre précis.

Pourquoi c'est mieux comme ça ?
Si tu avais la validation d'un côté et l'orchestration de l'autre :

Tu pourrais oublier d'appeler la validation avant l'orchestration.

En les gardant ensemble dans le Handler, tu garantis qu'aucune action n'est lancée sans avoir été validée.
