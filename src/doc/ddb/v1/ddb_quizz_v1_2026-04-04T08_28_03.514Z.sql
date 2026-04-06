CREATE TABLE IF NOT EXISTS "quizz_reponse" (
	"id" INTEGER NOT NULL UNIQUE,
	"reponse" TEXT NOT NULL,
	"bonne_reponse" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("id") REFERENCES "quizz_question_reponse"("reponse_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("id") REFERENCES "user_kpi"("reponse_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "quizz_question_reponse" (
	"id" INTEGER NOT NULL UNIQUE,
	"question_id" INTEGER NOT NULL,
	"reponse_id" INTEGER NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "user_device" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"device_id" INTEGER NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "device" (
	"id" INTEGER NOT NULL UNIQUE,
	"adresse_mac" TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("id") REFERENCES "user_device"("device_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "user" (
	"id" INTEGER NOT NULL UNIQUE,
	"pseudot" TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("id") REFERENCES "user_device"("user_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("id") REFERENCES "quizz_question"("user_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("id") REFERENCES "ref_collection"("user_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("id") REFERENCES "user_kpi"("user_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "quizz_question" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"create_at" TEXT NOT NULL,
	"question" TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("id") REFERENCES "quizz_question_reponse"("question_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("id") REFERENCES "question_collection"("question_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("id") REFERENCES "user_kpi"("question_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "ref_collection" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"create_at" TEXT NOT NULL,
	"update_at" TEXT NOT NULL,
	"nom" TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("id") REFERENCES "question_collection"("collection_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "question_collection" (
	"id" INTEGER NOT NULL UNIQUE,
	"collection_id" INTEGER NOT NULL,
	"question_id" INTEGER NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "user_kpi" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"create_at" TEXT NOT NULL,
	"question_id" INTEGER NOT NULL,
	"reponse_id" INTEGER NOT NULL,
	-- le temps que l'utillisateur a mis a repondre
	"duree_session" TEXT NOT NULL,
	PRIMARY KEY("id")
);
