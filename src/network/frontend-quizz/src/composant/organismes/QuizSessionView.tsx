import { useMemo, useState } from "preact/hooks";
import { route } from "preact-router";
import { ArrowLeft } from "lucide-preact";
import { getCollectionUi, isCorrectAnswer } from "../../mocks";
import { saveLastQuizResult } from "../../lib/lastQuizResult";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { Card } from "../atomes/Card";
import { Button } from "../atomes/Button";
import { ProgressBar } from "../atomes/ProgressBar";
import { Badge } from "../atomes/Badge";
import { AnswerOption } from "../molecules/AnswerOption";
import { FeedbackModal } from "../molecules/FeedbackModal";

export type QuizSessionViewProps = {
  collectionId?: string;
};

export function QuizSessionView({ collectionId }: QuizSessionViewProps) {
  const cid = Number(collectionId);
  const data = useMemo(() => (Number.isFinite(cid) ? getCollectionUi(cid) : undefined), [cid]);

  const [index, setIndex] = useState(0);
  const [pickedId, setPickedId] = useState<number | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [good, setGood] = useState(0);

  if (!data || data.questions.length === 0) {
    return (
      <div class="flex min-h-dvh flex-col">
        <AppHeader />
        <main class="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <p class="text-lg font-medium text-base-content">Collection introuvable</p>
          <Button variant="flow" onClick={() => route("/")}>
            Retour à l’accueil
          </Button>
        </main>
        <AppFooter />
      </div>
    );
  }

  const q = data.questions[index];
  const total = data.questions.length;
  const progressValue = pickedId != null ? index + 1 : index;
  const correct = pickedId != null && isCorrectAnswer(pickedId);
  const bonneReponseLabel = q.reponses.find((r) => r.bonne_reponse)?.reponse;

  const handlePick = (reponseId: number) => {
    if (pickedId != null) return;
    setPickedId(reponseId);
    setFeedbackOpen(true);
  };

  const handleNext = () => {
    const delta = pickedId != null && isCorrectAnswer(pickedId) ? 1 : 0;
    const nextGood = good + delta;

    if (index + 1 >= total) {
      saveLastQuizResult({
        collectionId: cid,
        collectionName: data.nom,
        good: nextGood,
        total,
      });
      setFeedbackOpen(false);
      route("/results");
      return;
    }

    setGood(nextGood);
    setIndex((i) => i + 1);
    setPickedId(null);
    setFeedbackOpen(false);
  };

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <main class="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <div class="mb-6 flex items-center gap-2">
          <Button variant="ghost" class="btn-sm gap-1 px-2" onClick={() => route("/")}>
            <ArrowLeft class="h-4 w-4" aria-hidden />
            Accueil
          </Button>
          <Badge tone="learn">{data.nom}</Badge>
        </div>

        <ProgressBar value={progressValue} max={total} class="mb-6" />

        <Card>
          <p class="mb-4 text-xs font-medium uppercase tracking-wide text-base-content/45">
            Question {index + 1} / {total}
          </p>
          <h2 class="mb-6 text-lg font-semibold leading-snug text-base-content sm:text-xl">{q.question}</h2>
          <div class="flex flex-col gap-2">
            {q.reponses.map((r) => (
              <AnswerOption
                key={r.id}
                label={r.reponse}
                selected={pickedId === r.id}
                disabled={pickedId != null}
                onPick={() => handlePick(r.id)}
              />
            ))}
          </div>
        </Card>
      </main>
      <AppFooter />

      <FeedbackModal
        open={feedbackOpen}
        correct={correct}
        title={correct ? "Bravo !" : "Pas tout à fait"}
        detail={
          correct ? (
            <span>Bonne réponse — continue sur ta lancée.</span>
          ) : (
            <span>
              La bonne réponse :{" "}
              <span class="font-medium text-flow">{bonneReponseLabel ?? "—"}</span>
            </span>
          )
        }
        onNext={handleNext}
      />
    </div>
  );
}
