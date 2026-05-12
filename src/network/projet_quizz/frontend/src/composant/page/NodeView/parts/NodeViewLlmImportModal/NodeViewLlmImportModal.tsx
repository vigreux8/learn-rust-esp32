import { X } from "lucide-preact";
import { useMemo } from "preact/hooks";
import { QuestionsLlmImportPanel } from "../../../../ui/molecules/QuestionsLlmImportPanel";
import { useQuestionsActionBoutons } from "../../../../ui/organismes/QuestionsActionBoutons/QuestionsActionBoutons.hook";
import type { QuestionsActionBoutonsProps } from "../../../../ui/organismes/QuestionsActionBoutons/QuestionsActionBoutons.types";
import type { NodeViewLlmImportModalProps } from "./NodeViewLlmImportModal.types";

type BodyProps = {
  collectionId: number;
  collections: NodeViewLlmImportModalProps["collections"];
  questions: NodeViewLlmImportModalProps["questions"];
  onImportSuccess: () => void;
};

/**
 * Corps du panneau : même hook que la barre d’actions Questions (options + workflow JSON).
 */
function NodeViewLlmImportModalBody({ collectionId, collections, questions, onImportSuccess }: BodyProps) {
  const boutonsProps = useMemo<QuestionsActionBoutonsProps>(
    () => ({
      data: {
        targetCollectionNumeric: collectionId,
        collections,
        importTargetTagCollectionId: null,
        questions,
      },
      actions: { onImportSuccess },
      presentation: { openImportLlmOnMount: true },
    }),
    [collectionId, collections, questions, onImportSuccess],
  );

  const { state, actions } = useQuestionsActionBoutons(boutonsProps);

  return (
    <QuestionsLlmImportPanel
      data={{ options: state.options, llmImportWorkflow: state.llmImportWorkflow }}
      actions={{ onOptionsChange: actions.setOptions }}
    />
  );
}

/**
 * Modale import LLM sur le graphe `/node` : même contenu que sous le bouton de la page Questions.
 */
export function NodeViewLlmImportModal({
  open,
  collectionId,
  collections,
  questions,
  questionsLoading,
  questionsError,
  onClose,
  onImportSuccess,
}: NodeViewLlmImportModalProps) {
  if (!open || collectionId == null) return null;

  const coll = collections.find((c) => c.id === collectionId);

  return (
    <div
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="node-view-llm-import-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        class="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-2xl border border-base-content/15 bg-base-100 p-5 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="node-view-llm-import-title" class="text-lg font-semibold text-base-content">
              Import LLM
            </h2>
            {coll != null ? (
              <p class="mt-1 text-sm text-base-content/60">Collection « {coll.nom} » — même assistant que sur Questions.</p>
            ) : (
              <p class="mt-1 text-sm text-base-content/60">Import JSON généré par un LLM vers cette collection.</p>
            )}
          </div>
          <button
            type="button"
            class="btn btn-ghost btn-sm btn-square shrink-0"
            aria-label="Fermer"
            onClick={onClose}
          >
            <X class="h-5 w-5" aria-hidden />
          </button>
        </div>

        {questionsLoading ? (
          <div class="flex justify-center py-12">
            <span class="loading loading-spinner loading-lg text-primary" aria-busy="true" />
          </div>
        ) : questionsError != null ? (
          <p class="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">{questionsError}</p>
        ) : (
          <NodeViewLlmImportModalBody
            key={collectionId}
            collectionId={collectionId}
            collections={collections}
            questions={questions}
            onImportSuccess={onImportSuccess}
          />
        )}
      </div>
    </div>
  );
}
