import { useMemo, useState } from "preact/hooks";
import { route } from "preact-router";
import { ArrowLeft } from "lucide-preact";
import { buildRandomQuizOrder, getCollectionUi, isCorrectAnswer, type QuestionUi } from "../../mocks";
import { saveLastQuizResult } from "../../lib/lastQuizResult";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { Card } from "../atomes/Card";
import { Button } from "../atomes/Button";
import { ProgressBar } from "../atomes/ProgressBar";
import { Badge } from "../atomes/Badge";
import { AnswerOption } from "../molecules/AnswerOption";

export type QuizSessionViewProps = {
  collectionId?: string;
};

type SessionData = {
  mode: "collection" | "random";
  collectionId: number | null;
  nom: string;
  questions: QuestionUi[];
};

function useSessionData(collectionId: string | undefined): SessionData | undefined {
  return useMemo(() => {
    if (collectionId === "random") {
      return {
        mode: "random",
        collectionId: null,
        nom: "Mélange aléatoire",
        questions: buildRandomQuizOrder(),
      };
    }
    const cid = Number(collectionId);
    if (!Number.isFinite(cid)) return undefined;
    const col = getCollectionUi(cid);
    if (!col || col.questions.length === 0) return undefined;
    return {
      mode: "collection",
      collectionId: cid,
      nom: col.nom,
      questions: col.questions,
    };
  }, [collectionId]);
}

export function QuizSessionView({ collectionId }: QuizSessionViewProps) {
  const data = useSessionData(collectionId);

  const [index, setIndex] = useState(0);
  const [pickedId, setPickedId] = useState<number | null>(null);
  const [good, setGood] = useState(0);

  if (!data) {
    return (
      <div class="flex min-h-dvh flex-col">
        <AppHeader />
        <main class="fl-page-enter mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <p class="text-lg font-medium text-base-content">Parcours introuvable</p>
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
  const correct = revealed && isCorrectAnswer(pickedId);
  const bonneReponseLabel = q.reponses.find((r) => r.bonne_reponse)?.reponse;

  const handlePick = (reponseId: number) => {
    if (pickedId != null) return;
    setPickedId(reponseId);
  };

  const handleNext = () => {
    const delta = pickedId != null && isCorrectAnswer(pickedId) ? 1 : 0;
    const nextGood = good + delta;

    if (index + 1 >= total) {
      saveLastQuizResult({
        mode: data.mode,
        collectionId: data.collectionId,
        collectionName: data.nom,
        good: nextGood,
        total,
      });
      route("/results");
      return;
    }

    setGood(nextGood);
    setIndex((i) => i + 1);
    setPickedId(null);
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
          <Badge tone={data.mode === "random" ? "flow" : "learn"}>{data.nom}</Badge>
        </div>

        <ProgressBar value={progressValue} max={total} class="mb-6" />

        <Card class="transition duration-300">
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
                {correct ? (
                  <>
                    Bien vu — <span class="font-semibold text-flow">c’est la bonne réponse</span>.
                  </>
                ) : (
                  <>
                    Ce n’était pas la bonne proposition. La réponse attendue :{" "}
                    <span class="font-semibold text-flow">{bonneReponseLabel ?? "—"}</span>.
                  </>
                )}
              </p>
              <div class="flex justify-center">
                <Button variant="flow" class="min-w-[11rem] px-8" onClick={handleNext}>
                  {index >= total - 1 ? "Voir le résultat" : "Suivant"}
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
