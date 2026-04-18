import { useEffect, useState } from "preact/hooks";
import { patchReponse } from "../../../lib/api";

import { buildLlmCreateQuestionPrompt, parseCreateQuestionLlmJson } from "../../../lib/questionCreateLlmJson";

import { defaultCreateReponses } from "./QuestionEditModal.metier";
import type { QuestionEditModalProps } from "./QuestionEditModal.types";

export function useQuestionEditModal(props: QuestionEditModalProps) {
  const settings = props.settings;
  const actions = props.actions;
  const status = props.status;
  const data = props.data;
  const drafts = props.drafts;

  const variant = settings.variant ?? "edit";
  const categorieOptions = data.categorieOptions;

  const [editingReponseId, setEditingReponseId] = useState<number | null>(null);
  const [reponseDraft, setReponseDraft] = useState("");
  const [reponseBusy, setReponseBusy] = useState(false);
  const [reponseError, setReponseError] = useState<string | null>(null);
  const [createReponses, setCreateReponses] = useState(defaultCreateReponses);
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [llmJsonDraft, setLlmJsonDraft] = useState("");
  const [llmHint, setLlmHint] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const isCreate = variant === "create";
  const title = settings.modalTitle ?? (isCreate ? "Nouvelle question" : "Modifier la question");

  useEffect(() => {
    if (!settings.open) return;
    if (isCreate) {
      setCreateReponses(defaultCreateReponses());
      setCreateFormError(null);
      setLlmJsonDraft("");
      setLlmHint(null);
    }
  }, [settings.open, isCreate]);

  const submitReponse = async () => {
    if (editingReponseId == null) return;
    const t = reponseDraft.trim();
    if (!t) return void setReponseError("Le texte ne peut pas être vide.");
    setReponseBusy(true);
    setReponseError(null);
    try {
      await patchReponse(editingReponseId, { reponse: t });
      await Promise.resolve(actions.onReponseUpdated());
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
    if (drafts.categorieId == null) return void setCreateFormError("Choisis une catégorie.");
    const q = drafts.question.trim();
    if (!q) return void setCreateFormError("L’énoncé ne peut pas être vide.");
    const reps = createReponses.map((r) => ({ ...r, texte: r.texte.trim() }));
    if (reps.some((r) => !r.texte)) return void setCreateFormError("Toutes les propositions doivent être renseignées.");
    if (reps.filter((r) => r.correcte).length !== 1) return void setCreateFormError("Indique exactement une bonne réponse.");
    if (!actions.onCreateSave) return void setCreateFormError("Configuration interne : onCreateSave manquant.");
    await Promise.resolve(
      actions.onCreateSave({
        question: q,
        commentaire: drafts.commentaire.trim(),
        categorie_id: drafts.categorieId,
        reponses: reps,
      }),
    );
  };

  const applyLlmJsonPaste = () => {
    const res = parseCreateQuestionLlmJson(llmJsonDraft, { categorieOptions, fallbackCategorieId: drafts.categorieId });
    if (!res.ok) return void setLlmHint({ tone: "err", text: res.error });
    actions.onDraftQuestion(res.value.question);
    actions.onDraftCommentaire(res.value.commentaire);
    actions.onDraftCategorieId(res.value.categorie_id);
    setCreateReponses(res.value.reponses);
    setLlmJsonDraft("");
    setLlmHint({ tone: "ok", text: "Champs mis à jour à partir du JSON." });
  };

  const onBackdropClick = () => {
    if (!status.saving && !reponseBusy) settings.onClose();
  };

  const copyLlmPrompt = () => {
    void navigator.clipboard.writeText(buildLlmCreateQuestionPrompt(drafts.question, categorieOptions));
  };

  const setCreateReponseCorrectAt = (idx: number) => {
    setCreateReponses((prev) => prev.map((row, i) => ({ ...row, correcte: i === idx })));
  };

  const setCreateReponseTexteAt = (idx: number, v: string) => {
    setCreateReponses((prev) => prev.map((row, i) => (i === idx ? { ...row, texte: v } : row)));
  };

  const beginEditReponse = (id: number, reponse: string) => {
    setEditingReponseId(id);
    setReponseDraft(reponse);
  };

  const dialogue = {
    title,
    isCreate,
    onBackdropClick,
  };

  const creation = {
    submitCreate,
    createFormError,
    createReponses,
    setCreateReponseCorrectAt,
    setCreateReponseTexteAt,
  };

  const llm = {
    llmHint,
    llmJsonDraft,
    setLlmJsonDraft,
    applyLlmJsonPaste,
    copyLlmPrompt,
  };

  const editionReponses = {
    editingReponseId,
    reponseDraft,
    setReponseDraft,
    reponseBusy,
    reponseError,
    submitReponse,
    beginEditReponse,
  };

  return {
    dialogue,
    creation,
    llm,
    editionReponses,
  };
}
