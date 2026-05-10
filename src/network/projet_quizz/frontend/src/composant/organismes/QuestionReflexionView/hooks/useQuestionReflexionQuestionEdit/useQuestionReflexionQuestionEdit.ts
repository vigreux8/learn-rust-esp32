import { useCallback, useState } from "preact/hooks";
import { fetchCollection, fetchQuestionDetail, patchQuestion } from "../../../../../lib/api";
import type { QuizzQuestionDetail, QuizzQuestionRow } from "../../../../../types/quizz";
import type { ReflexionLocalPoolDraft } from "../../QuestionReflexionView.types";
import type { UseQuestionReflexionQuestionEditProps } from "./useQuestionReflexionQuestionEdit.types";

export function useQuestionReflexionQuestionEdit({
  routing,
  data,
  refs,
  chain,
  refCategories,
  categoryTypeForId,
  status,
}: UseQuestionReflexionQuestionEditProps) {
  const { collectionIdNum } = routing;
  const { setCollection } = data;
  const { localPoolDraftsRef, chainDirtyRef, selectedGroupeIdRef } = refs;
  const { setOrdered, setPool, setLocalPoolDrafts, loadChainFor } = chain;
  const { setOperationError } = status;

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [editDetail, setEditDetail] = useState<QuizzQuestionDetail | null>(null);
  const [editDraftQuestion, setEditDraftQuestion] = useState("");
  const [editDraftCommentaire, setEditDraftCommentaire] = useState("");
  const [editDraftCategorieId, setEditDraftCategorieId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const closeQuestionModal = useCallback(() => {
    setQuestionModalOpen(false);
    setEditModalLoading(false);
    setEditModalError(null);
    setEditDetail(null);
  }, []);

  const openEditModal = useCallback((q: QuizzQuestionRow) => {
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
      if (editDraftCategorieId != null && editDraftCategorieId !== editDetail.categorie_id) {
        payload.categorie_id = editDraftCategorieId;
      }
      if (Object.keys(payload).length === 0) {
        closeQuestionModal();
        return;
      }
      if (editDetail.id < 0) {
        const nextCategorieId = editDraftCategorieId ?? editDetail.categorie_id;
        const nextCategorieType = categoryTypeForId(nextCategorieId, editDetail.categorie_type);
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
                  },
                }
              : d,
          ),
        );
        closeQuestionModal();
        return;
      }
      await patchQuestion(editDetail.id, payload);
      if (collectionIdNum != null) {
        if (!chainDirtyRef.current) {
          await loadChainFor(collectionIdNum, selectedGroupeIdRef.current);
        } else {
          setOrdered((rows) =>
            rows.map((q) =>
              q.id === editDetail.id
                ? {
                    ...q,
                    question: editDraftQuestion,
                    commentaire: editDraftCommentaire,
                    categorie_id: editDraftCategorieId ?? q.categorie_id,
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
                    categorie_id: editDraftCategorieId ?? q.categorie_id,
                  }
                : q,
            ),
          );
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
    editDraftCategorieId,
    editDraftCommentaire,
    editDraftQuestion,
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

  return {
    openEditModal,
    closeQuestionModal,
    editDetail,
    editModal: {
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
        onReponseUpdated: () => void refreshEditDetail(),
        onLocalDraftReponseSave: saveLocalDraftReponse,
      },
      data: {
        questionDetail: editDetail,
        categorieOptions: refCategories,
      },
      drafts: {
        question: editDraftQuestion,
        commentaire: editDraftCommentaire,
        categorieId: editDraftCategorieId,
      },
      status: {
        loading: editModalLoading,
        saving,
        error: editModalError,
      },
    },
  };
}
