import { useEffect, useState } from "preact/hooks";
import type { QuizzQuestionDetail, RefCategorieRow } from "../../types/quizz";
import { patchReponse } from "../../lib/api";
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
  /** Après mise à jour d’une réponse en base, recharger le détail question. */
  onReponseUpdated: () => void | Promise<void>;
};

/**
 * Modale d’édition d’une question : libellé, catégorie, commentaire, réponses et enregistrement côté API.
 */
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
  onReponseUpdated,
}: QuestionEditModalProps) {
  const [editingReponseId, setEditingReponseId] = useState<number | null>(null);
  const [reponseDraft, setReponseDraft] = useState("");
  const [reponseBusy, setReponseBusy] = useState(false);
  const [reponseError, setReponseError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || detail == null) {
      setEditingReponseId(null);
      setReponseDraft("");
      setReponseError(null);
    }
  }, [open, detail?.id]);

  if (!open) return null;

  const startEditReponse = (reponseId: number, texte: string) => {
    setReponseError(null);
    setEditingReponseId(reponseId);
    setReponseDraft(texte);
  };

  const cancelEditReponse = () => {
    setEditingReponseId(null);
    setReponseDraft("");
    setReponseError(null);
  };

  const submitReponse = async () => {
    if (editingReponseId == null) return;
    const t = reponseDraft.trim();
    if (t.length === 0) {
      setReponseError("Le texte ne peut pas être vide.");
      return;
    }
    setReponseBusy(true);
    setReponseError(null);
    try {
      await patchReponse(editingReponseId, { reponse: t });
      await Promise.resolve(onReponseUpdated());
      cancelEditReponse();
    } catch {
      setReponseError("Enregistrement impossible (réseau ou serveur).");
    } finally {
      setReponseBusy(false);
    }
  };

  return (
    <div class="fixed inset-0 z-100 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        class="absolute inset-0 border-0 bg-base-content/40 p-0"
        aria-label="Fermer"
        onClick={() => !saving && !reponseBusy && onClose()}
      />
      <div
        class="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-base-content/10 bg-base-100 p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="qm-title" class="mb-4 text-lg font-semibold text-base-content">
          Modifier la question
        </h2>
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
              disabled={reponseBusy}
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
              disabled={reponseBusy}
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
              disabled={reponseBusy}
              onInput={(e) => onDraftCommentaire((e.target as HTMLTextAreaElement).value)}
            />

            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/45">
              Réponses
            </p>
            {reponseError ? <p class="mb-2 text-xs text-error">{reponseError}</p> : null}
            <ul class="mb-6 space-y-3 rounded-xl border border-base-content/10 bg-base-200/30 p-3">
              {detail.reponses.map((r) => (
                <li key={r.id} class="text-sm text-base-content/90">
                  {editingReponseId === r.id ? (
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <div class="min-w-0 flex-1">
                        <span class={r.bonne_reponse ? "mb-1 block text-xs font-semibold text-flow" : "mb-1 block text-xs text-base-content/50"}>
                          {r.bonne_reponse ? "Bonne réponse" : "Proposition"}
                        </span>
                        <textarea
                          class="textarea textarea-bordered w-full rounded-xl border-base-content/15 text-sm"
                          rows={2}
                          value={reponseDraft}
                          disabled={reponseBusy}
                          onInput={(e) => setReponseDraft((e.target as HTMLTextAreaElement).value)}
                        />
                      </div>
                      <div class="flex shrink-0 gap-1">
                        <Button
                          variant="flow"
                          class="btn-xs"
                          disabled={reponseBusy}
                          onClick={() => void submitReponse()}
                        >
                          {reponseBusy ? "…" : "Valider"}
                        </Button>
                        <Button variant="ghost" class="btn-xs" disabled={reponseBusy} onClick={cancelEditReponse}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div class="flex flex-wrap items-start justify-between gap-2">
                      <span class={r.bonne_reponse ? "font-semibold text-flow" : ""}>
                        {r.bonne_reponse ? "✓ " : "○ "}
                        {r.reponse}
                      </span>
                      <Button
                        variant="outline"
                        class="btn-xs shrink-0"
                        disabled={reponseBusy || saving}
                        onClick={() => startEditReponse(r.id, r.reponse)}
                      >
                        Modifier
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <div class="mt-0 flex flex-wrap justify-end gap-2 border-t border-base-content/10 pt-4">
              <Button variant="ghost" class="btn-sm" disabled={saving || reponseBusy} onClick={onClose}>
                Annuler
              </Button>
              <Button
                variant="flow"
                class="btn-sm"
                disabled={saving || reponseBusy || loadError != null}
                onClick={onSave}
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
