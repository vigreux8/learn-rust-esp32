import { useEffect, useState } from "preact/hooks";
import { FileJson, Pencil, Trash2 } from "lucide-preact";
import { deleteQuestion, fetchQuestions, patchQuestion } from "../../lib/api";
import type { QuizzQuestionRow } from "../../types/quizz";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { PageMain } from "../molecules/PageMain";
import { Button } from "../atomes/Button";
import { Card } from "../atomes/Card";
import { Badge } from "../atomes/Badge";

const llmPrompt = `Génère un JSON d'import FlowLearn (tables: ref_collection, quizz_question, quizz_reponse, question_collection, quizz_question_reponse). Chaque question : 4 réponses, une seule avec "bonne_reponse": 1.`;

export function QuestionsView() {
  const [questions, setQuestions] = useState<QuizzQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const reload = () => {
    setLoading(true);
    setLoadError(null);
    fetchQuestions()
      .then(setQuestions)
      .catch(() => setLoadError("fetch"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const startEdit = (q: QuizzQuestionRow) => {
    setEditingId(q.id);
    setDraft(q.question);
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setSaving(true);
    try {
      const updated = await patchQuestion(editingId, draft);
      setQuestions((prev) => prev.map((q) => (q.id === editingId ? updated : q)));
      setEditingId(null);
    } catch {
      setLoadError("save");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const remove = async (id: number) => {
    setSaving(true);
    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (editingId === id) setEditingId(null);
    } catch {
      setLoadError("delete");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <PageMain>
        <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Questions</h1>
            <p class="mt-1 text-sm text-base-content/60">
              Modifier ou supprimer via l’API backend (Prisma / SQLite).
            </p>
          </div>
          <Button
            variant="learn"
            class="gap-2 self-start sm:self-auto"
            onClick={() => setImportOpen((o) => !o)}
          >
            <FileJson class="h-4 w-4" aria-hidden />
            Import LLM
          </Button>
        </div>

        {loadError ? (
          <div class="mb-6 rounded-[var(--radius-box)] border border-error/20 bg-error/5 px-4 py-3 text-sm text-base-content">
            Une opération a échoué.{" "}
            <button type="button" class="link link-primary" onClick={() => setLoadError(null)}>
              Fermer
            </button>
          </div>
        ) : null}

        {importOpen ? (
          <Card class="fl-reveal-enter mb-6 border-learn/15 bg-learn/[0.06]">
            <p class="mb-2 text-sm font-medium text-base-content">Prompt à copier pour ton LLM</p>
            <textarea
              class="textarea textarea-bordered mb-3 w-full min-h-28 rounded-2xl border-base-content/15 bg-base-100/80 text-sm transition duration-300"
              readOnly
              value={llmPrompt}
            />
            <p class="mb-2 text-xs text-base-content/55">Colle le JSON généré ici (zone désactivée en démo).</p>
            <textarea
              class="textarea textarea-bordered mb-3 w-full min-h-24 rounded-2xl border-dashed border-learn/35 bg-base-100/60 text-sm"
              placeholder='{ "questions": [ ... ] }'
              disabled
            />
            <Button variant="flow" disabled class="opacity-70">
              Importer (bientôt)
            </Button>
          </Card>
        ) : null}

        {loading ? (
          <p class="text-sm text-base-content/60">Chargement…</p>
        ) : loadError === "fetch" ? (
          <Card class="border-base-content/15">
            <p class="mb-3 text-sm text-base-content/70">Impossible de charger les questions.</p>
            <Button variant="flow" class="btn-sm" onClick={reload}>
              Réessayer
            </Button>
          </Card>
        ) : (
          <Card>
            <p class="mb-4 text-sm text-base-content/60">
              {questions.length} question{questions.length !== 1 ? "s" : ""} affichée
              {questions.length !== 1 ? "s" : ""}.
            </p>
            <ul class="space-y-3">
              {questions.map((q) => (
                <li
                  key={q.id}
                  class="overflow-hidden rounded-[1.35rem] border border-base-content/10 bg-base-200/35 transition duration-300 hover:border-flow/20 hover:shadow-md hover:shadow-flow/5"
                >
                  <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div class="min-w-0 flex-1">
                      <Badge tone="neutral" class="mb-2">
                        id {q.id}
                      </Badge>
                      {editingId === q.id ? (
                        <textarea
                          class="textarea textarea-bordered w-full rounded-2xl border-base-content/15 text-sm transition duration-300"
                          value={draft}
                          onInput={(e) => setDraft((e.target as HTMLTextAreaElement).value)}
                          rows={3}
                        />
                      ) : (
                        <p class="text-sm font-medium leading-relaxed text-base-content">{q.question}</p>
                      )}
                    </div>
                    <div class="flex shrink-0 flex-wrap gap-2">
                      {editingId === q.id ? (
                        <>
                          <Button variant="flow" class="btn-sm" onClick={saveEdit} disabled={saving}>
                            Enregistrer
                          </Button>
                          <Button variant="ghost" class="btn-sm" onClick={cancelEdit} disabled={saving}>
                            Annuler
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" class="btn-sm gap-1" onClick={() => startEdit(q)} disabled={saving}>
                            <Pencil class="h-3.5 w-3.5" aria-hidden />
                            Modifier
                          </Button>
                          <Button variant="learn" class="btn-sm gap-1" onClick={() => remove(q.id)} disabled={saving}>
                            <Trash2 class="h-3.5 w-3.5" aria-hidden />
                            Supprimer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </PageMain>
      <AppFooter />
    </div>
  );
}
