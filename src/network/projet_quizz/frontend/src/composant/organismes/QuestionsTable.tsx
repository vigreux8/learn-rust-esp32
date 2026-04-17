import { Pencil, Trash2 } from "lucide-preact";
import type { QuizzQuestionRow } from "../../types/quizz";
import { Badge } from "../atomes/Badge/Badge";
import { Button } from "../atomes/Button/Button";
import { Card } from "../atomes/Card/Card";

export type QuestionsTableProps = {
  questions: QuizzQuestionRow[];
  saving: boolean;
  onEdit: (q: QuizzQuestionRow) => void;
  onRemove: (id: number) => void;
};

/**
 * Liste des questions sous forme de cartes avec badges (collections, catégorie) et actions modifier / supprimer.
 */
export function QuestionsTable({ questions, saving, onEdit, onRemove }: QuestionsTableProps) {
  return (
    <Card>
      <p class="mb-4 text-sm text-base-content/60">
        {questions.length} question{questions.length !== 1 ? "s" : ""} affichée{questions.length !== 1 ? "s" : ""}.
      </p>
      <ul class="space-y-3">
        {questions.map((q) => (
          <li
            key={q.id}
            class="overflow-hidden rounded-[1.35rem] border border-base-content/10 bg-base-200/35 transition duration-300 hover:border-flow/20 hover:shadow-md hover:shadow-flow/5"
          >
            <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0 flex-1">
                <div class="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">id {q.id}</Badge>
                  <Badge tone="learn">{q.categorie_type}</Badge>
                  {q.collections.length === 0 ? (
                    <Badge tone="learn">Sans collection</Badge>
                  ) : (
                    q.collections.map((c) => (
                      <Badge key={c.id} tone="flow">
                        {c.nom}
                      </Badge>
                    ))
                  )}
                </div>
                {q.commentaire.trim() ? (
                  <p class="mb-2 text-xs leading-relaxed text-base-content/55 line-clamp-3">{q.commentaire}</p>
                ) : null}
                <p class="text-sm font-medium leading-relaxed text-base-content">{q.question}</p>
              </div>
              <div class="flex shrink-0 flex-wrap gap-2">
                <Button variant="outline" class="btn-sm gap-1" onClick={() => onEdit(q)} disabled={saving}>
                  <Pencil class="h-3.5 w-3.5" aria-hidden />
                  Modifier
                </Button>
                <Button variant="learn" class="btn-sm gap-1" onClick={() => onRemove(q.id)} disabled={saving}>
                  <Trash2 class="h-3.5 w-3.5" aria-hidden />
                  Supprimer
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
