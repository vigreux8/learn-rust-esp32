import { useCallback, useRef, useState } from "preact/hooks";
import type { UseQuestionReflexionLeaveGuardProps } from "./useQuestionReflexionLeaveGuard.types";

/**
 * Sortie de page avec garde : si la chaîne locale est « sale », ouvre la modale enregistrer / abandonner /
 * annuler ; résout une promesse pour laisser la navigation ou le changement de groupe continuer ou non.
 */
export function useQuestionReflexionLeaveGuard({
  chain,
  routing,
}: UseQuestionReflexionLeaveGuardProps) {
  const { collectionIdNum, selectedGroupeIdRef } = routing;
  const pendingLeaveResolveRef = useRef<((value: boolean) => void) | null>(null);
  const [unsavedLeaveModalOpen, setUnsavedLeaveModalOpen] = useState(false);
  const [leaveDiscardBusy, setLeaveDiscardBusy] = useState(false);

  const resolveLeavePrompt = useCallback((proceed: boolean) => {
    setUnsavedLeaveModalOpen(false);
    const resolve = pendingLeaveResolveRef.current;
    pendingLeaveResolveRef.current = null;
    resolve?.(proceed);
  }, []);

  const confirmLeaveIfNeeded = useCallback((): Promise<boolean> => {
    if (!chain.chainDirtyRef.current) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      pendingLeaveResolveRef.current = resolve;
      setUnsavedLeaveModalOpen(true);
    });
  }, [chain.chainDirtyRef]);

  const onUnsavedLeaveCancel = useCallback(() => {
    resolveLeavePrompt(false);
  }, [resolveLeavePrompt]);

  const onUnsavedLeaveSave = useCallback(async () => {
    const ok = await chain.saveChainDraft();
    if (ok) resolveLeavePrompt(true);
  }, [chain.saveChainDraft, resolveLeavePrompt]);

  const onUnsavedLeaveDiscard = useCallback(async () => {
    setLeaveDiscardBusy(true);
    try {
      if (collectionIdNum != null) {
        await chain.loadChainFor(collectionIdNum, selectedGroupeIdRef.current);
      }
      resolveLeavePrompt(true);
    } finally {
      setLeaveDiscardBusy(false);
    }
  }, [collectionIdNum, chain.loadChainFor, selectedGroupeIdRef, resolveLeavePrompt]);

  return {
    confirmLeaveIfNeeded,
    unsavedLeaveModal: {
      open: unsavedLeaveModalOpen,
      saveBusy: chain.chainBusy,
      discardBusy: leaveDiscardBusy,
      onCancel: onUnsavedLeaveCancel,
      onSave: onUnsavedLeaveSave,
      onDiscard: onUnsavedLeaveDiscard,
    },
  };
}
