import { useEffect, useState } from "preact/hooks";
import { ClipboardCopy } from "lucide-preact";
import { patchReponse } from "../../../lib/api";
import { buildLlmCreateQuestionPrompt, parseCreateQuestionLlmJson } from "../../../lib/questionCreateLlmJson";
import { Button } from "../../atomes/Button";
import { defaultCreateReponses } from "./QuestionEditModal.metier";
import { QUESTION_EDIT_MODAL_STYLES } from "./QuestionEditModal.styles";
import type { QuestionEditModalProps } from "./QuestionEditModal.types";

export type { QuestionCreateSavePayload } from "./QuestionEditModal.types";

export function QuestionEditModal(props: QuestionEditModalProps) {
  const {
    open, variant = "edit", modalTitle, loading, loadError, detail, categorieOptions, draftQuestion, draftCommentaire,
    draftCategorieId, saving, onClose, onDraftQuestion, onDraftCommentaire, onDraftCategorieId, onSave, onReponseUpdated, onCreateSave,
  } = props;

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
    }
  }, [open, isCreate]);

  if (!open) return null;

  const submitReponse = async () => {
    if (editingReponseId == null) return;
    const t = reponseDraft.trim();
    if (!t) return void setReponseError("Le texte ne peut pas être vide.");
    setReponseBusy(true);
    setReponseError(null);
    try {
      await patchReponse(editingReponseId, { reponse: t });
      await Promise.resolve(onReponseUpdated());
      setEditingReponseId(null);
      setReponseDraft("");
    } catch {
      setReponseError("Enregistrement impossible (réseau ou serveur).");
    } finally {
      setReponseBusy(false);
    }
  };

  const submitCreate = async () => {
    setCreateFormError(null);
    if (draftCategorieId == null) return void setCreateFormError("Choisis une catégorie.");
    const q = draftQuestion.trim();
    if (!q) return void setCreateFormError("L’énoncé ne peut pas être vide.");
    const reps = createReponses.map((r) => ({ ...r, texte: r.texte.trim() }));
    if (reps.some((r) => !r.texte)) return void setCreateFormError("Toutes les propositions doivent être renseignées.");
    if (reps.filter((r) => r.correcte).length !== 1) return void setCreateFormError("Indique exactement une bonne réponse.");
    if (!onCreateSave) return void setCreateFormError("Configuration interne : onCreateSave manquant.");
    await Promise.resolve(onCreateSave({ question: q, commentaire: draftCommentaire.trim(), categorie_id: draftCategorieId, reponses: reps }));
  };

  const applyLlmJsonPaste = () => {
    const res = parseCreateQuestionLlmJson(llmJsonDraft, { categorieOptions, fallbackCategorieId: draftCategorieId });
    if (!res.ok) return void setLlmHint({ tone: "err", text: res.error });
    onDraftQuestion(res.value.question);
    onDraftCommentaire(res.value.commentaire);
    onDraftCategorieId(res.value.categorie_id);
    setCreateReponses(res.value.reponses);
    setLlmJsonDraft("");
    setLlmHint({ tone: "ok", text: "Champs mis à jour à partir du JSON." });
  };

  const title = modalTitle ?? (isCreate ? "Nouvelle question" : "Modifier la question");

  return (
    <div class={QUESTION_EDIT_MODAL_STYLES.overlay} role="presentation">
      <button type="button" class={QUESTION_EDIT_MODAL_STYLES.backdrop} aria-label="Fermer" onClick={() => !saving && !reponseBusy && onClose()} />
      <div class={QUESTION_EDIT_MODAL_STYLES.dialog} role="dialog" aria-modal="true" aria-labelledby="qm-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="qm-title" class="mb-4 text-lg font-semibold text-base-content">{title}</h2>

        {isCreate ? (
          <>
            {createFormError ? <p class="mb-3 text-sm text-error">{createFormError}</p> : null}
            {llmHint ? <p class={`mb-3 text-sm ${llmHint.tone === "ok" ? "text-flow" : "text-error"}`}>{llmHint.text}</p> : null}
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="qm-categorie">Catégorie</label>
            <select id="qm-categorie" class="select select-bordered select-sm mb-4 w-full max-w-md rounded-xl border-base-content/15 bg-base-100" value={draftCategorieId ?? ""} disabled={saving}
              onChange={(e) => onDraftCategorieId(Number((e.target as HTMLSelectElement).value))}>
              {categorieOptions.map((c) => <option key={c.id} value={c.id}>{c.type}</option>)}
            </select>
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="qm-question">Énoncé</label>
            <textarea id="qm-question" class="textarea textarea-bordered mb-4 w-full rounded-xl border-base-content/15 text-sm" rows={4} value={draftQuestion} onInput={(e) => onDraftQuestion((e.target as HTMLTextAreaElement).value)} />
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="qm-commentaire">Commentaire</label>
            <textarea id="qm-commentaire" class="textarea textarea-bordered mb-4 w-full rounded-xl border-base-content/15 text-sm" rows={3} value={draftCommentaire} onInput={(e) => onDraftCommentaire((e.target as HTMLTextAreaElement).value)} />
            <div class="mb-4 rounded-xl border border-learn/20 bg-learn/[0.06] p-4">
              <Button variant="outline" class="btn-sm gap-1 mb-2" type="button" disabled={saving} onClick={() => void navigator.clipboard.writeText(buildLlmCreateQuestionPrompt(draftQuestion, categorieOptions))}>
                <ClipboardCopy class="h-3.5 w-3.5 shrink-0" aria-hidden />Copier prompt pour le LLM
              </Button>
              <textarea id="qm-llm-json" class="textarea textarea-bordered mb-2 w-full rounded-xl border-base-content/15 font-mono text-xs" rows={5} value={llmJsonDraft} onInput={(e) => setLlmJsonDraft((e.target as HTMLTextAreaElement).value)} />
              <Button variant="learn" class="btn-sm" type="button" disabled={saving} onClick={applyLlmJsonPaste}>Appliquer le JSON</Button>
            </div>
            <ul class="mb-6 space-y-3 rounded-xl border border-base-content/10 bg-base-200/30 p-3">
              {createReponses.map((r, idx) => (
                <li key={idx}>
                  <div class="mb-1 flex items-center gap-2">
                    <input type="radio" name="qm-bonne-create" class="radio radio-sm radio-primary" checked={r.correcte} onChange={() => setCreateReponses((prev) => prev.map((row, i) => ({ ...row, correcte: i === idx })))} />
                    <span class="text-xs text-base-content/60">{r.correcte ? "Bonne réponse" : `Proposition ${idx + 1}`}</span>
                  </div>
                  <textarea class="textarea textarea-bordered w-full rounded-xl border-base-content/15 text-sm" rows={2} value={r.texte} onInput={(e) => {
                    const v = (e.target as HTMLTextAreaElement).value;
                    setCreateReponses((prev) => prev.map((row, i) => (i === idx ? { ...row, texte: v } : row)));
                  }} />
                </li>
              ))}
            </ul>
            <div class="mt-0 flex flex-wrap justify-end gap-2 border-t border-base-content/10 pt-4">
              <Button variant="ghost" class="btn-sm" disabled={saving} onClick={onClose}>Annuler</Button>
              <Button variant="flow" class="btn-sm" disabled={saving} onClick={() => void submitCreate()}>{saving ? "Création…" : "Créer"}</Button>
            </div>
          </>
        ) : loadError != null ? (
          <div class="py-4 text-center"><p class="mb-4 text-sm text-error">Impossible de charger le détail.</p><Button variant="ghost" class="btn-sm" onClick={onClose}>Fermer</Button></div>
        ) : loading || detail == null ? (
          <div class="py-8 text-center"><p class="mb-4 text-sm text-base-content/60">Chargement…</p><Button variant="ghost" class="btn-sm" onClick={onClose}>Annuler</Button></div>
        ) : (
          <>
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="qe-question">Énoncé</label>
            <textarea id="qe-question" class="textarea textarea-bordered mb-4 w-full rounded-xl border-base-content/15 text-sm" rows={4} value={draftQuestion} onInput={(e) => onDraftQuestion((e.target as HTMLTextAreaElement).value)} />
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="qe-commentaire">Commentaire</label>
            <textarea id="qe-commentaire" class="textarea textarea-bordered mb-4 w-full rounded-xl border-base-content/15 text-sm" rows={3} value={draftCommentaire} onInput={(e) => onDraftCommentaire((e.target as HTMLTextAreaElement).value)} />
            {reponseError ? <p class="mb-2 text-xs text-error">{reponseError}</p> : null}
            <ul class="mb-6 space-y-3 rounded-xl border border-base-content/10 bg-base-200/30 p-3">
              {detail.reponses.map((r) => (
                <li key={r.id}>
                  {editingReponseId === r.id ? (
                    <div class="flex gap-2">
                      <textarea class="textarea textarea-bordered w-full rounded-xl border-base-content/15 text-sm" rows={2} value={reponseDraft} onInput={(e) => setReponseDraft((e.target as HTMLTextAreaElement).value)} />
                      <Button variant="flow" class="btn-xs" disabled={reponseBusy} onClick={() => void submitReponse()}>{reponseBusy ? "…" : "Valider"}</Button>
                    </div>
                  ) : (
                    <div class="flex items-start justify-between gap-2">
                      <span>{r.bonne_reponse ? "✓ " : "○ "}{r.reponse}</span>
                      <Button variant="outline" class="btn-xs" onClick={() => { setEditingReponseId(r.id); setReponseDraft(r.reponse); }}>Modifier</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div class="mt-0 flex flex-wrap justify-end gap-2 border-t border-base-content/10 pt-4">
              <Button variant="ghost" class="btn-sm" onClick={onClose}>Annuler</Button>
              <Button variant="flow" class="btn-sm" disabled={saving} onClick={onSave}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
