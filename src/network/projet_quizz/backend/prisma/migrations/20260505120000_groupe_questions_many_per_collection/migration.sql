-- DropUnique: une collection peut avoir plusieurs `groupe_questions`.
DROP INDEX IF EXISTS "groupe_questions_collection_id_key";

-- CreateIndex
CREATE INDEX "groupe_questions_collection_id_idx" ON "groupe_questions"("collection_id");
