-- Migration schéma v3 (Prisma) → v4 (ddb/v4/v4.sql).
-- Conserve : ref_categorie → ref_p_categorie (même ids), quizz_question.categorie_id → categorie_p_id,
--   collection_story → groupe_questions, relation_question_implicite (renommage colonnes).
-- Abandonne : sous-collections et relation_sous-collections (non présentes en v4).

PRAGMA foreign_keys=OFF;
PRAGMA defer_foreign_keys=ON;

DROP INDEX IF EXISTS "relation_sous_collections_sous_question_key";

-- Si la table n’existait pas (historique migrations Prisma sans inject.sql), on évite l’échec du SELECT suivant.
CREATE TABLE IF NOT EXISTS "collection_story" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" INTEGER NOT NULL,
    "description" TEXT NOT NULL
);

-- Référentiels v4 (vides au départ ; importance / difficulté optionnelles sur les questions)
CREATE TABLE "ref_importance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lvl" TEXT NOT NULL
);

CREATE TABLE "ref_difficulter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lvl" TEXT NOT NULL
);

-- Catégories parent : copie depuis ref_categorie (type ; description = type si pas de colonne description en v3)
CREATE TABLE "ref_p_categorie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

INSERT INTO "ref_p_categorie" ("id", "type", "description") SELECT "id", "type", "type" FROM "ref_categorie";

CREATE TABLE "ref_e_categorie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

CREATE TABLE "relation_categorie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "p_categorie" INTEGER NOT NULL,
    "e_categorie" INTEGER NOT NULL,
    CONSTRAINT "relation_categorie_p_categorie_fkey" FOREIGN KEY ("p_categorie") REFERENCES "ref_p_categorie" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "relation_categorie_e_categorie_fkey" FOREIGN KEY ("e_categorie") REFERENCES "ref_e_categorie" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE "groupe_questions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" INTEGER NOT NULL,
    "description" TEXT
);

INSERT INTO "groupe_questions" ("id", "nom", "description") SELECT "id", "nom", "description" FROM "collection_story";

ALTER TABLE "quizz_collection" ADD COLUMN "description" TEXT;

DROP TABLE IF EXISTS "relation_sous-collections";
DROP TABLE IF EXISTS "sous-collections";

CREATE TABLE "_migration_rqi_backup" AS SELECT * FROM "relation_question_implicite";
DROP TABLE "relation_question_implicite";

CREATE TABLE "new_quizz_question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "importance_id" INTEGER,
    "difficulter_id" INTEGER,
    "categorie_p_id" INTEGER NOT NULL,
    "categorie_e_id" INTEGER,
    "create_at" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "commentaire" TEXT NOT NULL,
    "verifier" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "quizz_question_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "quizz_question_importance_id_fkey" FOREIGN KEY ("importance_id") REFERENCES "ref_importance" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "quizz_question_difficulter_id_fkey" FOREIGN KEY ("difficulter_id") REFERENCES "ref_difficulter" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "quizz_question_categorie_p_id_fkey" FOREIGN KEY ("categorie_p_id") REFERENCES "ref_p_categorie" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "quizz_question_categorie_e_id_fkey" FOREIGN KEY ("categorie_e_id") REFERENCES "ref_e_categorie" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

INSERT INTO "new_quizz_question" (
    "id", "user_id", "importance_id", "difficulter_id", "categorie_p_id", "categorie_e_id",
    "create_at", "question", "commentaire", "verifier"
)
SELECT
    "id", "user_id", NULL, NULL, "categorie_id", NULL,
    "create_at", "question", "commentaire", "verifier"
FROM "quizz_question";

DROP TABLE "quizz_question";
ALTER TABLE "new_quizz_question" RENAME TO "quizz_question";

CREATE TABLE "relation_question_implicite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "story_id" INTEGER,
    "question1__id" INTEGER NOT NULL,
    "question2_id" INTEGER NOT NULL,
    CONSTRAINT "relation_question_implicite_question1__id_fkey" FOREIGN KEY ("question1__id") REFERENCES "quizz_question" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "relation_question_implicite_question2_id_fkey" FOREIGN KEY ("question2_id") REFERENCES "quizz_question" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

INSERT INTO "relation_question_implicite" ("id", "story_id", "question1__id", "question2_id")
SELECT "id", "story_id", "question_p_id", "question_e_id" FROM "_migration_rqi_backup";

DROP TABLE "_migration_rqi_backup";

CREATE TABLE "relation-collection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "p_collection" INTEGER NOT NULL,
    "e_collection" INTEGER NOT NULL,
    CONSTRAINT "relation-collection_p_collection_fkey" FOREIGN KEY ("p_collection") REFERENCES "quizz_collection" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "relation-collection_e_collection_fkey" FOREIGN KEY ("e_collection") REFERENCES "quizz_collection" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE "personalite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "collection_id" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "Prenom" TEXT NOT NULL,
    "naissance" TEXT NOT NULL,
    "mort" TEXT,
    "resumer" TEXT NOT NULL,
    CONSTRAINT "personalite_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "quizz_collection" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE "ref_importance_personalite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL
);

CREATE TABLE "personalité_collection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "importance_id" INTEGER,
    "personalite_id" INTEGER NOT NULL,
    "collection_id" INTEGER NOT NULL,
    CONSTRAINT "personalité_collection_importance_id_fkey" FOREIGN KEY ("importance_id") REFERENCES "ref_importance_personalite" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "personalité_collection_personalite_id_fkey" FOREIGN KEY ("personalite_id") REFERENCES "personalite" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "personalité_collection_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "quizz_collection" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE "question_reflexion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "collection_questions_id" INTEGER NOT NULL,
    "question_p_id" INTEGER NOT NULL,
    "question_a_id" INTEGER NOT NULL,
    CONSTRAINT "question_reflexion_collection_questions_id_fkey" FOREIGN KEY ("collection_questions_id") REFERENCES "groupe_questions" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "question_reflexion_question_p_id_fkey" FOREIGN KEY ("question_p_id") REFERENCES "quizz_question" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "question_reflexion_question_a_id_fkey" FOREIGN KEY ("question_a_id") REFERENCES "quizz_question" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS "collection_story";
DROP TABLE IF EXISTS "ref_categorie";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
