import { useCallback, useEffect, useState } from "preact/hooks";
import {
  deleteImplicitQuestionRelation,
  deleteQuestion,
  fetchCollections,
  fetchQuestionDetail,
  fetchRefCategories,
  fetchRefCategoriesHierarchy,
  patchQuestion,
} from "../../../../../lib/api";
import type {
  CollectionUi,
  QuizzQuestionDetail,
  RefCategorieHierarchyRow,
  RefCategorieRow,
} from "../../../../../types/quizz";
import type { AppNode } from "../../../../node/config/flow.types";
import { hydrateCollectionNodesTreeDepthFromCollections } from "../../NodeView.metier";
import { buildCategorieFieldsForQuestionPatch } from "../../../../ui/organismes/QuestionEditModal/QuestionEditModal.metier";
import type { UseNodeViewQuestionSidebarEditParams } from "./useNodeViewQuestionSidebarEdit.types";

/**
 * Modale d’édition + suppression depuis la liste « Questions par collection » (`/node`).
 */
export function useNodeViewQuestionSidebarEdit(params: UseNodeViewQuestionSidebarEditParams) {
  const { userId, setApiCollections, setNodes } = params;

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [editDetail, setEditDetail] = useState<QuizzQuestionDetail | null>(null);
  const [editDraftQuestion, setEditDraftQuestion] = useState("");
  const [editDraftCommentaire, setEditDraftCommentaire] = useState("");
  const [editDraftCategorieId, setEditDraftCategorieId] = useState<number | null>(null);
  const [editDraftCategorieEnfantId, setEditDraftCategorieEnfantId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [refCategories, setRefCategories] = useState<RefCategorieRow[]>([]);
  const [refCategoriesHierarchy, setRefCategoriesHierarchy] = useState<RefCategorieHierarchyRow[]>([]);

  useEffect(() => {
    void fetchRefCategories()
      .then(setRefCategories)
      .catch(() => {});
    void fetchRefCategoriesHierarchy()
      .then(setRefCategoriesHierarchy)
      .catch(() => {});
  }, []);

  const applyListToGraph = useCallback(
    (list: CollectionUi[], nodeMapper?: (nodes: AppNode[]) => AppNode[]) => {
      setApiCollections(list);
      setNodes((nds) => {
        const base = nodeMapper != null ? nodeMapper(nds) : nds;
        return hydrateCollectionNodesTreeDepthFromCollections(base, list, userId);
      });
    },
    [setApiCollections, setNodes, userId],
  );

  const closeQuestionModal = useCallback(() => {
    setQuestionModalOpen(false);
    setEditModalLoading(false);
    setEditModalError(null);
    setEditDetail(null);
    setEditDraftCategorieEnfantId(null);
  }, []);

  const openEditModalByQuestionId = useCallback((questionId: number) => {
    setQuestionModalOpen(true);
    setEditModalLoading(true);
    setEditModalError(null);
    setEditDetail(null);
    void fetchQuestionDetail(questionId)
      .then((d) => {
        setEditDetail(d);
        setEditDraftQuestion(d.question);
        setEditDraftCommentaire(d.commentaire);
        setEditDraftCategorieId(d.categorie_id);
        setEditDraftCategorieEnfantId(d.categorie_e_id ?? null);
      })
      .catch(() => setEditModalError("fetch"))
      .finally(() => setEditModalLoading(false));
  }, []);

  const refreshEditDetail = useCallback(async () => {
    if (editDetail == null) return;
    try {
      const d = await fetchQuestionDetail(editDetail.id);
      setEditDetail(d);
      setEditDraftCategorieId(d.categorie_id);
      setEditDraftCategorieEnfantId(d.categorie_e_id ?? null);
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
        setEditModalError("delete_relation");
      }
    },
    [refreshEditDetail],
  );

  const saveEditModal = useCallback(async () => {
    if (editDetail == null) return;
    setSaving(true);
    try {
      const body: {
        question?: string;
        commentaire?: string;
        categorie_id?: number;
        categorie_e_id?: number | null;
      } = {};
      if (editDraftQuestion !== editDetail.question) body.question = editDraftQuestion;
      if (editDraftCommentaire !== editDetail.commentaire) body.commentaire = editDraftCommentaire;
      Object.assign(
        body,
        buildCategorieFieldsForQuestionPatch({
          useHierarchy: refCategoriesHierarchy.length > 0,
          detailCategorieId: editDetail.categorie_id,
          detailCategorieEId: editDetail.categorie_e_id ?? null,
          draftCategorieId: editDraftCategorieId,
          draftCategorieEId: editDraftCategorieEnfantId,
        }),
      );
      if (Object.keys(body).length === 0) {
        closeQuestionModal();
        return;
      }
      const updated = await patchQuestion(editDetail.id, body);
      const list = await fetchCollections();
      applyListToGraph(list, (nds) =>
        nds.map((n) => {
          if (n.type !== "questionNode" || n.data.questionId !== editDetail.id) return n;
          return { ...n, data: { ...n.data, title: updated.question } };
        }),
      );
      closeQuestionModal();
    } catch {
      setEditModalError("save");
    } finally {
      setSaving(false);
    }
  }, [
    applyListToGraph,
    closeQuestionModal,
    editDetail,
    editDraftCategorieEnfantId,
    editDraftCategorieId,
    editDraftCommentaire,
    editDraftQuestion,
    refCategoriesHierarchy.length,
  ]);

  const deleteQuestionFromSidebar = useCallback(
    async (questionId: number) => {
      if (!window.confirm("Supprimer définitivement cette question ?")) return;
      setSaving(true);
      try {
        await deleteQuestion(questionId);
        const list = await fetchCollections();
        applyListToGraph(list, (nds) =>
          nds.filter((n) => !(n.type === "questionNode" && n.data.questionId === questionId)),
        );
        if (editDetail?.id === questionId) closeQuestionModal();
      } catch {
        window.alert("Suppression impossible.");
      } finally {
        setSaving(false);
      }
    },
    [applyListToGraph, closeQuestionModal, editDetail?.id],
  );

  const questionEditModal = {
    settings: {
      open: questionModalOpen,
      onClose: closeQuestionModal,
      variant: "edit" as const,
    },
    actions: {
      onSave: () => void saveEditModal(),
      onDraftQuestion: setEditDraftQuestion,
      onDraftCommentaire: setEditDraftCommentaire,
      onDraftCategorieId: setEditDraftCategorieId,
      onDraftCategorieEnfantId: setEditDraftCategorieEnfantId,
      onReponseUpdated: () => void refreshEditDetail(),
      onRemoveImplicitRelation: (relationId: number) => void removeImplicitRelationFromEditModal(relationId),
    },
    status: { loading: editModalLoading, saving, error: editModalError } as const,
    data: {
      questionDetail: editDetail,
      categorieOptions: refCategories,
      categorieHierarchy: refCategoriesHierarchy,
    } as const,
    drafts: {
      question: editDraftQuestion,
      commentaire: editDraftCommentaire,
      categorieId: editDraftCategorieId,
      categorieEnfantId: editDraftCategorieEnfantId,
    },
  };

  return {
    flowSidebarQuestionActions: {
      onEditQuestionInSidebar: openEditModalByQuestionId,
      onDeleteQuestionInSidebar: deleteQuestionFromSidebar,
    },
    questionEditModal,
  };
}
