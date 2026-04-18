-- AlterTable
-- DEFAULT '' : lignes existantes sous SQLite (NOT NULL sans valeur explicite).
ALTER TABLE "sous-collections" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
