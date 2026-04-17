import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { route } from "preact-router";
import { ArrowLeft, ClipboardCopy, Pencil, Plus } from "lucide-preact";
import {
  fetchCollection,
  fetchRandomQuiz,
  fetchQuestionDetail,
  fetchRefCategories,
  patchQuestion,
  postCreateQuestion,
  postQuizKpi,
  type HttpError,
} from "../../lib/api";
import { useRoutePath } from "../../lib/routePathContext";
import {
  playFetchParamsFromSearch,
  playOrdersLabel,
  playOrdersRequireUserId,
  playQtypeLabel,
  shuffleQuestions,
  type PlayOrder,
  type PlayQtype,
} from "../../lib/playOrder";
import { useUserSession } from "../../lib/userSession";
import type { QuestionUi, QuizzQuestionDetail, RefCategorieRow } from "../../types/quizz";
import { saveLastQuizResult } from "../../lib/lastQuizResult";
import { AppHeader } from "../molecules/AppHeader/AppHeader";
import { AppFooter } from "../molecules/AppFooter/AppFooter";
import { Card } from "../atomes/Card/Card";
import { Button } from "../atomes/Button/Button";
import { ProgressBar } from "../atomes/ProgressBar/ProgressBar";
import { Badge } from "../atomes/Badge/Badge";
import { AnswerOption } from "../molecules/AnswerOption/AnswerOption";
import {
  QuestionEditModal,
  type QuestionCreateSavePayload,
} from "../molecules/QuestionEditModal/QuestionEditModal";
import { cn } from "../../lib/cn";

export type QuizSessionViewProps = {
  collectionId?: string;
};

type SessionData = {
  mode: "collection" | "random";
  collectionId: number | null;
  nom: string;
  questions: QuestionUi[];
  playOrders: PlayOrder[];
  playQtype: PlayQtype;
  playInfinite: boolean;
  /** Pour les requêtes API (modes KPI). */
  playUserId?: number;
  /** Si faux, l’ordre aléatoire est appliqué côté client (URLs sans paramètres de jeu). */
  useServerPlayModes: boolean;
};

function isPickedCorrect(questions: QuestionUi[], qIndex: number, reponseId: number): boolean {
  const cur = questions[qIndex];
  return cur?.reponses.some((r) => r.id === reponseId && r.bonne_reponse) ?? false;
}

function buildQuestionCopyJson(q: QuestionUi): string {
  return JSON.stringify(
    {
      question: q.question,
      commentaire: q.commentaire,
      reponses: q.reponses.map((r) => ({
        reponse: r.reponse,
        bonne_reponse: r.bonne_reponse,
      })),
    },
    null,
    2,
  );
}

/**
 * Déroulé d’une session de quiz (collection ou aléatoire) : chargement des questions, réponses, progression et envoi des KPI.
 */
export function QuizSessionView({ collectionId }: QuizSessionViewProps) {
  const { userId } = useUserSession();
  const routePath = useRoutePath();
  const questionStartedAtMs = useRef(0);
  const allServedQuestionIdsRef = useRef<number[]>([]);
  const playedTowardResultsRef = useRef(0);

  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [pickedId, setPickedId] = useState<number | null>(null);
  const [good, setGood] = useState(0);

  const [refCategories, setRefCategories] = useState<RefCategorieRow[]>([]);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionModalVariant, setQuestionModalVariant] = useState<"edit" | "create">("edit");
  const [createParentQuestionId, setCreateParentQuestionId] = useState<number | null>(null);
  const [questionModalLoading, setQuestionModalLoading] = useState(false);
  const [questionModalError, setQuestionModalError] = useState<string | null>(null);
  const [questionModalDetail, setQuestionModalDetail] = useState<QuizzQuestionDetail | null>(null);
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftCommentaire, setDraftCommentaire] = useState("");
  const [draftCategorieId, setDraftCategorieId] = useState<number | null>(null);
  const [questionModalSaving, setQuestionModalSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  /** Fake-checker (`verifier`) ; persisté au clic sur « Suivant » si modifié. */
  const [draftVerifier, setDraftVerifier] = useState(false);
  const [nextBusy, setNextBusy] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  useEffect(() => {
    void fetchRefCategories()
      .then(setRefCategories)
      .catch(() => setRefCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setData(null);
    allServedQuestionIdsRef.current = [];
    playedTowardResultsRef.current = 0;

    (async () => {
      try {
        const pf = playFetchParamsFromSearch();
        const qtype = pf.qtype;
        const orders = pf.orders;
        const playUserId =
          pf.userId ?? (playOrdersRequireUserId(orders) ? userId : undefined);
        if (collectionId === "random") {
          const questions = await fetchRandomQuiz(
            pf.useServerPlayModes
              ? {
                  orders: pf.orders,
                  qtype: pf.qtype,
                  userId: playUserId,
                  infinite: pf.infinite,
                  excludeIds: pf.excludeIds,
                }
              : { qtype: pf.qtype },
          );
          if (cancelled) return;
          if (questions.length === 0) {
            setLoadError("empty");
            return;
          }
          if (pf.infinite) {
            allServedQuestionIdsRef.current = questions.map((q) => q.id);
          }
          setData({
            mode: "random",
            collectionId: null,
            nom: "Mélange aléatoire",
            questions,
            playOrders: orders,
            playQtype: qtype,
            playInfinite: pf.infinite,
            playUserId,
            useServerPlayModes: pf.useServerPlayModes,
          });
          setIndex(0);
          setPickedId(null);
          setGood(0);
          return;
        }
        const cid = Number(collectionId);
        if (!Number.isFinite(cid)) {
          setLoadError("bad");
          return;
        }
        const col = await fetchCollection(
          cid,
          pf.useServerPlayModes
            ? {
                qtype: pf.qtype,
                orders: pf.orders,
                userId: playUserId,
                infinite: pf.infinite,
                excludeIds: pf.excludeIds,
              }
            : { qtype: pf.qtype },
        );
        if (cancelled) return;
        if (col.questions.length === 0) {
          setLoadError("empty");
          return;
        }
        let questions = [...col.questions];
        if (!pf.useServerPlayModes && orders.length === 1 && orders[0] === "random") {
          questions = shuffleQuestions(questions);
        }
        if (pf.infinite) {
          allServedQuestionIdsRef.current = questions.map((q) => q.id);
        }
        setData({
          mode: "collection",
          collectionId: cid,
          nom: col.nom,
          questions,
          playOrders: orders,
          playQtype: qtype,
          playInfinite: pf.infinite,
          playUserId,
          useServerPlayModes: pf.useServerPlayModes,
        });
        setIndex(0);
        setPickedId(null);
        setGood(0);
      } catch (e) {
        if (!cancelled) {
          const status = typeof e === "object" && e !== null && "status" in e ? (e as HttpError).status : undefined;
          if (status === 404) setLoadError("empty");
          else setLoadError("fetch");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [collectionId, routePath, userId]);

  useLayoutEffect(() => {
    if (data == null) return;
    questionStartedAtMs.current = performance.now();
  }, [data, index]);

  useEffect(() => {
    setQuestionModalOpen(false);
  }, [index]);

  useEffect(() => {
    if (data == null) return;
    const cur = data.questions[index];
    if (cur) setDraftVerifier(cur.verifier);
  }, [data, index]);

  useEffect(() => {
    if (actionMessage == null) return;
    const t = window.setTimeout(() => setActionMessage(null), 3200);
    return () => clearTimeout(t);
  }, [actionMessage]);

  const closeQuestionModal = () => {
    setQuestionModalOpen(false);
    setQuestionModalLoading(false);
    setQuestionModalError(null);
    setQuestionModalDetail(null);
    setCreateParentQuestionId(null);
  };

  const openEditQuestionModal = (current: QuestionUi) => {
    setQuestionModalVariant("edit");
    setQuestionModalOpen(true);
    setQuestionModalLoading(true);
    setQuestionModalError(null);
    setQuestionModalDetail(null);
    void fetchQuestionDetail(current.id)
      .then((d) => {
        setQuestionModalDetail(d);
        setDraftQuestion(d.question);
        setDraftCommentaire(d.commentaire);
        setDraftCategorieId(d.categorie_id);
      })
      .catch(() => setQuestionModalError("fetch"))
      .finally(() => setQuestionModalLoading(false));
  };

  const openCreateLinkedQuestionModal = (parent: QuestionUi) => {
    if (refCategories.length === 0) {
      setActionMessage("Catégories indisponibles : impossible de créer une question pour l’instant.");
      return;
    }
    setQuestionModalVariant("create");
    setCreateParentQuestionId(parent.id);
    setQuestionModalOpen(true);
    setQuestionModalLoading(false);
    setQuestionModalError(null);
    setQuestionModalDetail(null);
    setDraftQuestion("");
    setDraftCommentaire("");
    const cat = refCategories.some((c) => c.id === parent.categorie_id)
      ? parent.categorie_id
      : refCategories[0]!.id;
    setDraftCategorieId(cat);
  };

  const refreshQuestionModalDetail = async () => {
    if (questionModalDetail == null) return;
    try {
      const d = await fetchQuestionDetail(questionModalDetail.id);
      setQuestionModalDetail(d);
    } catch {
      /* garder l’affichage actuel */
    }
  };

  const saveEditQuestionModal = async () => {
    if (questionModalDetail == null) return;
    setQuestionModalSaving(true);
    try {
      const payload: { question?: string; commentaire?: string; categorie_id?: number } = {};
      if (draftQuestion !== questionModalDetail.question) payload.question = draftQuestion;
      if (draftCommentaire !== questionModalDetail.commentaire) {
        payload.commentaire = draftCommentaire;
      }
      if (draftCategorieId != null && draftCategorieId !== questionModalDetail.categorie_id) {
        payload.categorie_id = draftCategorieId;
      }
      if (Object.keys(payload).length === 0) {
        closeQuestionModal();
        return;
      }
      const updated = await patchQuestion(questionModalDetail.id, payload);
      setData((prev) => {
        if (!prev) return prev;
        const qi = prev.questions.findIndex((x) => x.id === updated.id);
        if (qi < 0) return prev;
        const questions = [...prev.questions];
        const cur = questions[qi];
        if (!cur) return prev;
        questions[qi] = {
          ...cur,
          question: updated.question,
          commentaire: updated.commentaire,
          categorie_id: updated.categorie_id,
          categorie_type: updated.categorie_type,
          verifier: updated.verifier,
        };
        return { ...prev, questions };
      });
      setActionMessage("Question mise à jour.");
      closeQuestionModal();
    } catch {
      setActionMessage("Enregistrement impossible.");
    } finally {
      setQuestionModalSaving(false);
    }
  };

  const saveCreateQuestionModal = async (payload: QuestionCreateSavePayload) => {
    if (createParentQuestionId == null) return;
    setQuestionModalSaving(true);
    try {
      await postCreateQuestion({
        user_id: userId,
        categorie_id: payload.categorie_id,
        question: payload.question,
        commentaire: payload.commentaire,
        reponses: payload.reponses,
        parent_question_id: createParentQuestionId,
        collection_id: data?.collectionId ?? undefined,
      });
      setActionMessage("Question créée et liée à la question affichée (parent).");
      closeQuestionModal();
    } catch {
      throw new Error("create failed");
    } finally {
      setQuestionModalSaving(false);
    }
  };

  const copyCurrentQuestionJson = async (current: QuestionUi) => {
    const text = buildQuestionCopyJson(current);
    try {
      await navigator.clipboard.writeText(text);
      setActionMessage("JSON copié dans le presse-papiers.");
    } catch {
      setActionMessage("Copie impossible (permissions du navigateur).");
    }
  };

  if (loading) {
    return (
      <div class="flex min-h-dvh flex-col">
        <AppHeader />
        <main class="fl-page-enter mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <p class="text-base text-base-content/70">Chargement du quiz…</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (loadError != null || !data) {
    return (
      <div class="flex min-h-dvh flex-col">
        <AppHeader />
        <main class="fl-page-enter mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <p class="text-lg font-medium text-base-content">Parcours introuvable</p>
          {loadError === "fetch" ? (
            <p class="text-sm text-base-content/60">Impossible de joindre l’API. Le backend est-il démarré ?</p>
          ) : null}
          {loadError === "empty" ? (
            <p class="text-sm text-base-content/60">
              Aucune question avec ce filtre (essaie « Mélanger » ou un autre type) ou collection vide.
            </p>
          ) : null}
          <Button variant="flow" onClick={() => route("/")}>
            Accueil
          </Button>
        </main>
        <AppFooter />
      </div>
    );
  }

  const q = data.questions[index];
  const total = data.questions.length;
  const progressValue = pickedId != null ? index + 1 : index;
  const revealed = pickedId != null;
  const correct = revealed && pickedId != null && isPickedCorrect(data.questions, index, pickedId);
  const anecdote = (q.commentaire ?? "").trim();

  const handlePick = (reponseId: number) => {
    if (pickedId != null) return;
    const dureeSecondes = (performance.now() - questionStartedAtMs.current) / 1000;
    void postQuizKpi({
      userId,
      questionId: q.id,
      reponseId,
      dureeSecondes,
    }).catch(() => {
      /* KPI optionnel : ne pas bloquer le jeu */
    });
    setPickedId(reponseId);
  };

  const syncVerifierIfNeeded = async (): Promise<boolean> => {
    const curQ = data!.questions[index];
    if (draftVerifier === curQ.verifier) return true;
    try {
      const updated = await patchQuestion(curQ.id, { verifier: draftVerifier });
      setData((prev) => {
        if (!prev) return prev;
        const qs = [...prev.questions];
        const i = qs.findIndex((x) => x.id === curQ.id);
        if (i >= 0 && qs[i]) {
          qs[i] = { ...qs[i]!, verifier: updated.verifier };
        }
        return { ...prev, questions: qs };
      });
      return true;
    } catch {
      setActionMessage("Enregistrement du fake-checker impossible. Réessaie.");
      return false;
    }
  };

  const handleNext = () => {
    if (nextBusy || pickedId == null || data == null) return;
    void (async () => {
      setNextBusy(true);
      try {
        if (!(await syncVerifierIfNeeded())) return;

        const delta =
          pickedId != null && isPickedCorrect(data.questions, index, pickedId) ? 1 : 0;
        const nextGood = good + delta;

        if (index + 1 >= total) {
          if (data.playInfinite) {
            setFetchingMore(true);
            try {
              const excludeIds = allServedQuestionIdsRef.current;
              const nextQuestions =
                collectionId === "random"
                  ? await fetchRandomQuiz({
                      orders: data.playOrders,
                      qtype: data.playQtype,
                      userId: data.playUserId,
                      infinite: true,
                      excludeIds,
                    })
                  : (
                      await fetchCollection(data.collectionId!, {
                        orders: data.playOrders,
                        qtype: data.playQtype,
                        userId: data.playUserId,
                        infinite: true,
                        excludeIds,
                      })
                    ).questions;
              playedTowardResultsRef.current += 1;
              if (nextQuestions.length === 0) {
                saveLastQuizResult({
                  mode: data.mode,
                  collectionId: data.collectionId,
                  collectionName: data.nom,
                  good: nextGood,
                  total: playedTowardResultsRef.current,
                  playOrders: data.playOrders,
                  playQtype: data.playQtype,
                  playInfinite: true,
                });
                route("/results");
                return;
              }
              allServedQuestionIdsRef.current = [
                ...allServedQuestionIdsRef.current,
                ...nextQuestions.map((q) => q.id),
              ];
              setGood(nextGood);
              setData((prev) =>
                prev != null
                  ? {
                      ...prev,
                      questions: nextQuestions,
                    }
                  : prev,
              );
              setIndex(0);
              setPickedId(null);
              return;
            } catch {
              setActionMessage("Impossible de charger la suite des questions.");
            } finally {
              setFetchingMore(false);
            }
            return;
          }

          playedTowardResultsRef.current += 1;
          saveLastQuizResult({
            mode: data.mode,
            collectionId: data.collectionId,
            collectionName: data.nom,
            good: nextGood,
            total: playedTowardResultsRef.current,
            playOrders: data.playOrders,
            playQtype: data.playQtype,
            playInfinite: false,
          });
          route("/results");
          return;
        }

        playedTowardResultsRef.current += 1;
        setGood(nextGood);
        setIndex((i) => i + 1);
        setPickedId(null);
      } finally {
        setNextBusy(false);
      }
    })();
  };

  const handleEndInfiniteSession = () => {
    if (data == null || pickedId == null) return;
    void (async () => {
      setNextBusy(true);
      try {
        if (!(await syncVerifierIfNeeded())) return;
        const delta =
          pickedId != null && isPickedCorrect(data.questions, index, pickedId) ? 1 : 0;
        const nextGood = good + delta;
        playedTowardResultsRef.current += 1;
        saveLastQuizResult({
          mode: data.mode,
          collectionId: data.collectionId,
          collectionName: data.nom,
          good: nextGood,
          total: playedTowardResultsRef.current,
          playOrders: data.playOrders,
          playQtype: data.playQtype,
          playInfinite: true,
        });
        route("/results");
      } finally {
        setNextBusy(false);
      }
    })();
  };

  const backTarget = data.mode === "random" ? "/" : "/collections";

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <main class="fl-page-enter mx-auto w-full max-w-2xl flex-1 px-4 py-6 md:py-8">
        <div class="mb-6 flex items-center gap-2">
          <Button variant="ghost" class="btn-sm gap-1 px-3" onClick={() => route(backTarget)}>
            <ArrowLeft class="h-4 w-4" aria-hidden />
            Retour
          </Button>
          <div class="flex flex-wrap items-center gap-2">
            <Badge tone={data.mode === "random" ? "flow" : "learn"}>{data.nom}</Badge>
            <span class="max-w-[min(100%,18rem)] truncate" title={playOrdersLabel(data.playOrders)}>
              <Badge tone="learn" class="font-normal opacity-90">
                {playOrdersLabel(data.playOrders)}
              </Badge>
            </span>
            <Badge tone="flow" class="font-normal opacity-90">
              {playQtypeLabel(data.playQtype)}
            </Badge>
            {data.playInfinite ? (
              <Badge tone="learn" class="font-normal opacity-90">
                Session infinie
              </Badge>
            ) : null}
          </div>
        </div>

        {actionMessage ? (
          <p class="mb-3 rounded-xl border border-flow/20 bg-flow/5 px-3 py-2 text-center text-sm text-base-content">
            {actionMessage}
          </p>
        ) : null}

        {data.playInfinite ? null : <ProgressBar value={progressValue} max={total} class="mb-6" />}

        <div class="flex flex-col gap-4 md:flex-row md:items-stretch">
          <aside
            class="flex shrink-0 flex-row flex-wrap gap-2 md:w-36 md:flex-col md:items-stretch"
            aria-label="Actions sur la question"
          >
            <Button
              variant="outline"
              class="btn-sm flex-1 gap-1 sm:flex-none"
              type="button"
              title="Ajouter une question liée à celle-ci (relation parent → enfant)"
              onClick={() => openCreateLinkedQuestionModal(q)}
            >
              <Plus class="h-4 w-4 shrink-0" aria-hidden />
              <span class="hidden sm:inline">Ajouter</span>
            </Button>
            <Button
              variant="outline"
              class="btn-sm flex-1 gap-1 sm:flex-none"
              type="button"
              title="Modifier la question affichée"
              onClick={() => openEditQuestionModal(q)}
            >
              <Pencil class="h-4 w-4 shrink-0" aria-hidden />
              <span class="hidden sm:inline">Modifier</span>
            </Button>
            <Button
              variant="outline"
              class="btn-sm flex-1 gap-1 sm:flex-none"
              type="button"
              title="Copier un JSON (question, commentaire, réponses)"
              onClick={() => void copyCurrentQuestionJson(q)}
            >
              <ClipboardCopy class="h-4 w-4 shrink-0" aria-hidden />
              <span class="hidden sm:inline">Copier</span>
            </Button>
            <label
              aria-label={`Fake-checker, ${draftVerifier ? "oui" : "non"}. Cliquer pour basculer.`}
              class={cn(
                "btn btn-sm mt-1 flex h-auto min-h-0 w-full cursor-pointer flex-nowrap items-center justify-start gap-2 rounded-full border-2 py-2.5 pl-3 pr-4 text-left text-sm font-medium shadow-md transition-all duration-300 ease-out hover:shadow-lg active:scale-[0.97] md:mt-0",
                draftVerifier
                  ? "border-flow/40 bg-transparent text-flow hover:border-flow hover:bg-flow/5"
                  : "border-error/50 bg-error/10 text-error hover:border-error hover:bg-error/15",
                nextBusy && "pointer-events-none opacity-50",
              )}
            >
              <input
                type="checkbox"
                class="sr-only"
                checked={draftVerifier}
                disabled={nextBusy}
                onChange={(e) => setDraftVerifier((e.target as HTMLInputElement).checked)}
              />
              <span class="pointer-events-none select-none">
                verifier : {draftVerifier ? "Oui" : "Non"}
              </span>
            </label>
          </aside>

          <Card class="min-w-0 flex-1 transition duration-300">
            <p class="mb-4 text-xs font-medium uppercase tracking-wide text-base-content/45">
              Question {index + 1} / {total}
            </p>
            <h2 class="mb-6 text-lg font-semibold leading-snug text-base-content sm:text-xl">{q.question}</h2>
            <div class="flex flex-col gap-2.5">
              {q.reponses.map((r) => (
                <AnswerOption
                  key={r.id}
                  label={r.reponse}
                  reponseId={r.id}
                  pickedId={pickedId}
                  revealed={revealed}
                  isCorrectAnswer={r.bonne_reponse}
                  disabled={pickedId != null}
                  onPick={() => handlePick(r.id)}
                />
              ))}
            </div>

            {revealed ? (
              <div class="fl-reveal-enter mt-8 space-y-5 rounded-[1.75rem] border border-base-content/8 bg-gradient-to-b from-base-100/95 to-base-200/40 p-6 shadow-inner">
                <p class="text-center text-base leading-relaxed text-base-content/85">
                  {anecdote ? (
                    <span class="block">{anecdote}</span>
                  ) : correct ? (
                    <>
                      Bien vu — <span class="font-semibold text-flow">c’est la bonne réponse</span>.
                    </>
                  ) : (
                    <>Ce n’était pas la bonne proposition.</>
                  )}
                </p>
                <div class="flex flex-col items-center justify-center gap-2 sm:flex-row">
                  <Button
                    variant="flow"
                    class="min-w-[11rem] px-8"
                    disabled={nextBusy || fetchingMore}
                    onClick={handleNext}
                  >
                    {nextBusy
                      ? "Enregistrement…"
                      : fetchingMore
                        ? "Chargement…"
                        : index >= total - 1
                          ? data.playInfinite
                            ? "Nouvelles questions"
                            : "Voir le résultat"
                          : "Suivant"}
                  </Button>
                  {data.playInfinite && index >= total - 1 ? (
                    <Button
                      variant="outline"
                      class="min-w-[11rem] px-8"
                      disabled={nextBusy || fetchingMore}
                      onClick={() => handleEndInfiniteSession()}
                    >
                      Terminer la session
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </main>
      <AppFooter />

      <QuestionEditModal
        open={questionModalOpen}
        variant={questionModalVariant}
        modalTitle={questionModalVariant === "create" ? "Nouvelle question liée" : undefined}
        loading={questionModalLoading}
        loadError={questionModalError}
        detail={questionModalDetail}
        categorieOptions={refCategories}
        draftQuestion={draftQuestion}
        draftCommentaire={draftCommentaire}
        draftCategorieId={draftCategorieId}
        saving={questionModalSaving}
        onClose={closeQuestionModal}
        onDraftQuestion={setDraftQuestion}
        onDraftCommentaire={setDraftCommentaire}
        onDraftCategorieId={setDraftCategorieId}
        onSave={() => void saveEditQuestionModal()}
        onReponseUpdated={() => void refreshQuestionModalDetail()}
        onCreateSave={(payload) => saveCreateQuestionModal(payload)}
      />
    </div>
  );
}
