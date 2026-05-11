import { useRef } from "preact/hooks";
import { useRoutePath } from "../../../../lib/routePathContext";
import { useUserSession } from "../../../../lib/userSession";
import {
  formatSessionDraftCategorieResume,
  getSupportedQuestionCategories,
} from "../../../../lib/questionCategories";
import type { QuizSessionLoadTrackers } from "./hooks/useQuizSessionSessionLoad/useQuizSessionSessionLoad.types";
import type { QuizAnnotationSyncPack } from "./hooks/useQuizSessionQuestionAnnotations/useQuizSessionQuestionAnnotations.types";
import { useQuizSessionActionMessage } from "./hooks/useQuizSessionActionMessage";
import { useQuizSessionBootstrapRefs } from "./hooks/useQuizSessionBootstrapRefs";
import { useQuizSessionEditModal } from "./hooks/useQuizSessionEditModal";
import { useQuizSessionQuestionAnnotations } from "./hooks/useQuizSessionQuestionAnnotations";
import { useQuizSessionPlayState } from "./hooks/useQuizSessionPlayState";
import { useQuizSessionSessionLoad } from "./hooks/useQuizSessionSessionLoad";
import type { QuizSessionViewProps } from "./QuizSessionView.types";

/**
 * Orchestrateur session quiz : charge référentiels, hydrate la session, gère lecture/édition/annotations et message
 * utilisateur ; compose les sous-hooks spécialisés en un seul modèle pour la vue.
 */
export function useQuizSessionView(props: QuizSessionViewProps) {
  const { route } = props;
  const { userId } = useUserSession();
  const routePath = useRoutePath();

  const bootstrap = useQuizSessionBootstrapRefs();
  const { feedback } = useQuizSessionActionMessage();

  const trackersRef = useRef<QuizSessionLoadTrackers | null>(null);
  const interactionLockedRef = useRef(false);
  const annotationSyncPackRef = useRef<QuizAnnotationSyncPack | null>(null);

  const editionQuestionDetailIdRef = useRef<number | null>(null);
  const editionCloseRef = useRef<(() => void) | null>(null);

  const hydrate = useQuizSessionSessionLoad({
    route: { collectionId: route.collectionId },
    deps: { routePath, userId },
    trackersRef,
  });

  const navigate = useQuizSessionPlayState({
    route: { collectionId: route.collectionId },
    trackersRef,
    session: hydrate.data.session,
    identity: { userId },
    feedback: { setMessage: feedback.setMessage },
    mutations: { setSession: hydrate.data.setSession },
    locks: { interactionLockedRef },
    annotationSyncPackRef,
    edition: {
      questionDetailIdRef: editionQuestionDetailIdRef,
      closeQuestionModalRef: editionCloseRef,
    },
  });

  const annotations = useQuizSessionQuestionAnnotations({
    data: {
      session: hydrate.data.session,
      index: navigate.navigation.index,
      setSession: hydrate.data.setSession,
    },
    refsTables: {
      refCategoriesHierarchy: bootstrap.refCategoriesHierarchy,
      refCategories: bootstrap.refCategories,
      difficulteRows: bootstrap.refDifficulteQuestion,
      importanceRows: bootstrap.refImportanceQuestion,
    },
    locks: { interactionLockedRef },
    feedback: { setMessage: feedback.setMessage },
    syncRegistration: {
      register: (pack: QuizAnnotationSyncPack) => {
        annotationSyncPackRef.current = pack;
      },
    },
  });

  const edition = useQuizSessionEditModal({
    navigation: { viewingIndex: navigate.navigation.index },
    identity: { userId },
    session: hydrate.data.session,
    refs: { refCategories: bootstrap.refCategories },
    feedback: { setMessage: feedback.setMessage },
    dataDeps: { setSession: hydrate.data.setSession },
  });

  editionQuestionDetailIdRef.current = edition.internals.questionDetail?.id ?? null;
  editionCloseRef.current = edition.internals.closeQuestionModal;

  if (hydrate.status.loading) {
    return { kind: "loading" as const };
  }

  if (hydrate.status.loadError != null || hydrate.data.session == null) {
    return { kind: "error" as const, loadError: hydrate.status.loadError };
  }

  const sessionSnap = hydrate.data.session;
  const total = sessionSnap.questions.length;
  const idx = navigate.navigation.index;
  const q = sessionSnap.questions[idx]!;
  const progressValue = navigate.status.pickedId != null ? idx + 1 : idx;
  const anecdote = (q.commentaire ?? "").trim();
  const backTarget = sessionSnap.mode === "random" ? "/" : "/collections";
  const categoryPendingSync =
    annotations.drafts.categorieParentId !== q.categorie_id ||
    (annotations.drafts.categorieEnfantId ?? null) !== (q.categorie_e_id ?? null);
  const scalesPendingSync =
    (annotations.drafts.importanceId ?? null) !== (q.importance_id ?? null) ||
    (annotations.drafts.difficulteId ?? null) !== (q.difficulter_id ?? null);
  const categoryResumeLine = formatSessionDraftCategorieResume(
    annotations.drafts.categorieParentId,
    annotations.drafts.categorieEnfantId,
    annotations.refsForUi.refCategoriesHierarchy,
  );
  const draftResolvedParentKey = annotations.refsForUi.resolveDraftParentKey();

  const trimmedSourceNom = (q.source_collection_nom ?? "").trim();

  return {
    kind: "ready" as const,
    session: {
      data: sessionSnap,
      backTarget,
      actionMessage: feedback.message,
      questionSourceNom:
        sessionSnap.playIncludeChildCollections === true && trimmedSourceNom.length > 0
          ? trimmedSourceNom
          : undefined,
    },
    progress: {
      playInfinite: sessionSnap.playInfinite,
      progressValue,
      total,
    },
    questionCard: {
      data: sessionSnap,
      index: idx,
      total,
      q,
      pickedId: navigate.status.pickedId,
      revealed: navigate.status.revealed,
      anecdote,
      correct: navigate.status.correctAnswer,
      draftVerifier: annotations.drafts.verifier,
      nextBusy: navigate.status.nextBusy,
      fetchingMore: navigate.status.fetchingMore,
      canDeleteCurrentQuestion: q.user_id === userId,
      deleteBusy: navigate.status.deleteBusy,
      onPick: navigate.actions.pick,
      onOpenCreateLinkedQuestionModal: edition.internals.openCreateLinkedQuestionModal,
      onOpenEditQuestionModal: edition.internals.openEditQuestionModal,
      onCopyCurrentQuestionJson: navigate.actions.copyQuestionJson,
      onDeleteCurrentQuestion: navigate.actions.deleteCurrentQuestion,
      onDraftVerifier: annotations.drafts.setVerifier,
      onNext: navigate.actions.advance,
      onEndInfiniteSession: navigate.actions.endInfiniteEarly,
      categorieSections: {
        hierarchy: annotations.refsForUi.refCategoriesHierarchy,
        parentKeys: getSupportedQuestionCategories(annotations.refsForUi.refCategories),
        draftParentKeyResolved: draftResolvedParentKey,
        draftParentId: annotations.drafts.categorieParentId,
        draftEnfantId: annotations.drafts.categorieEnfantId,
        resumeLine: categoryResumeLine,
        pendingSync: categoryPendingSync,
        onParentCategory: annotations.drafts.handleParentCategory,
        onChildCategory: annotations.drafts.handleChildCategory,
      },
      scaleSections: {
        difficulteRows: annotations.refsForUi.difficulteRows,
        importanceRows: annotations.refsForUi.importanceRows,
        draftDifficulteId: annotations.drafts.difficulteId,
        draftImportanceId: annotations.drafts.importanceId,
        pendingSync: scalesPendingSync,
        onDifficulte: annotations.drafts.handleDraftDifficulte,
        onImportance: annotations.drafts.handleDraftImportance,
      },
    },
    editModal: edition.modal,
  };
}
