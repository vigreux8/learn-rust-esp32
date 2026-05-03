import { Button } from "../../atomes/Button";
import { QuestionsLlmImportPromptPanel } from "../../molecules/QuestionsLlmImportPromptPanel";
import { useQuestionEditModal } from "./QuestionEditModal.hook";
import { QUESTION_EDIT_MODAL_STYLES } from "./QuestionEditModal.styles";
import type { QuestionEditModalProps } from "./QuestionEditModal.types";
export type { QuestionCreateSavePayload } from "./QuestionEditModal.types";

export function QuestionEditModal(props: QuestionEditModalProps) {
  const { settings, actions, status, data, drafts } = props;
  const { dialogue, creation, composantExterne, editionReponses } = useQuestionEditModal(props);
  if (!settings.open) return null;

  return (
    <div class={QUESTION_EDIT_MODAL_STYLES.overlay} role="presentation">
      <button type="button" class={QUESTION_EDIT_MODAL_STYLES.backdrop} aria-label="Fermer" onClick={dialogue.onBackdropClick} />
      <div class={QUESTION_EDIT_MODAL_STYLES.dialog} role="dialog" aria-modal="true" aria-labelledby="qm-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="qm-title" class="mb-4 text-lg font-semibold text-base-content">{dialogue.title}</h2>

        {dialogue.isCreate ? (
          <>
            {creation.createFormError ? <p class="mb-3 text-sm text-error">{creation.createFormError}</p> : null}
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="qm-categorie">Catégorie</label>
            <select id="qm-categorie" class="select select-bordered select-sm mb-4 w-full max-w-md rounded-xl border-base-content/15 bg-base-100" value={drafts.categorieId ?? ""} disabled={status.saving}
              onChange={(e) => actions.onDraftCategorieId(Number((e.target as HTMLSelectElement).value))}>
              {data.categorieOptions.map((c) => <option key={c.id} value={c.id}>{c.type}</option>)}
            </select>
            {data.sousCollectionsForCreate != null && data.sousCollectionsForCreate.length > 0 ? (
              <>
                <label class="mb-1 block text-xs font-medium text-base-content/60" for="qm-sous-collection">
                  Sous-collection
                </label>
                <select
                  id="qm-sous-collection"
                  class="select select-bordered select-sm mb-4 w-full max-w-md rounded-xl border-base-content/15 bg-base-100"
                  value={drafts.sousCollectionId ?? ""}
                  disabled={status.saving}
                  onChange={(e) => {
                    const raw = (e.target as HTMLSelectElement).value;
                    actions.onDraftSousCollectionId?.(raw === "" ? null : Number(raw));
                  }}
                >
                  <option value="">Aucune (collection seulement)</option>
                  {data.sousCollectionsForCreate.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="qm-question">Énoncé</label>
            <textarea id="qm-question" class="textarea textarea-bordered mb-4 w-full rounded-xl border-base-content/15 text-sm" rows={4} value={drafts.question} onInput={(e) => actions.onDraftQuestion((e.target as HTMLTextAreaElement).value)} />
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="qm-commentaire">Commentaire</label>
            <textarea id="qm-commentaire" class="textarea textarea-bordered mb-4 w-full rounded-xl border-base-content/15 text-sm" rows={3} value={drafts.commentaire} onInput={(e) => actions.onDraftCommentaire((e.target as HTMLTextAreaElement).value)} />
            <div class="mb-4 rounded-xl border border-learn/20 bg-learn/6 p-3">
              <QuestionsLlmImportPromptPanel {...composantExterne.argProp} />
            </div>
            <ul class="mb-6 space-y-3 rounded-xl border border-base-content/10 bg-base-200/30 p-3">
              {creation.createReponses.map((r, idx) => (
                <li key={idx}>
                  <div class="mb-1 flex items-center gap-2">
                    <input type="radio" name="qm-bonne-create" class="radio radio-sm radio-primary" checked={r.correcte} onChange={() => creation.setCreateReponseCorrectAt(idx)} />
                    <span class="text-xs text-base-content/60">{r.correcte ? "Bonne réponse" : `Proposition ${idx + 1}`}</span>
                  </div>
                  <textarea class="textarea textarea-bordered w-full rounded-xl border-base-content/15 text-sm" rows={2} value={r.texte} onInput={(e) => {
                    creation.setCreateReponseTexteAt(idx, (e.target as HTMLTextAreaElement).value);
                  }} />
                </li>
              ))}
            </ul>
            <div class="mt-0 flex flex-wrap justify-end gap-2 border-t border-base-content/10 pt-4">
              <Button variant="ghost" class="btn-sm" disabled={status.saving} onClick={settings.onClose}>Annuler</Button>
              <Button variant="flow" class="btn-sm" disabled={status.saving} onClick={() => void creation.submitCreate()}>{status.saving ? "Création…" : "Créer"}</Button>
            </div>
          </>
        ) : status.error != null ? (
          <div class="py-4 text-center"><p class="mb-4 text-sm text-error">Impossible de charger le détail.</p><Button variant="ghost" class="btn-sm" onClick={settings.onClose}>Fermer</Button></div>
        ) : status.loading || data.questionDetail == null ? (
          <div class="py-8 text-center"><p class="mb-4 text-sm text-base-content/60">Chargement…</p><Button variant="ghost" class="btn-sm" onClick={settings.onClose}>Annuler</Button></div>
        ) : (
          <>
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="qe-question">Énoncé</label>
            <textarea id="qe-question" class="textarea textarea-bordered mb-4 w-full rounded-xl border-base-content/15 text-sm" rows={4} value={drafts.question} onInput={(e) => actions.onDraftQuestion((e.target as HTMLTextAreaElement).value)} />
            <label class="mb-1 block text-xs font-medium text-base-content/60" for="qe-commentaire">Commentaire</label>
            <textarea id="qe-commentaire" class="textarea textarea-bordered mb-4 w-full rounded-xl border-base-content/15 text-sm" rows={3} value={drafts.commentaire} onInput={(e) => actions.onDraftCommentaire((e.target as HTMLTextAreaElement).value)} />
            {editionReponses.reponseError ? <p class="mb-2 text-xs text-error">{editionReponses.reponseError}</p> : null}
            <ul class="mb-6 space-y-3 rounded-xl border border-base-content/10 bg-base-200/30 p-3">
              {data.questionDetail.reponses.map((r) => (
                <li key={r.id}>
                  {editionReponses.editingReponseId === r.id ? (
                    <div class="flex gap-2">
                      <textarea class="textarea textarea-bordered w-full rounded-xl border-base-content/15 text-sm" rows={2} value={editionReponses.reponseDraft} onInput={(e) => editionReponses.setReponseDraft((e.target as HTMLTextAreaElement).value)} />
                      <Button variant="flow" class="btn-xs" disabled={editionReponses.reponseBusy} onClick={() => void editionReponses.submitReponse()}>{editionReponses.reponseBusy ? "…" : "Valider"}</Button>
                    </div>
                  ) : (
                    <div class="flex items-start justify-between gap-2">
                      <span>{r.bonne_reponse ? "✓ " : "○ "}{r.reponse}</span>
                      <Button variant="outline" class="btn-xs" onClick={() => editionReponses.beginEditReponse(r.id, r.reponse)}>Modifier</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div class="mt-0 flex flex-wrap justify-end gap-2 border-t border-base-content/10 pt-4">
              <Button variant="ghost" class="btn-sm" onClick={settings.onClose}>Annuler</Button>
              <Button variant="flow" class="btn-sm" disabled={status.saving} onClick={actions.onSave}>{status.saving ? "Enregistrement…" : "Enregistrer"}</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
