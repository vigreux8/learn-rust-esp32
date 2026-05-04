import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { route } from "preact-router";
import {
  deleteImplicitQuestionRelation,
  deleteQuestion,
  fetchCollections,
  fetchQuestionDetail,
  fetchQuestions,
  fetchRefCategories,
  fetchSousCollections,
  patchQuestion,
  postAttachQuestionToSousCollection,
  postCreateQuestion,
} from "../../../lib/api";
import { useUserSession } from "../../../lib/userSession";
import type { PlayQtype } from "../../../lib/playOrder";
import type { CollectionUi, QuizzQuestionDetail, QuizzQuestionRow, RefCategorieRow } from "../../../types/quizz";
import {
  collectionFilterToQuery,
  filterFromRouteParam,
  filterQuestionsForTable,
} from "./QuestionsView.metier";
import type { QuestionsViewProps } from "./QuestionsView.types";
import type { QuestionCreateSavePayload } from "../QuestionEditModal/QuestionEditModal";

export function useQuestionsView({ collectionId }: QuestionsViewProps) {
  const { userId } = useUserSession();
  const [collections, setCollections] = useState<CollectionUi[]>([]);
  const [collectionFilter, setCollectionFilter] = useState<string>(() => filterFromRouteParam(collectionId));
  const [importTargetTagCollectionId, setImportTargetTagCollectionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizzQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refCategories, setRefCategories] = useState<RefCategorieRow[]>([]);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionModalVariant, setQuestionModalVariant] = useState<"edit" | "create">("edit");
  const [sousCollectionsForCreateModal, setSousCollectionsForCreateModal] = useState<{ id: number; nom: string }[]>(
    [],
  );
  const [draftSousCollectionId, setDraftSousCollectionId] = useState<number | null>(null);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [editDetail, setEditDetail] = useState<QuizzQuestionDetail | null>(null);
  const [editDraftQuestion, setEditDraftQuestion] = useState("");
  const [editDraftCommentaire, setEditDraftCommentaire] = useState("");
  const [editDraftCategorieId, setEditDraftCategorieId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [listFilterQtype, setListFilterQtype] = useState<PlayQtype>("melanger");

  const targetCollectionNumeric =
    collectionFilter !== "" && collectionFilter !== "none" && /^\d+$/.test(collectionFilter)
      ? Number(collectionFilter)
      : null;

  const questionsForTable = useMemo(
    () => filterQuestionsForTable(questions, listFilterQtype),
    [questions, listFilterQtype],
  );

  useEffect(() => {
    setCollectionFilter(filterFromRouteParam(collectionId));
  }, [collectionId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = new URLSearchParams(window.location.search).get("tagCollection");
    if (m && /^\d+$/.test(m)) setImportTargetTagCollectionId(Number(m));
    else setImportTargetTagCollectionId(null);
  }, [collectionId]);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const fp = collectionFilterToQuery(collectionFilter);
    try {
      const qs = await fetchQuestions(fp);
      setQuestions(qs);
    } catch {
      setLoadError("fetch");
    } finally {
      setLoading(false);
    }
  }, [collectionFilter]);

  useEffect(() => {
    fetchCollections().then(setCollections).catch(() => {});
    fetchRefCategories().then(setRefCategories).catch(() => {});
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const onCollectionFilterChange = useCallback(
    (value: string) => {
      setCollectionFilter(value);
      if (value === "" || value === "none") return void route("/questions");
      if (/^\d+$/.test(value)) {
        const tagQ =
          importTargetTagCollectionId != null
            ? `?tagCollection=${importTargetTagCollectionId}`
            : "";
        route(`/questions/${value}${tagQ}`);
      }
    },
    [importTargetTagCollectionId],
  );

  const closeQuestionModal = useCallback(() => {
    setQuestionModalOpen(false);
    setQuestionModalVariant("edit");
    setEditModalLoading(false);
    setEditModalError(null);
    setEditDetail(null);
    setSousCollectionsForCreateModal([]);
    setDraftSousCollectionId(null);
  }, []);

  const openEditModal = useCallback((q: QuizzQuestionRow) => {
    setSousCollectionsForCreateModal([]);
    setDraftSousCollectionId(null);
    setQuestionModalVariant("edit");
    setQuestionModalOpen(true);
    setEditModalLoading(true);
    setEditModalError(null);
    setEditDetail(null);
    void fetchQuestionDetail(q.id)
      .then((d) => {
        setEditDetail(d);
        setEditDraftQuestion(d.question);
        setEditDraftCommentaire(d.commentaire);
        setEditDraftCategorieId(d.categorie_id);
      })
      .catch(() => setEditModalError("fetch"))
      .finally(() => setEditModalLoading(false));
  }, []);

  const openCreateQuestionModal = useCallback(() => {
    const firstCat = refCategories[0]?.id ?? null;
    if (firstCat == null) {
      setLoadError("categories");
      return;
    }
    setQuestionModalVariant("create");
    setQuestionModalOpen(true);
    setEditModalLoading(false);
    setEditModalError(null);
    setEditDetail(null);
    setEditDraftQuestion("");
    setEditDraftCommentaire("");
    setEditDraftCategorieId(firstCat);
    setSousCollectionsForCreateModal([]);
    setDraftSousCollectionId(null);
    if (targetCollectionNumeric != null) {
      void fetchSousCollections(targetCollectionNumeric).then((rows) => {
        setSousCollectionsForCreateModal(rows.map((r) => ({ id: r.id, nom: r.nom })));
      });
    }
  }, [refCategories, targetCollectionNumeric]);

  const refreshEditDetail = useCallback(async () => {
    if (editDetail == null) return;
    try {
      const d = await fetchQuestionDetail(editDetail.id);
      setEditDetail(d);
    } catch {
      /* ignore */
    }
  }, [editDetail]);

  const removeImplicitRelationFromEditModal = useCallback(
    async (relationId: number) => {
      try {
        await deleteImplicitQuestionRelation(relationId);
        await refreshEditDetail();
      } catch {
        setLoadError("delete_relation");
      }
    },
    [refreshEditDetail],
  );

  const saveEditModal = useCallback(async () => {
    if (editDetail == null) return;
    setSaving(true);
    try {
      const payload: { question?: string; commentaire?: string; categorie_id?: number } = {};
      if (editDraftQuestion !== editDetail.question) payload.question = editDraftQuestion;
      if (editDraftCommentaire !== editDetail.commentaire) payload.commentaire = editDraftCommentaire;
      if (editDraftCategorieId != null && editDraftCategorieId !== editDetail.categorie_id) payload.categorie_id = editDraftCategorieId;
      if (Object.keys(payload).length === 0) {
        closeQuestionModal();
        return;
      }
      const updated = await patchQuestion(editDetail.id, payload);
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      closeQuestionModal();
    } catch {
      setLoadError("save");
    } finally {
      setSaving(false);
    }
  }, [closeQuestionModal, editDetail, editDraftCategorieId, editDraftCommentaire, editDraftQuestion]);

  const saveCreateModal = useCallback(
    async (payload: QuestionCreateSavePayload) => {
      setSaving(true);
      try {
        const created = await postCreateQuestion({
          user_id: userId,
          categorie_id: payload.categorie_id,
          question: payload.question,
          commentaire: payload.commentaire,
          reponses: payload.reponses,
          collection_id: targetCollectionNumeric ?? undefined,
        });
        if (payload.sous_collection_id != null) {
          await postAttachQuestionToSousCollection(payload.sous_collection_id, {
            user_id: userId,
            question_id: created.id,
          });
        }
        await reload();
        closeQuestionModal();
      } catch {
        setLoadError("create");
      } finally {
        setSaving(false);
      }
    },
    [closeQuestionModal, reload, targetCollectionNumeric, userId],
  );

  const remove = useCallback(
    async (id: number) => {
      setSaving(true);
      try {
        await deleteQuestion(id);
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        if (editDetail?.id === id) closeQuestionModal();
      } catch {
        setLoadError("delete");
      } finally {
        setSaving(false);
      }
    },
    [closeQuestionModal, editDetail?.id],
  );

  const onImportSuccess = useCallback(() => {
    void reload();
    fetchCollections().then(setCollections).catch(() => {});
  }, [reload]);

  const onListFilterQtypeChange = useCallback((value: PlayQtype) => {
    setListFilterQtype(value);
  }, []);

  const questionsActionBoutons = {
    data: {
      targetCollectionNumeric,
      collections,
      importTargetTagCollectionId,
      questions,
    },
    actions: {
      onImportSuccess,
    },
  };

  const operationErrorBannerMessage =
    loadError === "save"
      ? "Enregistrement impossible."
      : loadError === "delete"
        ? "Suppression impossible."
        : loadError === "create"
          ? "Création de la question impossible."
          : loadError === "categories"
            ? "Catégories indisponibles. Le formulaire de création ne peut pas s’ouvrir pour l’instant."
            : loadError === "delete_relation"
              ? "Suppression du lien implicite impossible."
              : loadError === "fetch"
                ? "Impossible de charger la liste des questions."
                : null;

  const operationError = {
    visible: Boolean(loadError) && loadError !== "fetch",
    message: operationErrorBannerMessage ?? "Une opération a échoué.",
    onDismiss: () => setLoadError(null),
  };

  const contextBar = {
    targetCollectionNumeric,
    collections,
    importTargetTagCollectionId,
    setImportTargetTagCollectionId,
  };

  const filtres = {
    collectionFilter,
    collections,
    onCollectionFilterChange,
    listFilterQtype,
    onListFilterQtypeChange,
    onOpenCreateQuestion: openCreateQuestionModal,
    createQuestionDisabled: refCategories.length === 0,
  };

  const liste = {
    loading,
    fetchError: loadError === "fetch",
    onReload: reload,
    questionsForTable,
    saving,
    onEdit: openEditModal,
    onRemove: remove,
  };

  const editModal = {
    settings: {
      open: questionModalOpen,
      onClose: closeQuestionModal,
      variant: questionModalVariant,
      modalTitle: questionModalVariant === "create" ? "Nouvelle question" : undefined,
    } as const,
    actions: {
      onSave: () => void saveEditModal(),
      onDraftQuestion: setEditDraftQuestion,
      onDraftCommentaire: setEditDraftCommentaire,
      onDraftCategorieId: setEditDraftCategorieId,
      onDraftSousCollectionId: setDraftSousCollectionId,
      onReponseUpdated: () => void refreshEditDetail(),
      onCreateSave: async (payload: QuestionCreateSavePayload) => saveCreateModal(payload),
      onRemoveImplicitRelation: (relationId: number) =>
        void removeImplicitRelationFromEditModal(relationId),
    },
    status: { loading: editModalLoading, saving, error: editModalError } as const,
    data: {
      questionDetail: editDetail,
      categorieOptions: refCategories,
      sousCollectionsForCreate:
        questionModalVariant === "create" ? sousCollectionsForCreateModal : undefined,
    } as const,
    drafts: {
      question: editDraftQuestion,
      commentaire: editDraftCommentaire,
      categorieId: editDraftCategorieId,
      sousCollectionId: draftSousCollectionId ?? null,
    },
  };

  return {
    questionsActionBoutons,
    operationError,
    contextBar,
    filtres,
    liste,
    editModal,
  };
}
