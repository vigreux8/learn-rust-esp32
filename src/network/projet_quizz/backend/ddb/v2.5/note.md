## Nouvelles tables ajoutees en v2.5 (vs v2)

Les deux nouvelles tables introduites dans `v2.5.sql` par rapport a `v2.sql` sont:

1. `collection_story`
2. `relation_question_implicite`

### SQL d'injection dans `quizz.db`

```sql
CREATE TABLE IF NOT EXISTS "collection_story" (
  "id" INTEGER NOT NULL UNIQUE,
  "nom" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "relation_question_implicite" (
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
```

### Commandes utiles

```bash
# Injection des 2 tables
sqlite3 ./quizz.db < ./ddb/v2.5/new_tables.sql

# Generation Prisma Client
npx prisma generate
```
