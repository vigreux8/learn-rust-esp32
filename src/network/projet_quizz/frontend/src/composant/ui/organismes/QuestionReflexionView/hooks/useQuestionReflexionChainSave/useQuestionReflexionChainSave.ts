import { useCallback } from "preact/hooks";
import {
  fetchGroupeQuestions,
  patchReflexionChain,
  postCreateQuestion,
} from "../../../../../../lib/api";
import {
  chainColorLevelsRecordForApi,
  remapChainColorLevelsAfterDraftReplace,
} from "../../QuestionReflexionView.metier";
import type { UseQuestionReflexionChainSaveProps } from "./useQuestionReflexionChainSave.types";

/**
 * Persistance serveur de la suite réflexion : matérialisation des questions brouillon (ids négatifs),
 * envoi `patchReflexionChain`, rechargement de la chaîne ; gère le retry si le groupe ciblé est périmé.
 */
export function useQuestionReflexionChainSave({
  routing,
  identity,
  refs,
  state,
  setters,
  integrations,
}: UseQuestionReflexionChainSaveProps) {
  const { collectionIdNum } = routing;
  const { userId } = identity;
  const { selectedGroupeIdRef } = refs;
  const { ordered, localPoolDrafts, chainColorLevels } = state;
  const { setGroupes, setLocalPoolDrafts, setOperationError, setChainBusy } = setters;
  const { applySelectedGroupeId, loadChainFor } = integrations;

  const saveChainDraft = useCallback(async (): Promise<boolean> => {
    if (collectionIdNum == null) return true;
    if (ordered.length === 0) {
      setOperationError("La suite ordonnée est vide : rien à enregistrer.");
      return true;
    }

    let gid = selectedGroupeIdRef.current;
    let finalOrderedIds: number[] = [];
    let remappedLevels: Record<number, number> = chainColorLevels;

    setChainBusy(true);
    setOperationError(null);
    try {
      const idReplace = new Map<number, number>();
      let nextDrafts = localPoolDrafts;

      for (const q of ordered) {
        if (q.id >= 0) continue;
        const draft = nextDrafts.find((d) => d.id === q.id);
        if (draft == null) {
          throw new Error(
            `Brouillon introuvable (id ${q.id}). Ré-importe depuis LLM ou retire cette carte de la suite.`,
          );
        }
        const reps = draft.payload.reponses.map((r) => ({
          texte: r.texte.trim(),
          correcte: r.correcte,
        }));
        const created = await postCreateQuestion({
          user_id: userId,
          categorie_id: draft.categorie_id,
          question: draft.payload.question.trim(),
          commentaire: (draft.payload.commentaire ?? "").trim(),
          reponses: reps,
          collection_id: collectionIdNum,
        });
        idReplace.set(q.id, created.id);
        nextDrafts = nextDrafts.filter((d) => d.id !== q.id);
      }

      finalOrderedIds = ordered.map((q) => {
        if (q.id > 0) return q.id;
        const nid = idReplace.get(q.id);
        if (nid == null || nid <= 0) {
          throw new Error("Erreur après création : identifiant de question invalide.");
        }
        return nid;
      });

      remappedLevels =
        idReplace.size > 0
          ? remapChainColorLevelsAfterDraftReplace(chainColorLevels, idReplace)
          : chainColorLevels;

      if (idReplace.size > 0) {
        setLocalPoolDrafts(nextDrafts);
      }

      await patchReflexionChain(collectionIdNum, {
        user_id: userId,
        ordered_question_ids: finalOrderedIds,
        groupe_questions_id: gid ?? undefined,
        chain_color_levels: chainColorLevelsRecordForApi(remappedLevels),
      });
      await loadChainFor(collectionIdNum, gid);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Enregistrement de la suite impossible.";
      const staleGroupe =
        msg.includes("groupe_questions") &&
        (msg.includes("introuvable") || msg.includes("not found") || msg.includes("400"));
      if (staleGroupe && finalOrderedIds.length > 0) {
        try {
          const groupesFresh = await fetchGroupeQuestions(collectionIdNum);
          setGroupes(groupesFresh);
          const validId =
            gid != null && groupesFresh.some((g) => g.id === gid) ? gid : (groupesFresh[0]?.id ?? null);
          applySelectedGroupeId(validId);
          gid = validId;
          await patchReflexionChain(collectionIdNum, {
            user_id: userId,
            ordered_question_ids: finalOrderedIds,
            groupe_questions_id: gid ?? undefined,
            chain_color_levels: chainColorLevelsRecordForApi(remappedLevels),
          });
          await loadChainFor(collectionIdNum, gid);
          return true;
        } catch (retryError: unknown) {
          const retryMsg =
            retryError instanceof Error ? retryError.message : "Enregistrement de la suite impossible.";
          setOperationError(retryMsg);
          return false;
        }
      }
      setOperationError(msg);
      return false;
    } finally {
      setChainBusy(false);
    }
  }, [
    collectionIdNum,
    userId,
    loadChainFor,
    chainColorLevels,
    ordered,
    localPoolDrafts,
    applySelectedGroupeId,
    selectedGroupeIdRef,
    setGroupes,
    setLocalPoolDrafts,
    setOperationError,
    setChainBusy,
  ]);

  return { saveChainDraft };
}
