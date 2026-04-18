import { ArrowLeft, ClipboardCopy, Pencil, Plus } from "lucide-preact";
import { route } from "preact-router";
import { playOrdersLabel, playQtypeLabel } from "../../../lib/playOrder";
import { cn } from "../../../lib/cn";
import { Badge } from "../../atomes/Badge/Badge";
import { Button } from "../../atomes/Button/Button";
import { Card } from "../../atomes/Card/Card";
import { ProgressBar } from "../../atomes/ProgressBar/ProgressBar";
import { AnswerOption } from "../../atomes/AnswerOption/AnswerOption";
import { AppFooter } from "../../atomes/AppFooter/AppFooter";
import { AppHeader } from "../../atomes/AppHeader/AppHeader";
import type {
  QuizSessionHeaderProps,
  QuizSessionProgressProps,
  QuizSessionQuestionCardProps,
} from "./QuizSessionView.types";
import { QUIZ_SESSION_STYLES } from "./QuizSessionView.styles";

export function QuizSessionLoading() {
  return (
    <div class={QUIZ_SESSION_STYLES.pageShell}>
      <AppHeader />
      <main class={QUIZ_SESSION_STYLES.centeredMain}>
        <p class="text-base text-base-content/70">Chargement du quiz…</p>
      </main>
      <AppFooter />
    </div>
  );
}

export function QuizSessionError({ loadError }: { loadError: string | null }) {
  return (
    <div class={QUIZ_SESSION_STYLES.pageShell}>
      <AppHeader />
      <main class={QUIZ_SESSION_STYLES.centeredMain}>
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

export function QuizSessionHeader({ data, backTarget }: QuizSessionHeaderProps) {
  return (
    <div class={QUIZ_SESSION_STYLES.topRow}>
      <Button variant="ghost" class="btn-sm gap-1 px-3" onClick={() => route(backTarget)}>
        <ArrowLeft class="h-4 w-4" aria-hidden />
        Retour
      </Button>
      <div class={QUIZ_SESSION_STYLES.badgesRow}>
        <Badge tone={data.mode === "random" ? "flow" : "learn"}>{data.nom}</Badge>
        <span class={QUIZ_SESSION_STYLES.orderBadgeWrap} title={playOrdersLabel(data.playOrders)}>
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
  );
}

export function QuizSessionQuestionCard({
  data,
  index,
  total,
  q,
  pickedId,
  revealed,
  anecdote,
  correct,
  draftVerifier,
  nextBusy,
  fetchingMore,
  onPick,
  onOpenCreateLinkedQuestionModal,
  onOpenEditQuestionModal,
  onCopyCurrentQuestionJson,
  onDraftVerifier,
  onNext,
  onEndInfiniteSession,
}: QuizSessionQuestionCardProps) {
  return (
    <div class={QUIZ_SESSION_STYLES.bodyLayout}>
      <aside class={QUIZ_SESSION_STYLES.aside} aria-label="Actions sur la question">
        <Button
          variant="outline"
          class={QUIZ_SESSION_STYLES.actionButton}
          type="button"
          title="Ajouter une question liée à celle-ci (relation parent → enfant)"
          onClick={() => onOpenCreateLinkedQuestionModal(q)}
        >
          <Plus class="h-4 w-4 shrink-0" aria-hidden />
          <span class={QUIZ_SESSION_STYLES.actionButtonText}>Ajouter</span>
        </Button>
        <Button
          variant="outline"
          class={QUIZ_SESSION_STYLES.actionButton}
          type="button"
          title="Modifier la question affichée"
          onClick={() => onOpenEditQuestionModal(q)}
        >
          <Pencil class="h-4 w-4 shrink-0" aria-hidden />
          <span class={QUIZ_SESSION_STYLES.actionButtonText}>Modifier</span>
        </Button>
        <Button
          variant="outline"
          class={QUIZ_SESSION_STYLES.actionButton}
          type="button"
          title="Copier un JSON (question, commentaire, réponses)"
          onClick={() => void onCopyCurrentQuestionJson(q)}
        >
          <ClipboardCopy class="h-4 w-4 shrink-0" aria-hidden />
          <span class={QUIZ_SESSION_STYLES.actionButtonText}>Copier</span>
        </Button>
        <label
          aria-label={`Fake-checker, ${draftVerifier ? "oui" : "non"}. Cliquer pour basculer.`}
          class={cn(
            QUIZ_SESSION_STYLES.verifierToggleBase,
            draftVerifier
              ? QUIZ_SESSION_STYLES.verifierToggleOn
              : QUIZ_SESSION_STYLES.verifierToggleOff,
            nextBusy && "pointer-events-none opacity-50",
          )}
        >
          <input
            type="checkbox"
            class="sr-only"
            checked={draftVerifier}
            disabled={nextBusy}
            onChange={(e) => onDraftVerifier((e.target as HTMLInputElement).checked)}
          />
          <span class="pointer-events-none select-none">verifier : {draftVerifier ? "Oui" : "Non"}</span>
        </label>
      </aside>

      <Card class={QUIZ_SESSION_STYLES.card}>
        <p class={QUIZ_SESSION_STYLES.questionMeta}>
          Question {index + 1} / {total}
        </p>
        <h2 class={QUIZ_SESSION_STYLES.questionTitle}>{q.question}</h2>
        <div class={QUIZ_SESSION_STYLES.answers}>
          {q.reponses.map((r) => (
            <AnswerOption
              key={r.id}
              label={r.reponse}
              reponseId={r.id}
              pickedId={pickedId}
              revealed={revealed}
              isCorrectAnswer={r.bonne_reponse}
              disabled={pickedId != null}
              onPick={() => onPick(r.id)}
            />
          ))}
        </div>

        {revealed ? (
          <div class={QUIZ_SESSION_STYLES.revealBox}>
            <p class={QUIZ_SESSION_STYLES.revealText}>
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
            <div class={QUIZ_SESSION_STYLES.revealActions}>
              <Button
                variant="flow"
                class={QUIZ_SESSION_STYLES.nextButton}
                disabled={nextBusy || fetchingMore}
                onClick={onNext}
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
                  class={QUIZ_SESSION_STYLES.nextButton}
                  disabled={nextBusy || fetchingMore}
                  onClick={onEndInfiniteSession}
                >
                  Terminer la session
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

export function QuizSessionProgress({
  playInfinite,
  progressValue,
  total,
}: QuizSessionProgressProps) {
  if (playInfinite) return null;
  return <ProgressBar value={progressValue} max={total} class="mb-6" />;
}
