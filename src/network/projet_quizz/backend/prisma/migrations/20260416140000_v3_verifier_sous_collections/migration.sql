-- CreateTable
CREATE TABLE "sous-collections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "collection_id" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    CONSTRAINT "sous-collections_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "quizz_collection" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "relation_sous-collections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sous_collection_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    CONSTRAINT "relation_sous-collections_sous_collection_id_fkey" FOREIGN KEY ("sous_collection_id") REFERENCES "sous-collections" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "relation_sous-collections_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quizz_question" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_quizz_question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "categorie_id" INTEGER NOT NULL,
    "create_at" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "commentaire" TEXT NOT NULL,
    "verifier" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "quizz_question_categorie_id_fkey" FOREIGN KEY ("categorie_id") REFERENCES "ref_categorie" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "quizz_question_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
INSERT INTO "new_quizz_question" ("categorie_id", "commentaire", "create_at", "id", "question", "user_id") SELECT "categorie_id", "commentaire", "create_at", "id", "question", "user_id" FROM "quizz_question";
DROP TABLE "quizz_question";
ALTER TABLE "new_quizz_question" RENAME TO "quizz_question";
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_quizz_question_1" ON "quizz_question"("id");
Pragma writable_schema=0;
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Toutes les lignes existantes reçoivent explicitement verifier = 0 (fakechecker faux).
UPDATE "quizz_question" SET "verifier" = 0 WHERE 1 = 1;
