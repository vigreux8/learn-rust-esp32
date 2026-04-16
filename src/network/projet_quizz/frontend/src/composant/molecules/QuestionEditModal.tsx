import { useEffect, useState } from "preact/hooks";
import { ClipboardCopy } from "lucide-preact";
import type { QuizzQuestionDetail, RefCategorieRow } from "../../types/quizz";
import { patchReponse } from "../../lib/api";
import { buildLlmCreateQuestionPrompt, parseCreateQuestionLlmJson } from "../../lib/questionCreateLlmJson";
import { Button } from "../atomes/Button";

export type QuestionCreateSavePayload = {
  question: string;
  commentaire: string;
  categorie_id: number;
  reponses: { texte: string; correcte: boolean }[];
};

export type QuestionEditModalProps = {
  open: boolean;
  /** `create` : nouvelle question (4 propositions dont une correcte), sans PATCH intermédiaires sur les réponses. */
  variant?: "edit" | "create";
  /** Titre du dialogue (sinon libellés par défaut selon le variant). */
  modalTitle?: string;
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
  /** Après mise à jour d’une réponse en base, recharger le détail question (mode édition). */
  onReponseUpdated: () => void | Promise<void>;
  /** Mode `create` : persistance de la nouvelle question (corps attendu aligné sur l’API). */
  onCreateSave?: (payload: QuestionCreateSavePayload) => void | Promise<void>;
};

const defaultCreateReponses = (): { texte: string; correcte: boolean }[] => [
  { texte: "", correcte: true },
  { texte: "", correcte: false },
  { texte: "", correcte: false },
  { texte: "", correcte: false },
];

/**
 * Modale d’édition ou de création d’une question : libellé, catégorie, commentaire, réponses et enregistrement.
 */
export function QuestionEditModal({
  open,
  variant = "edit",
  modalTitle,
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
  onCreateSave,
}: QuestionEditModalProps) {
  const [editingReponseId, setEditingReponseId] = useState<number | null>(null);
  const [reponseDraft, setReponseDraft] = useState("");
  const [reponseBusy, setReponseBusy] = useState(false);
  const [reponseError, setReponseError] = useState<string | null>(null);
  const [createReponses, setCreateReponses] = useState(defaultCreateReponses);
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [llmJsonDraft, setLlmJsonDraft] = useState("");
  const [llmHint, setLlmHint] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const isCreate = variant === "create";

  useEffect(() => {
    if (!open) return;
    if (isCreate) {
      setCreateReponses(defaultCreateReponses());
      setCreateFormError(null);
      setLlmJsonDraft("");
      setLlmHint(null);
      setEditingReponseId(null);
      setReponseDraft("");
      setReponseError(null);
      return;
    }
    if (detail == null) {
      setEditingReponseId(null);
      setReponseDraft("");
      setReponseError(null);
    }
  }, [open, isCreate, detail?.id]);

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

  const setCreateCorrectIndex = (idx: number) => {
    setCreateReponses((prev) => prev.map((r, i) => ({ ...r, correcte: i === idx })));
  };

  const copyLlmPrompt = async () => {
    setLlmHint(null);
    const text = buildLlmCreateQuestionPrompt(draftQuestion, categorieOptions);
    try {
      await navigator.clipboard.writeText(text);
      setLlmHint({
        tone: "ok",
        text: "Prompt copié : le LLM doit reformuler ton brouillon, ajouter le commentaire et les réponses. Colle ensuite le JSON ci-dessous.",
      });
    } catch {
      setLlmHint({ tone: "err", text: "Copie impossible (permissions du navigateur)." });
    }
  };

  const applyLlmJsonPaste = () => {
    setCreateFormError(null);
    setLlmHint(null);
    const res = parseCreateQuestionLlmJson(llmJsonDraft, {
      categorieOptions,
      fallbackCategorieId: draftCategorieId,
    });
    if (!res.ok) {
      setLlmHint({ tone: "err", text: res.error });
      return;
    }
    const v = res.value;
    onDraftQuestion(v.question);
    onDraftCommentaire(v.commentaire);
    onDraftCategorieId(v.categorie_id);
    setCreateReponses(v.reponses);
    setLlmJsonDraft("");
    setLlmHint({ tone: "ok", text: "Champs mis à jour à partir du JSON." });
  };

  const submitCreate = async () => {
    setCreateFormError(null);
    if (draftCategorieId == null) {
      setCreateFormError("Choisis une catégorie.");
      return;
    }
    const q = draftQuestion.trim();
    if (q.length === 0) {
      setCreateFormError("L’énoncé ne peut pas être vide.");
      return;
    }
    const reps = createReponses.map((r) => ({ ...r, texte: r.texte.trim() }));
    for (let i = 0; i < reps.length; i += 1) {
      if (reps[i].texte.length === 0) {
        setCreateFormError(`La proposition ${i + 1} ne peut pas être vide.`);
        return;
      }
    }
    if (reps.filter((r) => r.correcte).length !== 1) {
      setCreateFormError("Indique exactement une bonne réponse.");
      return;
    }
    if (onCreateSave == null) {
      setCreateFormError("Configuration interne : onCreateSave manquant.");
      return;
    }
    try {
      await Promise.resolve(
        onCreateSave({
          question: q,
          commentaire: draftCommentaire.trim(),
          categorie_id: draftCategorieId,
          reponses: reps,
        }),
      );
    } catch {
      setCreateFormError("Création impossible (réseau ou serveur).");
    }
  };

  const title =
    modalTitle ?? (isCreate ? "Nouvelle question" : "Modifier la question");

  const renderSharedFields = (opts: { disabled: boolean }) => (
    <>
      <label class="mb-1 block text-xs font-medium text-base-content/60" for="qm-categorie">
        Catégorie
      </label>
      <select
        id="qm-categorie"
        class="select select-bordered select-sm mb-4 w-full max-w-md rounded-xl border-base-content/15 bg-base-100"
        value={draftCategorieId ?? ""}
        disabled={opts.disabled}
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
        disabled={opts.disabled}
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
        disabled={opts.disabled}
        onInput={(e) => onDraftCommentaire((e.target as HTMLTextAreaElement).value)}
      />
    </>
  );

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
          {title}
        </h2>

        {isCreate ? (
          <>
            {createFormError ? <p class="mb-3 text-sm text-error">{createFormError}</p> : null}
            {llmHint ? (
              <p
                class={`mb-3 text-sm ${llmHint.tone === "ok" ? "text-flow" : "text-error"}`}
                role="status"
              >
                {llmHint.text}
              </p>
            ) : null}
            {renderSharedFields({ disabled: saving })}
            <div class="mb-6 rounded-xl border border-learn/20 bg-learn/[0.06] p-4">
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                Assistant LLM
              </p>
              <p class="mb-3 text-xs leading-relaxed text-base-content/60">
                Rédige une seule fois ton idée dans « Énoncé » (brouillon), puis copie le prompt : le LLM reformulera
                l’énoncé, rédigera le commentaire et les 4 réponses au format JSON. Colle sa réponse puis applique pour
                pré-remplir le formulaire.
              </p>
              <div class="mb-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  class="btn-sm gap-1"
                  type="button"
                  disabled={saving}
                  title="Consigne : reformuler ton brouillon + commentaire + JSON (4 réponses)"
                  onClick={() => void copyLlmPrompt()}
                >
                  <ClipboardCopy class="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Copier prompt pour le LLM
                </Button>
              </div>
              <label class="mb-1 block text-xs font-medium text-base-content/60" for="qm-llm-json">
                Coller le JSON renvoyé par le LLM
              </label>
              <textarea
                id="qm-llm-json"
                class="textarea textarea-bordered mb-2 w-full rounded-xl border-base-content/15 font-mono text-xs"
                rows={5}
                placeholder='{"question":"…","commentaire":"…","categorie_type":"histoire","reponses":[…]}'
                value={llmJsonDraft}
                disabled={saving}
                onInput={(e) => setLlmJsonDraft((e.target as HTMLTextAreaElement).value)}
              />
              <Button variant="learn" class="btn-sm" type="button" disabled={saving} onClick={applyLlmJsonPaste}>
                Appliquer le JSON au formulaire
              </Button>
            </div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/45">
              Réponses (exactement une bonne réponse)
            </p>
            <ul class="mb-6 space-y-4 rounded-xl border border-base-content/10 bg-base-200/30 p-3">
              {createReponses.map((r, idx) => (
                <li key={idx} class="text-sm text-base-content/90">
                  <div class="mb-1 flex items-center gap-2">
                    <input
                      type="radio"
                      name="qm-bonne-create"
                      id={`qm-bonne-${idx}`}
                      class="radio radio-sm radio-primary"
                      checked={r.correcte}
                      disabled={saving}
                      onChange={() => setCreateCorrectIndex(idx)}
                    />
                    <label class="text-xs font-medium text-base-content/60" for={`qm-bonne-${idx}`}>
                      {r.correcte ? "Bonne réponse" : `Proposition ${idx + 1}`}
                    </label>
                  </div>
                  <textarea
                    class="textarea textarea-bordered w-full rounded-xl border-base-content/15 text-sm"
                    rows={2}
                    value={r.texte}
                    disabled={saving}
                    onInput={(e) => {
                      const v = (e.target as HTMLTextAreaElement).value;
                      setCreateReponses((prev) =>
                        prev.map((row, i) => (i === idx ? { ...row, texte: v } : row)),
                      );
                    }}
                  />
                </li>
              ))}
            </ul>
            <div class="mt-0 flex flex-wrap justify-end gap-2 border-t border-base-content/10 pt-4">
              <Button variant="ghost" class="btn-sm" disabled={saving} onClick={onClose}>
                Annuler
              </Button>
              <Button variant="flow" class="btn-sm" disabled={saving} onClick={() => void submitCreate()}>
                {saving ? "Création…" : "Créer"}
              </Button>
            </div>
          </>
        ) : loadError != null ? (
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
            {renderSharedFields({ disabled: reponseBusy })}

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
