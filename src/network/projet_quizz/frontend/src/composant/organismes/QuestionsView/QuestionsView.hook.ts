import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { route } from "preact-router";
import {
  deleteQuestion,
  fetchCollections,
  fetchModules,
  fetchQuestionDetail,
  fetchQuestions,
  fetchRefCategories,
  patchQuestion,
} from "../../../lib/api";
import type { PlayQtype } from "../../../lib/playOrder";
import type { CollectionUi, QuizzModuleRow, QuizzQuestionDetail, QuizzQuestionRow, RefCategorieRow } from "../../../types/quizz";
import {
  collectionFilterToQuery,
  filterFromRouteParam,
  filterQuestionsForTable,
} from "./QuestionsView.metier";
import type { QuestionsViewProps } from "./QuestionsView.types";

export function useQuestionsView({ collectionId }: QuestionsViewProps) {
  const [collections, setCollections] = useState<CollectionUi[]>([]);
  const [allModules, setAllModules] = useState<QuizzModuleRow[]>([]);
  const [collectionFilter, setCollectionFilter] = useState<string>(() => filterFromRouteParam(collectionId));
  const [importTargetModuleId, setImportTargetModuleId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizzQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refCategories, setRefCategories] = useState<RefCategorieRow[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
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
    const m = new URLSearchParams(window.location.search).get("module");
    if (m && /^\d+$/.test(m)) setImportTargetModuleId(Number(m));
    else setImportTargetModuleId(null);
  }, [collectionId]);

  const reload = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    const fp = collectionFilterToQuery(collectionFilter);
    fetchQuestions(fp).then(setQuestions).catch(() => setLoadError("fetch")).finally(() => setLoading(false));
  }, [collectionFilter]);

  useEffect(() => {
    fetchCollections().then(setCollections).catch(() => {});
    fetchModules().then(setAllModules).catch(() => {});
    fetchRefCategories().then(setRefCategories).catch(() => {});
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const onCollectionFilterChange = useCallback(
    (value: string) => {
      setCollectionFilter(value);
      if (value === "" || value === "none") return void route("/questions");
      if (/^\d+$/.test(value)) {
        const modQ = importTargetModuleId != null ? `?module=${importTargetModuleId}` : "";
        route(`/questions/${value}${modQ}`);
      }
    },
    [importTargetModuleId],
  );

  const openEditModal = useCallback((q: QuizzQuestionRow) => {
    setEditModalOpen(true);
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

  const closeEditModal = useCallback(() => {
    setEditModalOpen(false);
    setEditModalLoading(false);
    setEditModalError(null);
    setEditDetail(null);
  }, []);

  const refreshEditDetail = useCallback(async () => {
    if (editDetail == null) return;
    try {
      const d = await fetchQuestionDetail(editDetail.id);
      setEditDetail(d);
    } catch {
      /* ignore */
    }
  }, [editDetail]);

  const saveEditModal = useCallback(async () => {
    if (editDetail == null) return;
    setSaving(true);
    try {
      const payload: { question?: string; commentaire?: string; categorie_id?: number } = {};
      if (editDraftQuestion !== editDetail.question) payload.question = editDraftQuestion;
      if (editDraftCommentaire !== editDetail.commentaire) payload.commentaire = editDraftCommentaire;
      if (editDraftCategorieId != null && editDraftCategorieId !== editDetail.categorie_id) payload.categorie_id = editDraftCategorieId;
      if (Object.keys(payload).length === 0) {
        closeEditModal();
        return;
      }
      const updated = await patchQuestion(editDetail.id, payload);
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      closeEditModal();
    } catch {
      setLoadError("save");
    } finally {
      setSaving(false);
    }
  }, [closeEditModal, editDetail, editDraftCategorieId, editDraftCommentaire, editDraftQuestion]);

  const remove = useCallback(
    async (id: number) => {
      setSaving(true);
      try {
        await deleteQuestion(id);
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        if (editDetail?.id === id) closeEditModal();
      } catch {
        setLoadError("delete");
      } finally {
        setSaving(false);
      }
    },
    [closeEditModal, editDetail?.id],
  );

  const onImportSuccess = useCallback(() => {
    reload();
    fetchCollections().then(setCollections).catch(() => {});
  }, [reload]);

  const onListFilterQtypeChange = useCallback((value: PlayQtype) => {
    setListFilterQtype(value);
  }, []);

  const questionsActionBoutons = {
    data: {
      targetCollectionNumeric,
      collections,
      allModules,
      importTargetModuleId,
      questions,
    },
    actions: {
      onImportSuccess,
    },
  };

  const operationError = {
    visible: Boolean(loadError),
    onDismiss: () => setLoadError(null),
  };

  const contextBar = {
    targetCollectionNumeric,
    collections,
    allModules,
    importTargetModuleId,
    setImportTargetModuleId,
  };

  const filtres = {
    collectionFilter,
    collections,
    onCollectionFilterChange,
    listFilterQtype,
    onListFilterQtypeChange,
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
    settings: { open: editModalOpen, onClose: closeEditModal } as const,
    actions: {
      onSave: () => void saveEditModal(),
      onDraftQuestion: setEditDraftQuestion,
      onDraftCommentaire: setEditDraftCommentaire,
      onDraftCategorieId: setEditDraftCategorieId,
      onReponseUpdated: () => void refreshEditDetail(),
    },
    status: { loading: editModalLoading, saving, error: editModalError } as const,
    data: { questionDetail: editDetail, categorieOptions: refCategories } as const,
    drafts: {
      question: editDraftQuestion,
      commentaire: editDraftCommentaire,
      categorieId: editDraftCategorieId,
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
