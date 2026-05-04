CREATE TABLE IF NOT EXISTS "ref_importance" (
	"id" INTEGER NOT NULL UNIQUE,
	"lvl" TEXT NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "ref_difficulter" (
	"id" INTEGER NOT NULL UNIQUE,
	"lvl" TEXT NOT NULL,
	PRIMARY KEY("id")
);

/* p = parent  & e = enfant  , une collection  enfant ne peut pas être parent de sont parent */
CREATE TABLE IF NOT EXISTS "relation-collection" (
	"id" INTEGER NOT NULL UNIQUE,
	-- collection parent
	"p_collection" INTEGER NOT NULL,
	-- collection enfant
	"e_collection" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("p_collection") REFERENCES "quizz_collection"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("e_collection") REFERENCES "quizz_collection"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

/* regroupe les questions par exemple pour partir d'une situation , choisir la forumulle qu'elle variable a qu'elle endrois  */
CREATE TABLE IF NOT EXISTS "groupe_questions" (
	"id" INTEGER NOT NULL UNIQUE,
	-- e : enfant
	"nom" INTEGER NOT NULL,
	-- explique le buts de la question par exemple ; application du calcule d'ohm
	"description" TEXT,
	PRIMARY KEY("id")
);

/* un module ces par exemple : "histoire-france" */
CREATE TABLE IF NOT EXISTS "quizz_module" (
	"id" INTEGER NOT NULL UNIQUE,
	"nom" TEXT NOT NULL,
	"create_at" TEXT NOT NULL,
	"update_at" TEXT NOT NULL,
	PRIMARY KEY("id")
);

/* p pour parent */
CREATE TABLE IF NOT EXISTS "ref_p_categorie" (
	"id" INTEGER NOT NULL UNIQUE,
	-- histoire l pratique | connaissance
	"type" TEXT NOT NULL,
	-- explique les question contenus dans cette catégorie (sert de support pour un prompt)
	"description" TEXT NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "quizz_reponse" (
	"id" INTEGER NOT NULL UNIQUE,
	"reponse" TEXT NOT NULL,
	"bonne_reponse" INTEGER NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "quizz_question_reponse" (
	"id" INTEGER NOT NULL UNIQUE,
	"question_id" INTEGER NOT NULL,
	"reponse_id" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("question_id") REFERENCES "quizz_question"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("reponse_id") REFERENCES "quizz_reponse"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "user_device" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"device_id" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "user"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("device_id") REFERENCES "device"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "device" (
	"id" INTEGER NOT NULL UNIQUE,
	"adresse_mac" TEXT NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "user" (
	"id" INTEGER NOT NULL UNIQUE,
	"pseudot" TEXT NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "quizz_question" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	-- none possible pour laisser l'utilisateur le définir plus tard
	"importance_id" INTEGER,
	-- none possible pour laisser l'utilisateur le définir plus tard
	"difficulter_id" INTEGER,
	"categorie_p_id" INTEGER NOT NULL,
	-- none possible car  une categortie parent peut n'avoir aucun enfant (lien dans la table relation_categorie)
	"categorie_e_id" INTEGER,
	"create_at" TEXT NOT NULL,
	"question" TEXT NOT NULL,
	"commentaire" TEXT NOT NULL,
	"verifier" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "user"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("categorie_e_id") REFERENCES "ref_e_categorie"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("categorie_p_id") REFERENCES "ref_p_categorie"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("importance_id") REFERENCES "ref_importance"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("difficulter_id") REFERENCES "ref_difficulter"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

/* une collection ces par exemple : si quizz-module ="histoire-france" quizz-collection pourais être "rois" , "evénement" ect... */
CREATE TABLE IF NOT EXISTS "quizz_collection" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"create_at" TEXT NOT NULL,
	"update_at" TEXT NOT NULL,
	"nom" TEXT NOT NULL,
	"description" TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "user"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "question_collection" (
	"id" INTEGER NOT NULL UNIQUE,
	"collection_id" INTEGER NOT NULL,
	"question_id" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("collection_id") REFERENCES "quizz_collection"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("question_id") REFERENCES "quizz_question"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "user_kpi" (
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

CREATE TABLE IF NOT EXISTS "quizz_module_collection" (
	"id" INTEGER NOT NULL UNIQUE,
	"module_id" INTEGER NOT NULL,
	"collection_id" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("module_id") REFERENCES "quizz_module"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("collection_id") REFERENCES "quizz_collection"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

/* regroupe des question qui on un lien étroit ensemble (quand je répond a mes quizz si je crée une question ces la question Parent qui ma aidée a crée la question enfant, mais il n'y a pas de suite */
CREATE TABLE IF NOT EXISTS "relation_question_implicite" (
	"id" INTEGER NOT NULL UNIQUE,
	"story_id" INTEGER,
	-- p : parent
	"question1__id" INTEGER NOT NULL,
	-- e : enfant
	"question2_id" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("question1__id") REFERENCES "quizz_question"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("question2_id") REFERENCES "quizz_question"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "personalite" (
	"id" INTEGER NOT NULL UNIQUE,
	-- collection dédier a la personalité : cette collection ne  peut avoir de parent n'y d'enfant, il ne peut pas être associé a un autre persoanlité
	"collection_id" INTEGER NOT NULL,
	"nom" TEXT NOT NULL,
	"Prenom" TEXT NOT NULL,
	-- ces une date respect du format : ISO 8601, car la date est avant 1970
	"naissance" TEXT NOT NULL,
	-- ces une date respect du format : ISO 8601, car la date est avant 1970, none car la personne peu-etre encore en vie
	"mort" TEXT,
	-- résumer rapide la vie de la personalité
	"resumer" TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("collection_id") REFERENCES "quizz_collection"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

/* si le type collection et personnalité il ne peut pas être référencer ici seul les normal sont autorisé a être associé a d'autre personalité */
CREATE TABLE IF NOT EXISTS "personalité_collection" (
	"id" INTEGER NOT NULL UNIQUE,
	-- si none l'utilisateur ne a oublié ou ne sais pas encore l'importances il pourais le modifier plus-tard
	"importance_id" INTEGER,
	"personalite_id" INTEGER NOT NULL,
	"collection_id" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("importance_id") REFERENCES "ref_importance_personalite"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("personalite_id") REFERENCES "personalite"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("collection_id") REFERENCES "quizz_collection"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

/* indique si la personalité a eu une grande ou léger influence  */
CREATE TABLE IF NOT EXISTS "ref_importance_personalite" (
	"id" INTEGER NOT NULL UNIQUE,
	-- pionner | important | secondaire
	"type" TEXT NOT NULL,
	PRIMARY KEY("id")
);

/* e pour enfant */
CREATE TABLE IF NOT EXISTS "ref_e_categorie" (
	"id" INTEGER NOT NULL UNIQUE,
	-- pour histoire : contexte
	"type" TEXT NOT NULL,
	-- explique les question regrouper avec cette categorie
	"description" TEXT NOT NULL,
	PRIMARY KEY("id")
);

/* permet de connaitre les relation entre les catégorie et qu'elle catégorie parent a quelle enfant  */
CREATE TABLE IF NOT EXISTS "relation_categorie" (
	"id" INTEGER NOT NULL UNIQUE,
	"p_categorie" INTEGER NOT NULL,
	"e_categorie" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("p_categorie") REFERENCES "ref_p_categorie"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("e_categorie") REFERENCES "ref_e_categorie"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

/* gere la relation parent enfant  pour déssiner un file conducteur on passe du parent a l'enfant  et l'enfant peu-être parent d'un autre enfant, l'ordre des question ne pas être shuffle on part du parent a l'enfant et la bonne réponse permet de passée a l'enfant suivant */
CREATE TABLE IF NOT EXISTS "question_reflexion" (
	"id" INTEGER NOT NULL UNIQUE,
	"collection_questions_id" INTEGER NOT NULL,
	"question_p_id" INTEGER NOT NULL,
	"question_a_id" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("collection_questions_id") REFERENCES "groupe_questions"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("question_p_id") REFERENCES "quizz_question"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("question_a_id") REFERENCES "quizz_question"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);
