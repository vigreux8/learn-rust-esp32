-- Export SQL genere par FlowLearn
-- Source: /Users/vigreu8/Documents/2.code/1-formation-udemy/rust/servomoteur/src/network/projet_quizz/backend/quizz.db
-- Date: 2026-04-16T13:44:24.761Z
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE "collection_story" (
  "id" INTEGER NOT NULL UNIQUE,
  "nom" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  PRIMARY KEY("id")
);

CREATE TABLE "device" (
	"id" INTEGER NOT NULL UNIQUE,
	"adresse_mac" TEXT NOT NULL,
	PRIMARY KEY("id")
);
INSERT INTO "device" ("id", "adresse_mac") VALUES (1, 'DE:AD:BE:EF:00:01');

CREATE TABLE "question_collection" (
	"id" INTEGER NOT NULL UNIQUE,
	"collection_id" INTEGER NOT NULL,
	"question_id" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("collection_id") REFERENCES "quizz_collection"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("question_id") REFERENCES "quizz_question"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (22, 4, 22);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (23, 4, 23);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (24, 4, 24);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (25, 4, 25);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (26, 4, 26);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (27, 4, 27);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (28, 4, 28);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (29, 4, 29);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (30, 4, 30);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (31, 4, 31);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (32, 4, 32);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (33, 4, 33);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (34, 4, 34);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (35, 4, 35);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (36, 4, 36);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (47, 4, 47);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (48, 4, 48);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (49, 4, 49);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (50, 4, 50);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (51, 4, 51);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (52, 4, 52);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (53, 4, 53);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (54, 4, 54);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (55, 4, 55);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (56, 4, 56);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (57, 4, 57);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (58, 4, 58);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (59, 4, 59);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (60, 4, 60);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (61, 4, 61);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (62, 4, 62);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (63, 4, 63);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (64, 4, 64);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (65, 4, 65);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (66, 4, 66);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (67, 5, 67);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (68, 5, 68);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (69, 5, 69);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (70, 5, 70);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (71, 5, 71);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (72, 5, 72);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (73, 5, 73);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (74, 5, 74);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (75, 5, 75);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (76, 5, 76);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (77, 5, 77);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (78, 5, 78);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (79, 5, 79);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (80, 5, 80);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (81, 5, 81);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (82, 5, 82);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (83, 5, 83);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (84, 5, 84);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (85, 5, 85);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (86, 5, 86);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (87, 5, 87);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (88, 5, 88);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (89, 5, 89);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (90, 5, 90);
INSERT INTO "question_collection" ("id", "collection_id", "question_id") VALUES (91, 5, 91);

CREATE TABLE "quizz_collection" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"create_at" TEXT NOT NULL,
	"update_at" TEXT NOT NULL,
	"nom" TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "user"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);
INSERT INTO "quizz_collection" ("id", "user_id", "create_at", "update_at", "nom") VALUES (4, 1, '2026-04-12T15:22:56.975Z', '2026-04-12T17:12:35.952Z', 'histoire-javascript');
INSERT INTO "quizz_collection" ("id", "user_id", "create_at", "update_at", "nom") VALUES (5, 1, '2026-04-16T10:42:12.270Z', '2026-04-16T11:46:57.950Z', 'statique');

CREATE TABLE "quizz_module" (
	"id" INTEGER NOT NULL UNIQUE,
	"nom" TEXT NOT NULL,
	"create_at" TEXT NOT NULL,
	"update_at" TEXT NOT NULL,
	PRIMARY KEY("id")
);
INSERT INTO "quizz_module" ("id", "nom", "create_at", "update_at") VALUES (2, 'informatique', '2026-04-12T15:23:35.779Z', '2026-04-12T15:23:35.779Z');
INSERT INTO "quizz_module" ("id", "nom", "create_at", "update_at") VALUES (3, 'math', '2026-04-16T10:41:42.370Z', '2026-04-16T10:41:42.370Z');

CREATE TABLE "quizz_module_collection" (
	"id" INTEGER NOT NULL UNIQUE,
	"module_id" INTEGER NOT NULL,
	"collection_id" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("module_id") REFERENCES "quizz_module"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("collection_id") REFERENCES "quizz_collection"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);
INSERT INTO "quizz_module_collection" ("id", "module_id", "collection_id") VALUES (5, 2, 4);
INSERT INTO "quizz_module_collection" ("id", "module_id", "collection_id") VALUES (6, 3, 5);

CREATE TABLE "quizz_question" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"categorie_id" INTEGER NOT NULL,
	"create_at" TEXT NOT NULL,
	"question" TEXT NOT NULL,
	"commentaire" TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "user"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("categorie_id") REFERENCES "ref_categorie"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (22, 1, 1, '2026-04-12T15:56:42.933Z', 'En quelle année et en combien de temps Brendan Eich a-t-il créé la première version de JavaScript ?', 'Initialement nommé Mocha, le langage a été conçu dans l''urgence pour doter le navigateur Netscape d''un langage de script léger.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (23, 1, 1, '2026-04-12T15:56:42.933Z', 'Quel était le nom commercial de JavaScript lors de sa première intégration dans Netscape Navigator 2.0 beta ?', 'Le nom a rapidement changé pour surfer sur la popularité de Java, bien que les deux langages n''aient aucun lien de parenté technique.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (24, 1, 1, '2026-04-12T15:56:42.933Z', 'Comment s''appelait la version de JavaScript développée par Microsoft pour Internet Explorer 3.0 en 1996 ?', 'Pour éviter les problèmes de marque déposée avec Sun Microsystems, Microsoft a procédé à du reverse-engineering pour créer son propre dialecte.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (25, 1, 1, '2026-04-12T15:56:42.933Z', 'Quel organisme a été chargé de standardiser le langage à partir de 1997 ?', 'C''est pour cette raison que le nom officiel du standard est ECMAScript, alors que JavaScript reste une marque commerciale.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (26, 1, 1, '2026-04-12T15:56:42.933Z', 'Quelle technologie apparue vers 2005 a relancé l''intérêt pour JS en permettant de mettre à jour une page sans la recharger ?', 'Popularisé par Google Maps et Gmail, ce concept repose sur l''objet XMLHttpRequest pour échanger des données avec le serveur.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (27, 1, 1, '2026-04-12T15:56:42.933Z', 'En 2008, quel moteur de rendu JavaScript a révolutionné les performances grâce à la compilation JIT (Just-In-Time) ?', 'Développé par Google pour Chrome, ce moteur a prouvé que JS pouvait être extrêmement rapide, ouvrant la voie à des applications complexes.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (28, 1, 1, '2026-04-12T15:56:42.933Z', 'Quelle année marque la sortie de Node.js, permettant d''utiliser JavaScript côté serveur ?', 'Ryan Dahl a utilisé le moteur V8 pour créer cet environnement d''exécution, brisant la barrière du navigateur.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (29, 1, 1, '2026-04-12T15:56:42.933Z', 'Quelle version d''ECMAScript, publiée en 2009, a introduit le ''Strict Mode'' et le support natif du JSON ?', 'Cette version a stabilisé le langage après l''échec d''ES4 qui était jugé trop complexe et ambitieux.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (30, 1, 1, '2026-04-12T15:56:42.933Z', 'Quelle mise à jour majeure de 2015 a introduit les classes, les ''arrow functions'' et les promesses ?', 'Souvent appelée ES6, elle représente la plus grande évolution syntaxique de l''histoire du langage.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (31, 1, 1, '2026-04-12T15:56:42.933Z', 'Comment appelle-t-on le comité technique responsable de l''évolution des spécifications de JavaScript ?', 'Ce groupe réunit des délégués des grands navigateurs et d''autres acteurs majeurs du web pour voter les nouvelles fonctionnalités.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (32, 1, 1, '2026-04-12T15:56:42.933Z', 'Quel outil est devenu indispensable vers 2015 pour convertir le code JS moderne en code compatible avec les vieux navigateurs ?', 'C''est un ''transpiler'' qui permet d''utiliser les dernières nouveautés sans attendre que tous les navigateurs soient à jour.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (33, 1, 1, '2026-04-12T15:56:42.933Z', 'En 2017, quelle fonctionnalité majeure a été ajoutée pour simplifier l''écriture du code asynchrone ?', 'Cette syntaxe permet d''écrire du code asynchrone qui ressemble à du code synchrone, facilitant grandement la lecture.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (34, 1, 1, '2026-04-12T15:56:42.933Z', 'Quelle entreprise a créé TypeScript en 2012 pour ajouter un typage statique à JavaScript ?', 'Bien que JS soit dynamiquement typé, le succès de TypeScript montre le besoin de sécurité dans les gros projets industriels.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (35, 1, 1, '2026-04-12T15:56:42.933Z', 'Quel format de module standard (ESM) est devenu natif dans les navigateurs modernes pour remplacer CommonJS ?', 'L''utilisation de ''import'' et ''export'' est désormais la norme officielle définie par le standard ECMAScript.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (36, 1, 1, '2026-04-12T15:56:42.933Z', 'Comment s''appelle l''environnement d''exécution créé par Brendan Eich en 2018 pour corriger les défauts de conception de Node.js ?', 'Sécurisé par défaut et supportant nativement TypeScript, ce projet vise à moderniser l''usage de JS hors du navigateur.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (47, 1, 1, '2026-04-12T16:47:52.630Z', 'En 1995, combien de temps a-t-il fallu à Brendan Eich pour concevoir la première version de JavaScript ?', 'Initialement nommé Mocha, le langage a été créé dans l''urgence pour Netscape Navigator afin d''apporter de l''interactivité au Web sans attendre Java.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (48, 1, 1, '2026-04-12T16:47:52.630Z', 'Pourquoi le langage a-t-il été renommé ''JavaScript'' peu après sa création sous le nom de LiveScript ?', 'Il s''agissait d''une stratégie marketing pour surfer sur la popularité fulgurante du langage Java à l''époque, bien que les deux soient techniquement très différents.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (49, 1, 1, '2026-04-12T16:47:52.630Z', 'Quel standard a été créé en 1997 pour garantir l''interopérabilité de JavaScript entre les différents navigateurs ?', 'L''organisme Ecma International a été chargé de standardiser le langage, d''où le nom officiel ECMAScript utilisé pour les spécifications.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (50, 1, 1, '2026-04-12T16:47:52.630Z', 'Quelle technologie popularisée en 2005 par Jesse James Garrett a permis de charger des données sans recharger la page ?', 'Cette approche utilise l''objet XMLHttpRequest pour créer des applications web asynchrones et fluides comme Google Maps.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (51, 1, 1, '2026-04-12T16:47:52.630Z', 'Quelle bibliothèque lancée en 2006 a dominé le développement web en simplifiant la manipulation du DOM et les requêtes HTTP ?', 'Avec son slogan ''Write Less, Do More'', elle a résolu de nombreux problèmes de compatibilité entre Internet Explorer et les autres navigateurs.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (52, 1, 1, '2026-04-12T16:47:52.630Z', 'Quel moteur, intégré à Google Chrome en 2008, a révolutionné les performances d''exécution du JavaScript ?', 'En compilant le JavaScript directement en code machine, ce moteur a permis d''envisager des applications web extrêmement complexes.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (53, 1, 1, '2026-04-12T16:47:52.630Z', 'En 2009, Ryan Dahl crée Node.js. Quelle était la rupture majeure apportée par cet outil ?', 'Node.js a permis d''utiliser JavaScript pour coder des serveurs et des outils système, sortant ainsi le langage du seul périmètre du navigateur.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (54, 1, 1, '2026-04-12T16:47:52.630Z', 'Quelle version d''ECMAScript publiée en 2015 a introduit les classes, les ''arrow functions'' et les promesses ?', 'Cette mise à jour majeure a modernisé la syntaxe et rendu le développement d''applications de grande envergure beaucoup plus structuré.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (55, 1, 1, '2026-04-12T16:47:52.630Z', 'Quel framework créé par Facebook en 2013 a introduit le concept de Virtual DOM ?', 'Cette bibliothèque a changé la façon de concevoir les interfaces en favorisant une approche déclarative et par composants.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (56, 1, 1, '2026-04-12T16:47:52.630Z', 'Quel langage développé par Microsoft est devenu un standard de fait pour ajouter un typage statique à JavaScript ?', 'Il s''agit d''un sur-ensemble (superset) de JavaScript qui compile vers du JavaScript standard pour sécuriser les gros projets.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (57, 1, 2, '2026-04-12T16:48:57.539Z', 'En 1995, comment Netscape a-t-il positionné JavaScript par rapport à Java pour inciter les développeurs à l''utiliser ?', 'Le langage était présenté comme un outil de script léger pour les designers web, agissant comme un ''liant'' entre les composants Java plus complexes.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (58, 1, 2, '2026-04-12T16:48:57.539Z', 'Quelle pratique est devenue possible en 2005 grâce à l''émergence d''AJAX dans les applications web ?', 'Cette approche a permis de mettre à jour des parties d''une page sans nécessiter un rechargement complet du navigateur, améliorant radicalement l''expérience utilisateur.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (59, 1, 2, '2026-04-12T16:48:57.539Z', 'À partir de 2009, quel cas d''usage inédit Node.js a-t-il ouvert pour les développeurs JavaScript ?', 'En utilisant le moteur V8 hors du navigateur, JavaScript a pu être appliqué à la logique serveur et à l''accès aux fichiers système.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (60, 1, 2, '2026-04-12T16:48:57.539Z', 'Comment l''arrivée d''ES6 (ECMAScript 2015) a-t-elle concrètement facilité la gestion des dépendances dans les projets ?', 'Avant ce standard, il fallait souvent utiliser des bibliothèques tierces pour organiser son code en fichiers séparés et réutilisables.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (61, 1, 2, '2026-04-12T16:48:57.539Z', 'Dans quel contexte l''utilisation de TypeScript est-elle particulièrement recommandée par rapport au JavaScript historique ?', 'Son système de types permet de détecter des erreurs dès la phase d''écriture, ce qui sécurise la maintenance de larges bases de code.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (62, 1, 2, '2026-04-12T17:12:35.952Z', 'Une startup de 2025 doit migrer un monolithe Node.js critique vers une architecture haute performance. Quel moteur d''exécution privilégier pour garantir une compatibilité native avec l''API Web et une vitesse de démarrage supérieure à V8 ?', 'Bun utilise JavaScriptCore (le moteur de Safari) plutôt que V8, offrant des temps de démarrage nettement plus rapides et une gestion native du TypeScript sans compilation externe.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (63, 1, 2, '2026-04-12T17:12:35.952Z', 'Un client historique utilise une application complexe sous AngularJS (v1). Pour une transition progressive en 2025 sans tout réécrire, quel outil de build est le plus adapté pour mixer code legacy et modules ESM modernes ?', 'Vite repose sur les modules ES natifs du navigateur pour le développement, ce qui permet d''isoler le code moderne tout en déléguant le bundling complexe à Rollup pour la production.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (64, 1, 2, '2026-04-12T17:12:35.952Z', 'Vous travaillez pour un entrepreneur dont l''application de trading nécessite une latence minimale. Quel compilateur JS ''Just-In-Time'' (JIT) est responsable de l''optimisation par spéculation de type dans l''environnement Chrome/Node ?', 'TurboFan est le compilateur d''optimisation de dernière génération de V8 qui transforme le Bytecode en code machine hautement optimisé selon les types de données observés.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (65, 1, 2, '2026-04-12T17:12:35.952Z', 'Une fintech exige que son code TypeScript soit vérifié mais déployé instantanément sans étape de build visible. Quelle solution logicielle intégrée permet d''exécuter du TS nativement via l''isolement V8 en 2025 ?', 'Deno intègre nativement le support de TypeScript et met l''accent sur la sécurité par défaut, supprimant le besoin de configurer manuellement un pipeline Babel/TSC complexe.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (66, 1, 2, '2026-04-12T17:12:35.952Z', 'Pour optimiser le SEO et la vitesse d''une plateforme e-commerce en 2025, quel compilateur de framework utilise l''analyse statique pour éliminer totalement le runtime JavaScript côté client (Zero-bundle size) ?', 'Contrairement aux frameworks traditionnels, Qwik utilise la ''resumability'' pour retarder l''exécution du JS, tandis qu''Astro permet de livrer du HTML pur avec des îlots d''interactivité uniquement si nécessaire.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (67, 1, 1, '2026-04-16T10:43:27.312Z', 'En quelle année John Graunt a-t-il publié les premières analyses de données de mortalité à Londres ?', 'Considéré comme le père de la démographie, il a analysé les Bulletins de mortalité pour identifier des régularités biologiques.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (68, 1, 1, '2026-04-16T10:43:27.312Z', 'Quel savant a formalisé la loi normale (courbe en cloche) au début du XIXe siècle ?', 'Bien que De Moivre l''ait approchée, c''est ce mathématicien allemand qui en a fait un outil central de l''astronomie et des probabilités.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (69, 1, 1, '2026-04-16T10:43:27.312Z', 'À quel statisticien belge doit-on le concept de ''l''homme moyen'' vers 1835 ?', 'Il a appliqué les méthodes statistiques aux sciences sociales, cherchant à définir les caractéristiques moyennes d''une population.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (70, 1, 1, '2026-04-16T10:43:27.312Z', 'Quand le terme ''Statistique'' a-t-il été popularisé par Gottfried Achenwall ?', 'À l''origine, ce terme désignait la science de l''État et l''inventaire des ressources d''une nation.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (71, 1, 1, '2026-04-16T10:43:27.312Z', 'Quel test statistique célèbre a été publié par William Sealy Gosset sous le pseudonyme ''Student'' en 1908 ?', 'Employé chez Guinness, il ne pouvait pas publier sous son vrai nom pour protéger des secrets de fabrication.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (72, 1, 1, '2026-04-16T10:43:27.312Z', 'Qui a introduit le coefficient de corrélation et le concept de régression vers la fin du XIXe siècle ?', 'Cousin de Darwin, il s''intéressait à l''hérédité et a posé les bases de la biométrie moderne.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (73, 1, 1, '2026-04-16T10:43:27.312Z', 'En quelle année Ronald Fisher a-t-il publié ''Statistical Methods for Research Workers'', révolutionnant l''inférence ?', 'Ce livre a imposé l''utilisation des tests de signification et de la p-value dans la recherche scientifique.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (74, 1, 1, '2026-04-16T10:43:27.312Z', 'Quelle avancée majeure date de 1763, après la mort de son auteur Thomas Bayes ?', 'Son essai posthume permet de calculer la probabilité d''une cause à partir d''un effet observé.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (75, 1, 1, '2026-04-16T10:43:27.312Z', 'Quel institut national français a succédé au Service National des Statistiques en 1946 ?', 'Créé juste après la guerre, il centralise les données économiques et démographiques de la France.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (76, 1, 1, '2026-04-16T10:43:27.312Z', 'Qui a publié ''The Design of Experiments'' en 1935, introduisant l''idée de randomisation ?', 'Il a prouvé que l''assignation aléatoire des sujets est cruciale pour valider les résultats d''une expérience.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (77, 1, 2, '2026-04-16T11:35:34.332Z', 'Un test de diagnostic pour une maladie rare a une sensibilité de 99% et une spécificité de 95%. Si la prévalence de la maladie est de 0,1%, quelle est la probabilité qu''un individu testé positif soit réellement atteint ?', 'C''est le paradoxe du faux positif : même avec un test très fiable, une maladie rare entraîne une faible valeur prédictive positive à cause de la loi de Bayes.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (78, 1, 2, '2026-04-16T11:35:34.332Z', 'Dans le problème de Monty Hall, vous avez trois portes. Derrière l''une se trouve une voiture. Vous choisissez la porte 1. L''animateur ouvre la porte 3 (qui est vide). Que devez-vous faire pour maximiser vos chances ?', 'Changer de porte double vos chances de gain, passant de 1/3 à 2/3, car l''ouverture de l''animateur n''est pas aléatoire.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (79, 1, 2, '2026-04-16T11:35:34.332Z', 'Une usine produit des pièces avec un taux de défaut de 5%. Si vous prélevez un échantillon aléatoire de 10 pièces, quelle loi de probabilité devez-vous utiliser pour calculer la chance d''avoir exactement 2 pièces défectueuses ?', 'La loi binomiale est l''outil standard pour modéliser le nombre de succès (ou d''échecs) dans une série de tirages indépendants avec remise.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (80, 1, 2, '2026-04-16T11:35:34.332Z', 'Vous lancez deux dés équilibrés à 6 faces. On vous annonce que la somme est supérieure à 9. Quelle est la probabilité que l''un des dés affiche un 6 ?', 'Il s''agit d''une probabilité conditionnelle. L''univers des possibles est réduit aux combinaisons (4,6), (5,5), (5,6), (6,4), (6,5) et (6,6).');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (81, 1, 2, '2026-04-16T11:35:34.332Z', 'Un standardiste reçoit en moyenne 3 appels par heure. Quelle est la probabilité qu''il ne reçoive aucun appel durant la prochaine heure ?', 'La loi de Poisson permet de calculer la probabilité d''un nombre d''événements se produisant dans un intervalle de temps fixe.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (82, 1, 2, '2026-04-16T11:35:34.332Z', 'Une famille a deux enfants. Vous savez que l''un d''eux est un garçon. Quelle est la probabilité que l''autre soit aussi un garçon ?', 'En excluant la fille-fille, il reste Garçon-Garçon, Garçon-Fille, et Fille-Garçon. Seul un cas sur trois correspond à deux garçons.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (83, 1, 2, '2026-04-16T11:35:34.332Z', 'Dans un jeu, vous gagnez 10€ avec une probabilité de 0,2 et perdez 2€ avec une probabilité de 0,8. Quelle est l''espérance mathématique de ce jeu ?', 'L''espérance se calcule en sommant chaque gain multiplié par sa probabilité. Un résultat positif indique un jeu théoriquement avantageux.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (84, 1, 2, '2026-04-16T11:35:34.332Z', 'Vous tirez 2 cartes d''un jeu de 52 cartes sans remise. Quelle est la probabilité d''obtenir deux As ?', 'Sans remise, le nombre total de cartes et le nombre d''As diminuent au second tirage : (4/52) multiplié par (3/51).');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (85, 1, 2, '2026-04-16T11:35:34.332Z', 'Quelle loi de probabilité est la plus adaptée pour modéliser le temps d''attente entre deux arrivées de clients dans une file ?', 'La loi exponentielle est utilisée pour modéliser le temps s''écoulant entre deux événements aléatoires indépendants.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (86, 1, 2, '2026-04-16T11:35:34.332Z', 'On jette une pièce de monnaie jusqu''à obtenir ''Pile''. Quelle est la loi qui décrit le nombre de lancers nécessaires ?', 'La loi géométrique modélise le rang du premier succès dans une répétition d''épreuves de Bernoulli indépendantes.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (87, 1, 2, '2026-04-16T11:46:57.950Z', 'Un capteur de givrage moteur a une probabilité de 0,05 de déclencher une fausse alerte. Sur 20 vols indépendants, quelle est la probabilité d''observer au moins une fausse alerte ?', 'Ce calcul repose sur l''événement complémentaire (1 - P(0 alerte)), illustrant pourquoi la répétition de risques faibles finit par rendre l''incident probable.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (88, 1, 2, '2026-04-16T11:46:57.950Z', 'Le temps moyen entre deux pannes (MTBF) d''un transpondeur suit une loi exponentielle. Si la moyenne est de 1000 heures, quelle est la probabilité qu''il tombe en panne avant 500 heures ?', 'La loi exponentielle modélise le temps d''attente avant un événement ; ici, on utilise la fonction de répartition F(t) = 1 - exp(-lambda * t).');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (89, 1, 2, '2026-04-16T11:46:57.950Z', 'Une compagnie estime qu''un passager sur 1000 ne se présente pas à l''embarquement. Pour un vol de 300 places, quelle loi permet d''estimer rapidement le risque de surbooking si l''on vend 302 billets ?', 'Lorsque n est grand et p est très petit, la loi de Poisson est une excellente approximation de la loi binomiale pour simplifier les calculs de gestion de flux.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (90, 1, 2, '2026-04-16T11:46:57.950Z', 'Un système de navigation redondant utilise trois calculateurs indépendants. La probabilité de défaillance d''un seul est de 0,1. Le système échoue si au moins deux calculateurs tombent en panne. Quelle est la probabilité d''échec global ?', 'Il s''agit d''additionner les probabilités d''avoir exactement 2 pannes et 3 pannes (schéma de Bernoulli), démontrant l''efficacité de la redondance.');
INSERT INTO "quizz_question" ("id", "user_id", "categorie_id", "create_at", "question", "commentaire") VALUES (91, 1, 2, '2026-04-16T11:46:57.950Z', 'Lors de l''analyse d''incidents, vous observez que les erreurs de pilotage sont plus fréquentes sur les appareils récents. Vous réalisez que les pilotes expérimentés ne volent que sur les anciens modèles. Quel biais statistique est ici illustré ?', 'Le paradoxe de Simpson survient lorsqu''une tendance apparaît dans plusieurs groupes de données mais s''inverse lorsque les groupes sont combinés à cause d''une variable cachée.');

CREATE TABLE "quizz_question_reponse" (
	"id" INTEGER NOT NULL UNIQUE,
	"question_id" INTEGER NOT NULL,
	"reponse_id" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("question_id") REFERENCES "quizz_question"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("reponse_id") REFERENCES "quizz_reponse"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (85, 22, 85);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (86, 22, 86);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (87, 22, 87);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (88, 22, 88);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (89, 23, 89);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (90, 23, 90);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (91, 23, 91);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (92, 23, 92);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (93, 24, 93);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (94, 24, 94);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (95, 24, 95);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (96, 24, 96);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (97, 25, 97);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (98, 25, 98);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (99, 25, 99);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (100, 25, 100);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (101, 26, 101);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (102, 26, 102);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (103, 26, 103);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (104, 26, 104);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (105, 27, 105);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (106, 27, 106);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (107, 27, 107);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (108, 27, 108);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (109, 28, 109);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (110, 28, 110);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (111, 28, 111);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (112, 28, 112);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (113, 29, 113);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (114, 29, 114);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (115, 29, 115);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (116, 29, 116);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (117, 30, 117);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (118, 30, 118);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (119, 30, 119);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (120, 30, 120);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (121, 31, 121);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (122, 31, 122);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (123, 31, 123);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (124, 31, 124);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (125, 32, 125);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (126, 32, 126);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (127, 32, 127);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (128, 32, 128);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (129, 33, 129);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (130, 33, 130);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (131, 33, 131);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (132, 33, 132);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (133, 34, 133);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (134, 34, 134);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (135, 34, 135);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (136, 34, 136);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (137, 35, 137);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (138, 35, 138);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (139, 35, 139);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (140, 35, 140);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (141, 36, 141);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (142, 36, 142);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (143, 36, 143);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (144, 36, 144);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (185, 47, 185);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (186, 47, 186);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (187, 47, 187);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (188, 47, 188);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (189, 48, 189);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (190, 48, 190);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (191, 48, 191);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (192, 48, 192);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (193, 49, 193);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (194, 49, 194);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (195, 49, 195);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (196, 49, 196);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (197, 50, 197);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (198, 50, 198);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (199, 50, 199);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (200, 50, 200);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (201, 51, 201);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (202, 51, 202);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (203, 51, 203);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (204, 51, 204);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (205, 52, 205);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (206, 52, 206);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (207, 52, 207);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (208, 52, 208);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (209, 53, 209);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (210, 53, 210);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (211, 53, 211);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (212, 53, 212);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (213, 54, 213);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (214, 54, 214);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (215, 54, 215);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (216, 54, 216);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (217, 55, 217);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (218, 55, 218);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (219, 55, 219);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (220, 55, 220);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (221, 56, 221);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (222, 56, 222);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (223, 56, 223);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (224, 56, 224);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (225, 57, 225);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (226, 57, 226);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (227, 57, 227);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (228, 57, 228);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (229, 58, 229);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (230, 58, 230);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (231, 58, 231);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (232, 58, 232);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (233, 59, 233);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (234, 59, 234);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (235, 59, 235);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (236, 59, 236);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (237, 60, 237);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (238, 60, 238);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (239, 60, 239);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (240, 60, 240);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (241, 61, 241);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (242, 61, 242);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (243, 61, 243);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (244, 61, 244);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (245, 62, 245);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (246, 62, 246);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (247, 62, 247);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (248, 62, 248);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (249, 63, 249);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (250, 63, 250);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (251, 63, 251);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (252, 63, 252);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (253, 64, 253);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (254, 64, 254);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (255, 64, 255);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (256, 64, 256);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (257, 65, 257);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (258, 65, 258);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (259, 65, 259);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (260, 65, 260);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (261, 66, 261);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (262, 66, 262);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (263, 66, 263);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (264, 66, 264);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (265, 67, 265);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (266, 67, 266);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (267, 67, 267);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (268, 67, 268);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (269, 68, 269);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (270, 68, 270);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (271, 68, 271);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (272, 68, 272);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (273, 69, 273);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (274, 69, 274);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (275, 69, 275);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (276, 69, 276);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (277, 70, 277);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (278, 70, 278);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (279, 70, 279);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (280, 70, 280);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (281, 71, 281);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (282, 71, 282);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (283, 71, 283);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (284, 71, 284);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (285, 72, 285);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (286, 72, 286);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (287, 72, 287);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (288, 72, 288);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (289, 73, 289);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (290, 73, 290);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (291, 73, 291);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (292, 73, 292);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (293, 74, 293);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (294, 74, 294);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (295, 74, 295);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (296, 74, 296);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (297, 75, 297);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (298, 75, 298);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (299, 75, 299);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (300, 75, 300);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (301, 76, 301);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (302, 76, 302);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (303, 76, 303);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (304, 76, 304);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (305, 77, 305);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (306, 77, 306);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (307, 77, 307);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (308, 77, 308);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (309, 78, 309);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (310, 78, 310);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (311, 78, 311);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (312, 78, 312);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (313, 79, 313);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (314, 79, 314);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (315, 79, 315);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (316, 79, 316);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (317, 80, 317);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (318, 80, 318);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (319, 80, 319);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (320, 80, 320);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (321, 81, 321);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (322, 81, 322);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (323, 81, 323);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (324, 81, 324);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (325, 82, 325);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (326, 82, 326);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (327, 82, 327);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (328, 82, 328);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (329, 83, 329);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (330, 83, 330);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (331, 83, 331);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (332, 83, 332);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (333, 84, 333);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (334, 84, 334);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (335, 84, 335);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (336, 84, 336);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (337, 85, 337);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (338, 85, 338);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (339, 85, 339);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (340, 85, 340);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (341, 86, 341);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (342, 86, 342);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (343, 86, 343);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (344, 86, 344);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (345, 87, 345);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (346, 87, 346);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (347, 87, 347);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (348, 87, 348);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (349, 88, 349);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (350, 88, 350);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (351, 88, 351);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (352, 88, 352);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (353, 89, 353);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (354, 89, 354);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (355, 89, 355);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (356, 89, 356);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (357, 90, 357);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (358, 90, 358);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (359, 90, 359);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (360, 90, 360);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (361, 91, 361);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (362, 91, 362);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (363, 91, 363);
INSERT INTO "quizz_question_reponse" ("id", "question_id", "reponse_id") VALUES (364, 91, 364);

CREATE TABLE "quizz_reponse" (
	"id" INTEGER NOT NULL UNIQUE,
	"reponse" TEXT NOT NULL,
	"bonne_reponse" INTEGER NOT NULL,
	PRIMARY KEY("id")
);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (1, 'C''est un héritage des chevaliers (signe de paix)', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (2, 'Pour ne pas salir les fauteuils', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (3, 'C''était une loi sous Napoléon', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (4, 'Pour éviter de perdre ses cheveux', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (5, 'Elle était le symbole de la classe ouvrière', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (6, 'Elle était réservée aux nobles', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (7, 'Seuls les prêtres y avaient droit', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (8, 'Elle servait à cacher les visages des pauvres', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (9, 'Pour rappeler les origines latines et grecques', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (10, 'Pour rallonger les lignes dans les livres', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (11, 'C''est une erreur des premiers imprimeurs', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (12, 'Pour rendre la lecture plus lente', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (13, 'Pour distinguer l''élite instruite du peuple', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (14, 'Par manque de budget pour réimprimer les livres', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (15, 'Parce que le Roi aimait les lettres muettes', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (16, 'Parce que le papier coûtait trop cher', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (17, 'Sa victoire au jeu Jeopardy!', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (18, 'Son élection au Sénat américain', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (19, 'Sa réussite au test du permis de conduire', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (20, 'Sa création d''une symphonie originale', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (21, 'Pre-trained (Pré-entraîné)', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (22, 'Powerful (Puissant)', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (23, 'Programmed (Programmé)', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (24, 'Predictive (Prédictif)', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (25, 'Le Tweed', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (26, 'Le Nylon', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (27, 'Le Jersey', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (28, 'La Soie', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (29, 'Ses fines côtes obliques', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (30, 'Son aspect brillant et lisse', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (31, 'Ses alvéoles en nid d''abeille', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (32, 'Sa transparence', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (33, 'Pour la stabilité dimensionnelle', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (34, 'Pour augmenter le poids', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (35, 'Pour rendre le tissu plus rugueux', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (36, 'Pour diminuer la vitesse de séchage', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (37, 'Le Nylon Ripstop', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (38, 'Le Velours côtelé', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (39, 'Le Denim brut', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (40, 'Le Satin', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (41, 'D''un brossage intensif du coton', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (42, 'De l''utilisation de poils de taupe', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (43, 'D''un trempage dans la résine', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (44, 'D''un tissage de fils d''acier', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (45, 'Ses sillons en relief', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (46, 'Son absence totale de texture', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (47, 'Sa capacité à réfléchir la lumière', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (48, 'Son élasticité extrême', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (49, 'Le Mesh plastique', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (50, 'Le Cuir pleine fleur', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (51, 'La laine bouillie', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (52, 'Le Néoprène', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (53, 'Un sergé de coton léger', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (54, 'Un mélange de lin et de soie', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (55, 'Un coton enduit de cire', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (56, 'Une fibre issue du recyclage', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (57, 'Un meilleur confort thermique', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (58, 'Une étanchéité totale', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (59, 'Une transparence accrue', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (60, 'Une réduction du prix final', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (61, 'Le coton a été gratté', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (62, 'Le coton a été peint', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (63, 'Le coton a été brûlé', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (64, 'Le coton est imperméabilisé', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (65, 'New Era Cap Company', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (66, 'Mitchell & Ness', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (67, 'Starter', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (68, 'American Needle', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (69, 'Par une stratégie de collections limitées (drops)', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (70, 'Par l''abandon total des licences sportives', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (71, 'Par la vente exclusive en grandes surfaces', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (72, 'Par la suppression des logos visibles', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (73, 'La délocalisation massive vers l''Asie', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (74, 'Le retour à une fabrication 100% artisanale', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (75, 'L''interdiction des fibres synthétiques', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (76, 'L''abandon des machines à coudre automatiques', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (77, 'La broderie à la demande (on-demand)', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (78, 'Le transport exclusif par train', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (79, 'Le stockage en extérieur', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (80, 'L''utilisation de tissus périssables', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (81, 'Pour répondre aux exigences RSE des consommateurs', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (82, 'Pour réduire obligatoirement le prix de vente', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (83, 'Pour simplifier les processus de teinture', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (84, 'Pour supprimer définitivement l''usage du coton', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (85, '1995, en 10 jours', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (86, '1991, en 3 mois', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (87, '1998, en 2 semaines', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (88, '1994, en 100 jours', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (89, 'LiveScript', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (90, 'ActionScript', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (91, 'JScript', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (92, 'ECMAScript', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (93, 'JScript', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (94, 'VBScript', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (95, 'MS-JS', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (96, 'Chakra', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (97, 'ECMA International', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (98, 'W3C', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (99, 'ISO', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (100, 'IEEE', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (101, 'AJAX', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (102, 'Flash', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (103, 'Applets Java', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (104, 'Silverlight', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (105, 'V8', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (106, 'SpiderMonkey', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (107, 'Nitro', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (108, 'Carakan', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (109, '2009', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (110, '2005', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (111, '2012', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (112, '2015', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (113, 'ES5', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (114, 'ES3', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (115, 'ES6', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (116, 'ES2015', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (117, 'ECMAScript 2015', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (118, 'ECMAScript 5.1', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (119, 'ECMAScript 7', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (120, 'ECMAScript 2020', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (121, 'TC39', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (122, 'W3C-JS', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (123, 'JS-Core Team', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (124, 'Ecma-Group 5', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (125, 'Babel', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (126, 'Webpack', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (127, 'ESLint', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (128, 'Prettier', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (129, 'async / await', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (130, 'Callbacks', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (131, 'Generators', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (132, 'Observables', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (133, 'Microsoft', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (134, 'Google', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (135, 'Facebook', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (136, 'Oracle', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (137, 'import / export', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (138, 'require / module.exports', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (139, 'define / AMD', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (140, 'System.register', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (141, 'Deno', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (142, 'Bun', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (143, 'Node Next', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (144, 'V8-Server', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (145, 'Next.js', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (146, 'Create React App', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (147, 'Express.js', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (148, 'jQuery', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (149, 'Angular', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (150, 'Svelte', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (151, 'Vue.js', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (152, 'Backbone.js', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (153, 'Vue.js', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (154, 'React', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (155, 'Ember.js', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (156, 'SolidJS', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (157, 'Svelte', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (158, 'React', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (159, 'Angular', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (160, 'Meteor', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (161, 'React', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (162, 'Alpine.js', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (163, 'Lit', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (164, 'Mustache', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (165, 'Alpine.js', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (166, 'Next.js', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (167, 'Nuxt.js', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (168, 'Angular', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (169, 'Angular', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (170, 'Preact', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (171, 'jQuery', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (172, 'Handlebars', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (173, 'L''ISR', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (174, 'Le SPA classique', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (175, 'Le lazy loading', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (176, 'Le Polling API', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (177, 'React Native', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (178, 'Vue Native', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (179, 'Angular Universal', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (180, 'Electron', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (181, 'PWA (Progressive Web App)', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (182, 'Le Serverless', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (183, 'Le Micro-frontend', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (184, 'Le WebAssembly', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (185, '10 jours', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (186, '10 mois', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (187, '6 semaines', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (188, '1 an', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (189, 'Pour profiter du succès marketing de Java', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (190, 'Parce qu''il partageait la même syntaxe objet', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (191, 'Suite au rachat de Netscape par Sun Microsystems', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (192, 'Pour indiquer qu''il s''agissait d''une version simplifiée de Java', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (193, 'ECMAScript', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (194, 'W3C Script', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (195, 'ISO-JS', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (196, 'JScript Standard', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (197, 'AJAX', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (198, 'JSON', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (199, 'jQuery', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (200, 'Flash', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (201, 'jQuery', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (202, 'Mootools', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (203, 'Prototype.js', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (204, 'AngularJS', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (205, 'V8', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (206, 'SpiderMonkey', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (207, 'Chakra', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (208, 'Nitro', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (209, 'Exécuter du JavaScript côté serveur', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (210, 'L''invention du format JSON', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (211, 'Le support du multi-threading natif', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (212, 'La création du premier framework CSS', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (213, 'ES6 (ES2015)', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (214, 'ES5', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (215, 'ES3', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (216, 'ES8 (ES2017)', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (217, 'React', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (218, 'Vue.js', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (219, 'Angular', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (220, 'Ember.js', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (221, 'TypeScript', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (222, 'CoffeeScript', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (223, 'Dart', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (224, 'ActionScript', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (225, 'Comme un langage compagnon pour les petits scripts', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (226, 'Comme un remplaçant complet du langage C++', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (227, 'Comme une extension exclusive au système Windows', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (228, 'Comme un outil de base de données uniquement', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (229, 'Le chargement asynchrone de données', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (230, 'Le stockage de données en SQL local', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (231, 'La compilation de code JS en binaire', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (232, 'L''affichage de vidéos sans plugin', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (233, 'Le développement d''applications côté serveur', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (234, 'La création de feuilles de style dynamiques', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (235, 'Le design d''interfaces vectorielles', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (236, 'L''optimisation du référencement naturel', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (237, 'Par l''introduction native des modules (import/export)', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (238, 'Par la suppression totale des variables globales', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (239, 'Par l''ajout automatique de commentaires', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (240, 'Par le renommage des fonctions obsolètes', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (241, 'Pour sécuriser le code dans de grands projets collaboratifs', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (242, 'Pour réduire la taille des images sur un site', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (243, 'Pour accélérer le temps de chargement initial du HTML', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (244, 'Pour supprimer le besoin de tester son application', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (245, 'Bun', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (246, 'Deno', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (247, 'Node.js 22', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (248, 'GraalVM', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (249, 'Vite', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (250, 'Webpack 4', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (251, 'Grunt', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (252, 'Gulp', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (253, 'TurboFan', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (254, 'Liftoff', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (255, 'IonMonkey', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (256, 'Sparkplug', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (257, 'Deno', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (258, 'SWC', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (259, 'Esbuild', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (260, 'Babel', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (261, 'Astro', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (262, 'React 19', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (263, 'Vue 3', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (264, 'Angular 18', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (265, '1662', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (266, '1550', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (267, '1710', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (268, '1789', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (269, 'Carl Friedrich Gauss', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (270, 'Isaac Newton', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (271, 'Blaise Pascal', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (272, 'René Descartes', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (273, 'Adolphe Quetelet', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (274, 'Francis Galton', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (275, 'Karl Pearson', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (276, 'Siméon Denis Poisson', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (277, '1749', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (278, '1600', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (279, '1850', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (280, '1905', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (281, 'Le Test t', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (282, 'Le Chi-deux', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (283, 'L''Analyse de variance', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (284, 'La Régression linéaire', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (285, 'Francis Galton', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (286, 'Thomas Bayes', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (287, 'Ronald Fisher', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (288, 'Pierre-Simon de Laplace', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (289, '1925', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (290, '1890', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (291, '1950', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (292, '1972', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (293, 'Le théorème sur la probabilité inverse', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (294, 'La loi des grands nombres', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (295, 'L''invention du recensement', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (296, 'Le calcul de l''écart-type', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (297, 'L''INSEE', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (298, 'L''INED', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (299, 'Le CNRS', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (300, 'La Banque de France', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (301, 'Ronald Fisher', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (302, 'Karl Pearson', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (303, 'Jerzy Neyman', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (304, 'Egon Pearson', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (305, 'Environ 2%', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (306, 'Environ 99%', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (307, 'Environ 19%', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (308, 'Environ 50%', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (309, 'Changer pour la porte 2', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (310, 'Garder la porte 1', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (311, 'Peu importe, les chances sont de 50/50', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (312, 'Ouvrir les deux portes restantes', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (313, 'La loi Binomiale', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (314, 'La loi de Poisson', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (315, 'La loi Normale', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (316, 'La loi Exponentielle', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (317, '5/6', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (318, '1/2', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (319, '1/3', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (320, '2/3', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (321, 'e^-3', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (322, '1/3', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (323, '3^0 / 3!', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (324, '1 - e^-3', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (325, '1/3', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (326, '1/2', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (327, '1/4', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (328, '2/3', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (329, '0,4€', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (330, '2€', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (331, '0€', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (332, '-0,4€', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (333, '1/221', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (334, '1/169', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (335, '1/13', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (336, '4/52', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (337, 'Loi Exponentielle', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (338, 'Loi Uniforme', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (339, 'Loi de Bernoulli', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (340, 'Loi Log-normale', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (341, 'Loi Géométrique', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (342, 'Loi Hypergéométrique', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (343, 'Loi Binomiale Négative', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (344, 'Loi de Student', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (345, 'Environ 64%', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (346, 'Exactement 5%', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (347, '100%', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (348, 'Environ 36%', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (349, 'Environ 39,3%', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (350, '50%', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (351, '25%', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (352, '63,2%', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (353, 'La loi de Poisson', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (354, 'La loi Uniforme', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (355, 'La loi de Student', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (356, 'La loi Log-normale', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (357, '0,028', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (358, '0,3', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (359, '0,001', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (360, '0,1', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (361, 'Le paradoxe de Simpson', 1);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (362, 'Le biais de survie', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (363, 'L''erreur de Gambler', 0);
INSERT INTO "quizz_reponse" ("id", "reponse", "bonne_reponse") VALUES (364, 'Le biais de confirmation', 0);

CREATE TABLE "ref_categorie" (
	"id" INTEGER NOT NULL UNIQUE,
	-- histoire l pratique
	"type" TEXT NOT NULL,
	PRIMARY KEY("id")
);
INSERT INTO "ref_categorie" ("id", "type") VALUES (1, 'histoire');
INSERT INTO "ref_categorie" ("id", "type") VALUES (2, 'pratique');

CREATE TABLE "relation_question_implicite" (
  "id" INTEGER NOT NULL UNIQUE,
  "story_id" INTEGER,
  "question_p_id" INTEGER NOT NULL,
  "question_e_id" INTEGER NOT NULL,
  PRIMARY KEY("id"),
  FOREIGN KEY ("question_p_id") REFERENCES "quizz_question"("id")
    ON UPDATE NO ACTION ON DELETE NO ACTION,
  FOREIGN KEY ("question_e_id") REFERENCES "quizz_question"("id")
    ON UPDATE NO ACTION ON DELETE NO ACTION,
  FOREIGN KEY ("story_id") REFERENCES "collection_story"("id")
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE "user" (
	"id" INTEGER NOT NULL UNIQUE,
	"pseudot" TEXT NOT NULL,
	PRIMARY KEY("id")
);
INSERT INTO "user" ("id", "pseudot") VALUES (1, 'maitre_quizz');

CREATE TABLE "user_device" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"device_id" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "user"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("device_id") REFERENCES "device"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);
INSERT INTO "user_device" ("id", "user_id", "device_id") VALUES (1, 1, 1);

CREATE TABLE "user_kpi" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"create_at" TEXT NOT NULL,
	"question_id" INTEGER NOT NULL,
	"reponse_id" INTEGER NOT NULL,
	-- le temps que l'utillisateur a mis a repondre
	"duree_session" TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "user"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("reponse_id") REFERENCES "quizz_reponse"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("question_id") REFERENCES "quizz_question"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (2, 1, '2026-04-12T17:13:13.802Z', 65, 258, '24.941');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (3, 1, '2026-04-13T08:27:13.793Z', 29, 113, '5.223');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (4, 1, '2026-04-13T08:27:28.447Z', 30, 117, '9.865');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (5, 1, '2026-04-13T08:27:44.123Z', 28, 111, '11.503');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (6, 1, '2026-04-13T08:28:02.310Z', 56, 221, '9.529');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (7, 1, '2026-04-13T08:28:13.788Z', 51, 201, '5.029');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (8, 1, '2026-04-13T08:28:33.784Z', 47, 185, '11.246');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (9, 1, '2026-04-13T08:28:52.073Z', 55, 217, '10.838');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (10, 1, '2026-04-13T08:29:24.366Z', 57, 225, '31.014');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (11, 1, '2026-04-13T08:34:06.673Z', 65, 257, '13.6');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (12, 1, '2026-04-13T08:36:22.410Z', 25, 97, '3.892');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (13, 1, '2026-04-13T08:36:33.522Z', 34, 133, '8.645');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (14, 1, '2026-04-13T08:36:47.110Z', 63, 249, '9.674');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (15, 1, '2026-04-13T08:38:08.852Z', 35, 137, '9.629');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (16, 1, '2026-04-13T08:40:10.127Z', 23, 90, '12.362');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (17, 1, '2026-04-13T08:40:56.465Z', 36, 144, '25.117');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (18, 1, '2026-04-13T08:54:29.075Z', 24, 94, '240.11');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (19, 1, '2026-04-16T10:44:02.187Z', 74, 294, '7.575');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (20, 1, '2026-04-16T11:49:53.672Z', 85, 340, '58.089');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (21, 1, '2026-04-16T11:50:17.657Z', 81, 321, '12.877');
INSERT INTO "user_kpi" ("id", "user_id", "create_at", "question_id", "reponse_id", "duree_session") VALUES (22, 1, '2026-04-16T12:05:30.515Z', 91, 361, '156.656');

COMMIT;
PRAGMA foreign_keys=ON;
