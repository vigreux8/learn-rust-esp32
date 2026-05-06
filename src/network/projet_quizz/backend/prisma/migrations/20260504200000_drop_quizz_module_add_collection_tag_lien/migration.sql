-- CreateTable
CREATE TABLE "collection_tag_lien" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tag_collection_id" INTEGER NOT NULL,
    "tagged_collection_id" INTEGER NOT NULL,
    CONSTRAINT "collection_tag_lien_tag_collection_id_fkey" FOREIGN KEY ("tag_collection_id") REFERENCES "quizz_collection" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "collection_tag_lien_tagged_collection_id_fkey" FOREIGN KEY ("tagged_collection_id") REFERENCES "quizz_collection" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateIndex
CREATE UNIQUE INDEX "collection_tag_lien_tag_collection_id_tagged_collection_id_key" ON "collection_tag_lien"("tag_collection_id", "tagged_collection_id");

-- DropTable
DROP TABLE IF EXISTS "quizz_module_collection";

-- DropTable
DROP TABLE IF EXISTS "quizz_module";
