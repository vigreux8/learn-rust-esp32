import { useCallback, useState } from "preact/hooks";
import {
  fetchCollection,
  fetchQuestionDetail,
  fetchSousCollections,
  patchQuestion,
  postAttachQuestionToSousCollection,
  postCreateQuestion,
} from "../../../../../lib/api";
import type { QuizzQuestionDetail, QuizzQuestionRow } from "../../../../../types/quizz";
import { buildCategorieFieldsForQuestionPatch } from "../../../../ui/organismes/QuestionEditModal/QuestionEditModal.metier";
import type { QuestionCreateSavePayload } from "../../../../ui/organismes/QuestionEditModal/QuestionEditModal.types";
import type { ReflexionLocalPoolDraft } from "../../QuestionReflexionView.types";
import type { UseQuestionReflexionQuestionEditProps } from "./useQuestionReflexionQuestionEdit.types";

/**
 * Modale question dans le contexte « suite logique » : création (même flux que QuestionsView),
 * édition avec chargement API ou brouillon local (ids négatifs), sauvegarde et synchro pool / chaîne.
 */
export function useQuestionReflexionQuestionEdit({
  identity,
  routing,
  data,
  refs,
  chain,
  refCategories,
  refCategoriesHierarchy,
  categoryTypeForId,
  status,
}: UseQuestionReflexionQuestionEditProps) {
  const { userId } = identity;
  const { collectionIdNum } = routing;
  const { setCollection } = data;
  const { localPoolDraftsRef, chainDirtyRef, selectedGroupeIdRef } = refs;
  const { setOrdered, setPool, setLocalPoolDrafts, loadChainFor } = chain;
  const { setOperationError } = status;

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
  const [editDraftCategorieEnfantId, setEditDraftCategorieEnfantId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const closeQuestionModal = useCallback(() => {
    setQuestionModalOpen(false);
    setQuestionModalVariant("edit");
    setEditModalLoading(false);
    setEditModalError(null);
    setEditDetail(null);
    setEditDraftCategorieEnfantId(null);
    setSousCollectionsForCreateModal([]);
    setDraftSousCollectionId(null);
  }, []);

  const openCreateQuestionModal = useCallback(() => {
    const firstCat = refCategories[0]?.id ?? null;
    if (firstCat == null) {
      setOperationError("Catégories indisponibles. Le formulaire de création ne peut pas s’ouvrir pour l’instant.");
      return;
    }
    if (collectionIdNum == null) return;
    setQuestionModalVariant("create");
    setQuestionModalOpen(true);
    setEditModalLoading(false);
    setEditModalError(null);
    setEditDetail(null);
    setEditDraftQuestion("");
    setEditDraftCommentaire("");
    setEditDraftCategorieId(firstCat);
    setEditDraftCategorieEnfantId(null);
    setSousCollectionsForCreateModal([]);
    setDraftSousCollectionId(null);
    void fetchSousCollections(collectionIdNum).then((rows) => {
      setSousCollectionsForCreateModal(rows.map((r) => ({ id: r.id, nom: r.nom })));
    });
  }, [collectionIdNum, refCategories, setOperationError]);

  const openEditModal = useCallback((q: QuizzQuestionRow) => {
    setQuestionModalVariant("edit");
    setSousCollectionsForCreateModal([]);
    setDraftSousCollectionId(null);
    if (q.id < 0) {
      const localDraft = localPoolDraftsRef.current.find((d) => d.id === q.id) ?? null;
      const draftReponses = (localDraft?.payload.reponses ?? []).map((r, idx) => ({
        id: q.id * 100 - idx - 1,
        reponse: r.texte,
        bonne_reponse: r.correcte,
      }));
      setQuestionModalOpen(true);
      setEditModalLoading(false);
      setEditModalError(null);
      setEditDetail({
        ...q,
        reponses: draftReponses,
        implicit_relations: [],
      });
      setEditDraftQuestion(q.question);
      setEditDraftCommentaire(q.commentaire);
      setEditDraftCategorieId(q.categorie_id);
      setEditDraftCategorieEnfantId(q.categorie_e_id ?? null);
      return;
    }
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
        setEditDraftCategorieEnfantId(d.categorie_e_id ?? null);
      })
      .catch(() => setEditModalError("fetch"))
      .finally(() => setEditModalLoading(false));
  }, [localPoolDraftsRef]);

  const refreshEditDetail = useCallback(async () => {
    if (editDetail == null) return;
    if (editDetail.id < 0) return;
    try {
      const d = await fetchQuestionDetail(editDetail.id);
      setEditDetail(d);
      setEditDraftCategorieId(d.categorie_id);
      setEditDraftCategorieEnfantId(d.categorie_e_id ?? null);
    } catch {
      /* ignore */
    }
  }, [editDetail]);

  const saveEditModal = useCallback(async () => {
    if (editDetail == null) return;
    setSaving(true);
    try {
      const payload: {
        question?: string;
        commentaire?: string;
        categorie_id?: number;
        categorie_e_id?: number | null;
      } = {};
      if (editDraftQuestion !== editDetail.question) payload.question = editDraftQuestion;
      if (editDraftCommentaire !== editDetail.commentaire) payload.commentaire = editDraftCommentaire;
      Object.assign(
        payload,
        buildCategorieFieldsForQuestionPatch({
          useHierarchy: refCategoriesHierarchy.length > 0,
          detailCategorieId: editDetail.categorie_id,
          detailCategorieEId: editDetail.categorie_e_id ?? null,
          draftCategorieId: editDraftCategorieId,
          draftCategorieEId: editDraftCategorieEnfantId,
        }),
      );
      if (Object.keys(payload).length === 0) {
        closeQuestionModal();
        return;
      }
      if (editDetail.id < 0) {
        const nextCategorieId = editDraftCategorieId ?? editDetail.categorie_id;
        const nextCategorieEId = editDraftCategorieEnfantId ?? null;
        const nextCategorieType = categoryTypeForId(nextCategorieId, editDetail.categorie_type);
        const parentNodeH = refCategoriesHierarchy.find((h) => h.id === nextCategorieId);
        const nextCategorieEType =
          nextCategorieEId != null
            ? parentNodeH?.enfants.find((e) => e.id === nextCategorieEId)?.type ?? null
            : null;
        const nextReponses = editDetail.reponses.map((r) => ({
          texte: r.reponse,
          correcte: r.bonne_reponse,
        })) as ReflexionLocalPoolDraft["payload"]["reponses"];
        setOrdered((rows) =>
          rows.map((q) =>
            q.id === editDetail.id
              ? {
                  ...q,
                  question: editDraftQuestion,
                  commentaire: editDraftCommentaire,
                  categorie_id: nextCategorieId,
                  categorie_type: nextCategorieType,
                  categorie_e_id: nextCategorieEId,
                  categorie_e_type: nextCategorieEType,
                }
              : q,
          ),
        );
        setPool((rows) =>
          rows.map((q) =>
            q.id === editDetail.id
              ? {
                  ...q,
                  question: editDraftQuestion,
                  commentaire: editDraftCommentaire,
                  categorie_id: nextCategorieId,
                  categorie_type: nextCategorieType,
                  categorie_e_id: nextCategorieEId,
                  categorie_e_type: nextCategorieEType,
                }
              : q,
          ),
        );
        setLocalPoolDrafts((prev) =>
          prev.map((d) =>
            d.id === editDetail.id
              ? {
                  ...d,
                  categorie_id: nextCategorieId,
                  payload: {
                    ...d.payload,
                    question: editDraftQuestion,
                    commentaire: editDraftCommentaire,
                    reponses: nextReponses,
                  },
                  row: {
                    ...d.row,
                    question: editDraftQuestion,
                    commentaire: editDraftCommentaire,
                    categorie_id: nextCategorieId,
                    categorie_type: nextCategorieType,
                    categorie_e_id: nextCategorieEId,
                    categorie_e_type: nextCategorieEType,
                  },
                }
              : d,
          ),
        );
        closeQuestionModal();
        return;
      }
      const updated = await patchQuestion(editDetail.id, payload);
      if (collectionIdNum != null) {
        if (!chainDirtyRef.current) {
          await loadChainFor(collectionIdNum, selectedGroupeIdRef.current);
        } else {
          setOrdered((rows) => rows.map((q) => (q.id === editDetail.id ? { ...q, ...updated } : q)));
          setPool((rows) => rows.map((q) => (q.id === editDetail.id ? { ...q, ...updated } : q)));
        }
        void fetchCollection(collectionIdNum).then(setCollection).catch(() => {});
      }
      closeQuestionModal();
    } catch {
      setOperationError("Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }, [
    categoryTypeForId,
    chainDirtyRef,
    closeQuestionModal,
    collectionIdNum,
    editDetail,
    editDraftCategorieEnfantId,
    editDraftCategorieId,
    editDraftCommentaire,
    editDraftQuestion,
    refCategoriesHierarchy,
    loadChainFor,
    selectedGroupeIdRef,
    setCollection,
    setLocalPoolDrafts,
    setOperationError,
    setOrdered,
    setPool,
  ]);

  const saveLocalDraftReponse = useCallback(
    (reponseId: number, reponseTexte: string) => {
      if (editDetail == null || editDetail.id >= 0) return;
      const nextText = reponseTexte.trim();
      setEditDetail((cur) => {
        if (cur == null || cur.id !== editDetail.id) return cur;
        return {
          ...cur,
          reponses: cur.reponses.map((r) => (r.id === reponseId ? { ...r, reponse: nextText } : r)),
        };
      });
      setLocalPoolDrafts((prev) =>
        prev.map((d) => {
          if (d.id !== editDetail.id) return d;
          const nextPayloadReponses = d.payload.reponses.map((r, idx) => {
            const expectedId = editDetail.id * 100 - idx - 1;
            return expectedId === reponseId ? { ...r, texte: nextText } : r;
          }) as ReflexionLocalPoolDraft["payload"]["reponses"];
          return {
            ...d,
            payload: {
              ...d.payload,
              reponses: nextPayloadReponses,
            },
          };
        }),
      );
    },
    [editDetail, setLocalPoolDrafts],
  );

  const saveCreateModal = useCallback(
    async (payload: QuestionCreateSavePayload) => {
      if (collectionIdNum == null) return;
      setSaving(true);
      try {
        const created = await postCreateQuestion({
          user_id: userId,
          categorie_id: payload.categorie_id,
          question: payload.question,
          commentaire: payload.commentaire,
          reponses: payload.reponses,
          collection_id: collectionIdNum,
        });
        if (payload.sous_collection_id != null) {
          await postAttachQuestionToSousCollection(payload.sous_collection_id, {
            user_id: userId,
            question_id: created.id,
          });
        }
        if (!chainDirtyRef.current) {
          await loadChainFor(collectionIdNum, selectedGroupeIdRef.current);
        } else {
          setPool((rows) => {
            if (rows.some((r) => r.id === created.id)) return rows;
            return [created, ...rows];
          });
        }
        void fetchCollection(collectionIdNum).then(setCollection).catch(() => {});
        closeQuestionModal();
      } catch {
        setOperationError("Création de la question impossible.");
      } finally {
        setSaving(false);
      }
    },
    [
      chainDirtyRef,
      closeQuestionModal,
      collectionIdNum,
      loadChainFor,
      selectedGroupeIdRef,
      setCollection,
      setOperationError,
      setPool,
      userId,
    ],
  );

  return {
    openEditModal,
    openCreateQuestionModal,
    createQuestionDisabled: refCategories.length === 0,
    closeQuestionModal,
    editDetail,
    editModal: {
      settings: {
        open: questionModalOpen,
        onClose: closeQuestionModal,
        variant: questionModalVariant,
        modalTitle: questionModalVariant === "create" ? "Nouvelle question" : undefined,
      },
      actions: {
        onSave: () => void saveEditModal(),
        onDraftQuestion: setEditDraftQuestion,
        onDraftCommentaire: setEditDraftCommentaire,
        onDraftCategorieId: setEditDraftCategorieId,
        onDraftCategorieEnfantId: setEditDraftCategorieEnfantId,
        onDraftSousCollectionId: setDraftSousCollectionId,
        onReponseUpdated: () => void refreshEditDetail(),
        onLocalDraftReponseSave: saveLocalDraftReponse,
        onCreateSave: async (payload: QuestionCreateSavePayload) => saveCreateModal(payload),
      },
      data: {
        questionDetail: editDetail,
        categorieOptions: refCategories,
        categorieHierarchy: refCategoriesHierarchy,
        sousCollectionsForCreate:
          questionModalVariant === "create" ? sousCollectionsForCreateModal : undefined,
      },
      drafts: {
        question: editDraftQuestion,
        commentaire: editDraftCommentaire,
        categorieId: editDraftCategorieId,
        categorieEnfantId: editDraftCategorieEnfantId,
        sousCollectionId: draftSousCollectionId ?? null,
      },
      status: {
        loading: editModalLoading,
        saving,
        error: editModalError,
      },
    },
  };
}
