import type {
  ChildCollectionsMix,
  PlayOrder,
  PlayQtype,
} from "../../../lib/playOrder";
import type { QuestionCategorieKey } from "../../../lib/questionCategories";
import type {
  QuestionUi,
  RefCategorieHierarchyRow,
  RefQuestionScaleRow,
} from "../../../types/quizz";

/** Entrées regroupées (contrat organisme ↔ routeur ou parent). */
export type QuizSessionViewProps = {
  route: {
    collectionId?: string;
  };
};

/** Props injectées par `preact-router` sur `/play/:collectionId`. */
export type QuizSessionRouterInject = {
  collectionId?: string;
};

export type SessionData = {
  mode: "collection" | "random";
  collectionId: number | null;
  nom: string;
  questions: QuestionUi[];
  playOrders: PlayOrder[];
  playQtype: PlayQtype;
  playInfinite: boolean;
  playUserId?: number;
  /** Filtrage sous-collection pour les rechargements « infinite » (mode collection). */
  playSousCollectionId?: number;
  useServerPlayModes: boolean;
  /** Hors bonne réponse : index suivant (sortie des suites réflexion après erreur). */
  wrongAnswerNextIndex?: number[];
  playIncludeReflexion?: boolean;
  playReflexionSharePercent?: number;
  playIncludeChildCollections?: boolean;
  playChildCollectionsMix?: ChildCollectionsMix;
  playFamilyQuotaPercent?: number;
  playFamilyQuotaMax?: number;
  playIncludePersonnaliteFiches?: boolean;
  /** Filtre client : ids des collections cochées sur le graphe `/node` (`graphIncludeIds` dans l’URL). */
  playGraphIncludeIds?: number[] | null;
};

export type QuizSessionHeaderProps = {
  data: SessionData;
  backTarget: string;
  /** Libellé court si la question affichée provient d’une sous-collection (mode parent + enfants). */
  questionSourceNom?: string;
};

export type QuizSessionQuestionCardProps = {
  data: SessionData;
  index: number;
  total: number;
  q: QuestionUi;
  pickedId: number | null;
  revealed: boolean;
  anecdote: string;
  correct: boolean;
  draftVerifier: boolean;
  nextBusy: boolean;
  fetchingMore: boolean;
  categorieSections: {
    hierarchy: RefCategorieHierarchyRow[];
    parentKeys: QuestionCategorieKey[];
    draftParentKeyResolved: QuestionCategorieKey | null;
    draftParentId: number | null;
    draftEnfantId: number | null;
    resumeLine: string;
    /** Draft différent du dernier état serveur pour cette question. */
    pendingSync: boolean;
    onParentCategory: (key: QuestionCategorieKey) => void;
    onChildCategory: (enfantId: number) => void;
  };
  scaleSections: {
    difficulteRows: RefQuestionScaleRow[];
    importanceRows: RefQuestionScaleRow[];
    draftDifficulteId: number | null;
    draftImportanceId: number | null;
    pendingSync: boolean;
    onDifficulte: (rowId: number) => void;
    onImportance: (rowId: number) => void;
  };
  onPick: (reponseId: number) => void;
  onOpenCreateLinkedQuestionModal: (q: QuestionUi) => void;
  onOpenEditQuestionModal: (q: QuestionUi) => void;
  onCopyCurrentQuestionJson: (q: QuestionUi) => Promise<void>;
  canDeleteCurrentQuestion: boolean;
  deleteBusy: boolean;
  onDeleteCurrentQuestion: (q: QuestionUi) => void;
  onDraftVerifier: (value: boolean) => void;
  onNext: () => void;
  onEndInfiniteSession: () => void;
};

export type QuizSessionProgressProps = {
  playInfinite: boolean;
  progressValue: number;
  total: number;
};
