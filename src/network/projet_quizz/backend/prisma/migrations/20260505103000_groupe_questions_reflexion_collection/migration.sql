-- AlterTable
ALTER TABLE "groupe_questions" ADD COLUMN "collection_id" INTEGER;
ALTER TABLE "groupe_questions" ADD COLUMN "head_question_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "groupe_questions_collection_id_key" ON "groupe_questions"("collection_id");
