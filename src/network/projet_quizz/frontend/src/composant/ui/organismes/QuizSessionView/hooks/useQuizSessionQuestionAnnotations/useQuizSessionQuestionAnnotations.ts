import { useEffect, useLayoutEffect, useState } from "preact/hooks";
import { patchQuestion } from "../../../../../../lib/api";
import {
  isQuestionCategorieKey,
  type QuestionCategorieKey,
} from "../../../../../../lib/questionCategories";
import { mergeQuizSessionQuestionFromRow } from "../../QuizSessionView.metier";
import type {
  QuizAnnotationSyncPack,
  UseQuizSessionQuestionAnnotationsOptions,
  UseQuizSessionQuestionAnnotationsResult,
} from "./useQuizSessionQuestionAnnotations.types";

/**
 * Annotations rapides sur la question courante (véracité, catégories pid/eid) : brouillon local, patch API,
 * verrou interaction et enregistrement pour resync avec le hook d’édition.
 */
export function useQuizSessionQuestionAnnotations(
  options: UseQuizSessionQuestionAnnotationsOptions,
): UseQuizSessionQuestionAnnotationsResult {
  const { data, refsTables, locks, feedback, syncRegistration } = options;
  const { session } = data;

  const [draftVerifier, setDraftVerifier] = useState(false);
  const [draftCategoriePid, setDraftCategoriePid] = useState<number | null>(null);
  const [draftCategorieEid, setDraftCategorieEid] = useState<number | null>(null);
  const [draftImportanceId, setDraftImportanceId] = useState<number | null>(null);
  const [draftDifficulteId, setDraftDifficulteId] = useState<number | null>(null);

  useEffect(() => {
    if (session == null) return;
    const cur = session.questions[data.index];
    if (!cur) return;
    setDraftVerifier(cur.verifier);
    setDraftCategoriePid(cur.categorie_id);
    setDraftCategorieEid(cur.categorie_e_id ?? null);
    setDraftImportanceId(cur.importance_id ?? null);
    setDraftDifficulteId(cur.difficulter_id ?? null);
  }, [session, data.index]);

  const resolveDraftParentKey = (): QuestionCategorieKey | null => {
    if (draftCategoriePid == null) return null;
    const h = refsTables.refCategoriesHierarchy.find((row) => row.id === draftCategoriePid);
    if (h?.type && isQuestionCategorieKey(h.type)) return h.type;
    const f = refsTables.refCategories.find((row) => row.id === draftCategoriePid);
    if (f?.type && isQuestionCategorieKey(f.type)) return f.type;
    return null;
  };

  const handleParentCategory = (parentKey: QuestionCategorieKey) => {
    if (session == null || locks.interactionLockedRef.current) return;

    const fromHierarchy = refsTables.refCategoriesHierarchy.find((row) => row.type === parentKey);
    const fromFlat = refsTables.refCategories.find((row) => row.type === parentKey);
    const parentId = fromHierarchy?.id ?? fromFlat?.id;
    if (parentId == null) return;

    if (resolveDraftParentKey() === parentKey) {
      setDraftCategoriePid(null);
      setDraftCategorieEid(null);
      return;
    }
    setDraftCategoriePid(parentId);
    setDraftCategorieEid(null);
  };

  const handleChildCategory = (enfantId: number) => {
    if (session == null || locks.interactionLockedRef.current) return;
    if (draftCategoriePid == null) return;

    if (draftCategorieEid === enfantId) {
      setDraftCategorieEid(null);
    } else {
      setDraftCategorieEid(enfantId);
    }
  };

  const handleDraftDifficulte = (id: number) => {
    if (locks.interactionLockedRef.current) return;
    setDraftDifficulteId((prev) => (prev === id ? null : id));
  };

  const handleDraftImportance = (id: number) => {
    if (locks.interactionLockedRef.current) return;
    setDraftImportanceId((prev) => (prev === id ? null : id));
  };

  const syncVerifierIfNeeded = async (): Promise<boolean> => {
    const snap = data.session;
    if (snap == null) return false;
    const curQ = snap.questions[data.index];
    if (curQ == null) return false;
    if (draftVerifier === curQ.verifier) return true;
    try {
      const updated = await patchQuestion(curQ.id, { verifier: draftVerifier });
      data.setSession((prev) => {
        if (!prev) return prev;
        const qs = [...prev.questions];
        const i = qs.findIndex((x) => x.id === curQ.id);
        if (i >= 0 && qs[i]) qs[i] = mergeQuizSessionQuestionFromRow(qs[i]!, updated);
        return { ...prev, questions: qs };
      });
      return true;
    } catch {
      feedback.setMessage("Enregistrement du fake-checker impossible. Réessaie.");
      return false;
    }
  };

  const syncDraftCategoriesIfNeeded = async (): Promise<boolean> => {
    const snap = data.session;
    if (snap == null) return false;
    const curQ = snap.questions[data.index];
    if (curQ == null) return false;

    if (draftCategoriePid === null) {
      feedback.setMessage(
        "Choisis une catégorie parente avant « Suivant » ou la fin de session (aucune n’est pas enregistrable en base).",
      );
      return false;
    }

    const sameParent = draftCategoriePid === curQ.categorie_id;
    const sameChild = (draftCategorieEid ?? null) === (curQ.categorie_e_id ?? null);
    if (sameParent && sameChild) return true;

    try {
      const patchBody: { categorie_id?: number; categorie_e_id?: number | null } = {};
      if (!sameParent) {
        patchBody.categorie_id = draftCategoriePid;
        patchBody.categorie_e_id = draftCategorieEid ?? null;
      } else {
        patchBody.categorie_e_id = draftCategorieEid ?? null;
      }
      const updated = await patchQuestion(curQ.id, patchBody);
      data.setSession((prev) => {
        if (!prev) return prev;
        const qs = [...prev.questions];
        const qi = qs.findIndex((x) => x.id === curQ.id);
        if (qi < 0 || !qs[qi]) return prev;
        qs[qi] = mergeQuizSessionQuestionFromRow(qs[qi]!, updated);
        return { ...prev, questions: qs };
      });
      return true;
    } catch {
      feedback.setMessage("Enregistrement des catégories impossible. Réessaie.");
      return false;
    }
  };

  const syncDraftScalesIfNeeded = async (): Promise<boolean> => {
    const snap = data.session;
    if (snap == null) return false;
    const curQ = snap.questions[data.index];
    if (curQ == null) return false;

    const sameImp = (draftImportanceId ?? null) === (curQ.importance_id ?? null);
    const sameDif = (draftDifficulteId ?? null) === (curQ.difficulter_id ?? null);
    if (sameImp && sameDif) return true;

    try {
      const patchBody: { importance_id?: number | null; difficulter_id?: number | null } = {};
      if (!sameImp) patchBody.importance_id = draftImportanceId ?? null;
      if (!sameDif) patchBody.difficulter_id = draftDifficulteId ?? null;
      const updated = await patchQuestion(curQ.id, patchBody);
      data.setSession((prev) => {
        if (!prev) return prev;
        const qs = [...prev.questions];
        const qi = qs.findIndex((x) => x.id === curQ.id);
        if (qi < 0 || !qs[qi]) return prev;
        qs[qi] = mergeQuizSessionQuestionFromRow(qs[qi]!, updated);
        return { ...prev, questions: qs };
      });
      return true;
    } catch {
      feedback.setMessage("Enregistrement de la difficulté ou de l’importance impossible. Réessaie.");
      return false;
    }
  };

  const syncPack: QuizAnnotationSyncPack = {
    syncVerifierIfNeeded,
    syncDraftCategoriesIfNeeded,
    syncDraftScalesIfNeeded,
  };

  useLayoutEffect(() => {
    syncRegistration.register(syncPack);
  });

  return {
    drafts: {
      verifier: draftVerifier,
      setVerifier: setDraftVerifier,
      categorieParentId: draftCategoriePid,
      categorieEnfantId: draftCategorieEid,
      importanceId: draftImportanceId,
      difficulteId: draftDifficulteId,
      handleParentCategory,
      handleChildCategory,
      handleDraftDifficulte,
      handleDraftImportance,
    },
    refsForUi: {
      refCategoriesHierarchy: refsTables.refCategoriesHierarchy,
      refCategories: refsTables.refCategories,
      difficulteRows: refsTables.difficulteRows,
      importanceRows: refsTables.importanceRows,
      resolveDraftParentKey,
    },
  };
}
