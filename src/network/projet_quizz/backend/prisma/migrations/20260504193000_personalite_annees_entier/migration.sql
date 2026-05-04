-- Années de naissance / décès stockées en INTEGER (SQLite).
PRAGMA foreign_keys=OFF;

CREATE TABLE "personalite_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "collection_id" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "Prenom" TEXT NOT NULL,
    "naissance" INTEGER NOT NULL,
    "mort" INTEGER,
    "resumer" TEXT NOT NULL,
    CONSTRAINT "personalite_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "quizz_collection" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

INSERT INTO "personalite_new" ("id", "collection_id", "nom", "Prenom", "naissance", "mort", "resumer")
SELECT
    "id",
    "collection_id",
    "nom",
    "Prenom",
    CASE
        WHEN CAST(TRIM("naissance") AS INTEGER) IS NOT NULL THEN CAST(TRIM("naissance") AS INTEGER)
        ELSE 0
    END,
    CASE
        WHEN "mort" IS NULL OR TRIM("mort") = '' THEN NULL
        ELSE CAST(TRIM("mort") AS INTEGER)
    END,
    "resumer"
FROM "personalite";

DROP TABLE "personalite";
ALTER TABLE "personalite_new" RENAME TO "personalite";

PRAGMA foreign_keys=ON;
