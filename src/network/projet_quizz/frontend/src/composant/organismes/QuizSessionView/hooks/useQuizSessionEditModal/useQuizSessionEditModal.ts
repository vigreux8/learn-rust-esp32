import { useEffect, useState } from "preact/hooks";
import {
  deleteImplicitQuestionRelation,
  fetchQuestionDetail,
  fetchSousCollections,
  patchQuestion,
  postAttachQuestionToSousCollection,
  postCreateQuestion,
} from "../../../../../lib/api";
import type { QuestionUi, QuizzQuestionDetail } from "../../../../../types/quizz";
import type { QuestionCreateSavePayload } from "../../../QuestionEditModal/QuestionEditModal.types";
import { mergeQuizSessionQuestionFromRow } from "../../QuizSessionView.metier";
import type {
  UseQuizSessionEditModalOptions,
  UseQuizSessionEditModalResult,
} from "./useQuizSessionEditModal.types";

export function useQuizSessionEditModal(opts: UseQuizSessionEditModalOptions): UseQuizSessionEditModalResult {
  const { navigation, identity, session, refs, feedback, dataDeps } = opts;
  const { userId } = identity;

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionModalVariant, setQuestionModalVariant] = useState<"edit" | "create">("edit");
  const [createParentQuestionId, setCreateParentQuestionId] = useState<number | null>(null);
  const [questionModalLoading, setQuestionModalLoading] = useState(false);
  const [questionModalError, setQuestionModalError] = useState<string | null>(null);
  const [questionModalDetail, setQuestionModalDetail] = useState<QuizzQuestionDetail | null>(null);
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftCommentaire, setDraftCommentaire] = useState("");
  const [draftCategorieId, setDraftCategorieId] = useState<number | null>(null);
  const [questionModalSaving, setQuestionModalSaving] = useState(false);
  const [sousCollectionsForCreateModal, setSousCollectionsForCreateModal] = useState<
    { id: number; nom: string }[]
  >([]);
  const [draftSousCollectionId, setDraftSousCollectionId] = useState<number | null>(null);
  const [draftCreateLinkImplicit, setDraftCreateLinkImplicit] = useState(true);

  useEffect(() => {
    setQuestionModalOpen(false);
  }, [navigation.viewingIndex]);

  const closeQuestionModal = () => {
    setQuestionModalOpen(false);
    setQuestionModalLoading(false);
    setQuestionModalError(null);
    setQuestionModalDetail(null);
    setCreateParentQuestionId(null);
    setSousCollectionsForCreateModal([]);
    setDraftSousCollectionId(null);
    setDraftCreateLinkImplicit(true);
  };

  const refreshQuestionModalDetail = async () => {
    if (questionModalDetail == null) return;
    try {
      const d = await fetchQuestionDetail(questionModalDetail.id);
      setQuestionModalDetail(d);
      dataDeps.setSession((prev) => {
        if (!prev) return prev;
        const qi = prev.questions.findIndex((x) => x.id === d.id);
        if (qi < 0) return prev;
        const questions = [...prev.questions];
        const cur = questions[qi];
        if (!cur) return prev;
        questions[qi] = { ...cur, reponses: d.reponses };
        return { ...prev, questions };
      });
    } catch {
      /* garder l’affichage actuel */
    }
  };

  const removeImplicitRelationFromQuestionModal = async (relationId: number) => {
    try {
      await deleteImplicitQuestionRelation(relationId);
      await refreshQuestionModalDetail();
      feedback.setMessage("Lien implicite retiré.");
    } catch {
      feedback.setMessage("Suppression du lien impossible.");
    }
  };

  const saveEditQuestionModal = async () => {
    if (questionModalDetail == null) return;
    setQuestionModalSaving(true);
    try {
      const payload: { question?: string; commentaire?: string; categorie_id?: number } = {};
      if (draftQuestion !== questionModalDetail.question) payload.question = draftQuestion;
      if (draftCommentaire !== questionModalDetail.commentaire) payload.commentaire = draftCommentaire;
      if (draftCategorieId != null && draftCategorieId !== questionModalDetail.categorie_id) {
        payload.categorie_id = draftCategorieId;
      }
      if (Object.keys(payload).length === 0) {
        closeQuestionModal();
        return;
      }
      const updated = await patchQuestion(questionModalDetail.id, payload);
      dataDeps.setSession((prev) => {
        if (!prev) return prev;
        const qi = prev.questions.findIndex((x) => x.id === updated.id);
        if (qi < 0) return prev;
        const questions = [...prev.questions];
        const cur = questions[qi];
        if (!cur) return prev;
        questions[qi] = mergeQuizSessionQuestionFromRow(cur, updated);
        return { ...prev, questions };
      });
      feedback.setMessage("Question mise à jour.");
      closeQuestionModal();
    } catch {
      feedback.setMessage("Enregistrement impossible.");
    } finally {
      setQuestionModalSaving(false);
    }
  };

  const saveCreateQuestionModal = async (payload: QuestionCreateSavePayload) => {
    if (createParentQuestionId == null) return;
    setQuestionModalSaving(true);
    try {
      const withImplicitParentLink = payload.link_implicit_relation !== false;
      const created = await postCreateQuestion({
        user_id: userId,
        categorie_id: payload.categorie_id,
        question: payload.question,
        commentaire: payload.commentaire,
        reponses: payload.reponses,
        ...(withImplicitParentLink ? { parent_question_id: createParentQuestionId } : {}),
        collection_id: session?.collectionId ?? undefined,
      });
      if (payload.sous_collection_id != null) {
        await postAttachQuestionToSousCollection(payload.sous_collection_id, {
          user_id: userId,
          question_id: created.id,
        });
      }
      const sousPart = payload.sous_collection_id != null;
      let msg: string;
      if (withImplicitParentLink) {
        msg = sousPart
          ? "Question créée, liée au parent (relation implicite) et à la sous-collection choisie."
          : "Question créée et liée à la question affichée via la relation implicite.";
      } else {
        msg = sousPart
          ? "Question créée sans lien implicite avec la parente ; rattachement à la sous-collection effectué."
          : "Question créée sans ajout de lien implicite avec la question parente.";
      }
      feedback.setMessage(msg);
      closeQuestionModal();
    } catch {
      throw new Error("create failed");
    } finally {
      setQuestionModalSaving(false);
    }
  };

  const openEditQuestionModal = (current: QuestionUi) => {
    setSousCollectionsForCreateModal([]);
    setDraftSousCollectionId(null);
    setQuestionModalVariant("edit");
    setQuestionModalOpen(true);
    setQuestionModalLoading(true);
    setQuestionModalError(null);
    setQuestionModalDetail(null);
    void fetchQuestionDetail(current.id)
      .then((d) => {
        setQuestionModalDetail(d);
        setDraftQuestion(d.question);
        setDraftCommentaire(d.commentaire);
        setDraftCategorieId(d.categorie_id);
      })
      .catch(() => setQuestionModalError("fetch"))
      .finally(() => setQuestionModalLoading(false));
  };

  const openCreateLinkedQuestionModal = (parent: QuestionUi) => {
    if (refs.refCategories.length === 0) {
      feedback.setMessage("Catégories indisponibles : impossible de créer une question pour l’instant.");
      return;
    }
    setDraftCreateLinkImplicit(true);
    setSousCollectionsForCreateModal([]);
    setDraftSousCollectionId(null);
    setQuestionModalVariant("create");
    setCreateParentQuestionId(parent.id);
    setQuestionModalOpen(true);
    setQuestionModalLoading(false);
    setQuestionModalError(null);
    setQuestionModalDetail(null);
    setDraftQuestion("");
    setDraftCommentaire("");
    const cat = refs.refCategories.some((cItem) => cItem.id === parent.categorie_id)
      ? parent.categorie_id
      : refs.refCategories[0]!.id;
    setDraftCategorieId(cat);
    const snap = session;
    if (snap?.mode === "collection" && snap.collectionId != null) {
      void fetchSousCollections(snap.collectionId).then((rows) => {
        setSousCollectionsForCreateModal(rows.map((r) => ({ id: r.id, nom: r.nom })));
        const playSous = snap.playSousCollectionId;
        const defId = playSous != null && rows.some((rItem) => rItem.id === playSous) ? playSous : null;
        setDraftSousCollectionId(defId);
      });
    }
  };

  const modalBloc: UseQuizSessionEditModalResult["modal"] = {
    settings: {
      open: questionModalOpen,
      onClose: closeQuestionModal,
      variant: questionModalVariant,
      modalTitle: questionModalVariant === "create" ? "Nouvelle question liée" : undefined,
    },
    actions: {
      onSave: () => void saveEditQuestionModal(),
      onDraftQuestion: setDraftQuestion,
      onDraftCommentaire: setDraftCommentaire,
      onDraftCategorieId: setDraftCategorieId,
      onDraftSousCollectionId: setDraftSousCollectionId,
      onDraftCreateLinkImplicit: setDraftCreateLinkImplicit,
      onReponseUpdated: () => void refreshQuestionModalDetail(),
      onCreateSave: (payload: QuestionCreateSavePayload) => saveCreateQuestionModal(payload),
      onRemoveImplicitRelation: (relationId: number) => removeImplicitRelationFromQuestionModal(relationId),
    },
    status: {
      loading: questionModalLoading,
      saving: questionModalSaving,
      error: questionModalError,
    },
    data: {
      questionDetail: questionModalDetail,
      categorieOptions: refs.refCategories,
      sousCollectionsForCreate: sousCollectionsForCreateModal,
    },
    drafts: {
      question: draftQuestion,
      commentaire: draftCommentaire,
      categorieId: draftCategorieId,
      sousCollectionId: draftSousCollectionId,
      createLinkImplicit:
        questionModalVariant === "create" && createParentQuestionId != null ? draftCreateLinkImplicit : undefined,
    },
  };

  return {
    modal: modalBloc,
    internals: {
      questionDetail: questionModalDetail,
      closeQuestionModal,
      openEditQuestionModal,
      openCreateLinkedQuestionModal,
    },
  };
}

