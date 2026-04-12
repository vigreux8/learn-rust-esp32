import type { QuizzQuestionDetail, RefCategorieRow } from "../../types/quizz";
import { Button } from "../atomes/Button";

export type QuestionEditModalProps = {
  open: boolean;
  loading: boolean;
  loadError: string | null;
  detail: QuizzQuestionDetail | null;
  categorieOptions: RefCategorieRow[];
  draftQuestion: string;
  draftCommentaire: string;
  draftCategorieId: number | null;
  saving: boolean;
  onClose: () => void;
  onDraftQuestion: (v: string) => void;
  onDraftCommentaire: (v: string) => void;
  onDraftCategorieId: (id: number) => void;
  onSave: () => void;
};

export function QuestionEditModal({
  open,
  loading,
  loadError,
  detail,
  categorieOptions,
  draftQuestion,
  draftCommentaire,
  draftCategorieId,
  saving,
  onClose,
  onDraftQuestion,
  onDraftCommentaire,
  onDraftCategorieId,
  onSave,
}: QuestionEditModalProps) {
  if (!open) return null;

  return (
    <div class="modal modal-open z-50" role="presentation">
      <button
        type="button"
        class="modal-backdrop bg-base-content/40"
        aria-label="Fermer"
        onClick={() => !saving && onClose()}
      />
      <div class="modal-box relative max-h-[90vh] max-w-2xl overflow-y-auto border border-base-content/10 shadow-2xl">
        <h2 class="mb-4 text-lg font-semibold text-base-content">Modifier la question</h2>
        {loadError != null ? (
          <div class="py-4 text-center">
            <p class="mb-4 text-sm text-error">
              Impossible de charger le détail (réponses, catégorie).
            </p>
            <Button variant="ghost" class="btn-sm" onClick={onClose}>
              Fermer
            </Button>
          </div>
        ) : loading || detail == null ? (
          <div class="py-8 text-center">
            <p class="mb-4 text-sm text-base-content/60">Chargement…</p>
            <Button variant="ghost" class="btn-sm" disabled={saving} onClick={onClose}>
              Annuler
            </Button>
          </div>
        ) : (
          <>
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="qm-categorie">
              Catégorie
            </label>
            <select
              id="qm-categorie"
              class="select select-bordered select-sm mb-4 w-full max-w-md rounded-xl border-base-content/15 bg-base-100"
              value={draftCategorieId ?? ""}
              onChange={(e) => {
                const v = Number((e.target as HTMLSelectElement).value);
                if (Number.isFinite(v)) onDraftCategorieId(v);
              }}
            >
              {categorieOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.type}
                </option>
              ))}
            </select>

            <label class="mb-1 block text-xs font-medium text-base-content/60" for="qm-question">
              Énoncé
            </label>
            <textarea
              id="qm-question"
              class="textarea textarea-bordered mb-4 w-full rounded-xl border-base-content/15 text-sm"
              rows={4}
              value={draftQuestion}
              onInput={(e) => onDraftQuestion((e.target as HTMLTextAreaElement).value)}
            />

            <label class="mb-1 block text-xs font-medium text-base-content/60" for="qm-commentaire">
              Commentaire (anecdote)
            </label>
            <textarea
              id="qm-commentaire"
              class="textarea textarea-bordered mb-6 w-full rounded-xl border-base-content/15 text-sm"
              rows={3}
              value={draftCommentaire}
              onInput={(e) => onDraftCommentaire((e.target as HTMLTextAreaElement).value)}
            />

            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/45">
              Réponses (lecture seule)
            </p>
            <ul class="mb-6 space-y-2 rounded-xl border border-base-content/10 bg-base-200/30 p-3">
              {detail.reponses.map((r) => (
                <li key={r.id} class="text-sm text-base-content/90">
                  <span class={r.bonne_reponse ? "font-semibold text-flow" : ""}>
                    {r.bonne_reponse ? "✓ " : "○ "}
                    {r.reponse}
                  </span>
                </li>
              ))}
            </ul>

            <div class="modal-action mt-0 flex flex-wrap justify-end gap-2">
              <Button variant="ghost" class="btn-sm" disabled={saving} onClick={onClose}>
                Annuler
              </Button>
              <Button variant="flow" class="btn-sm" disabled={saving || loadError != null} onClick={onSave}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
