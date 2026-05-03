import type { QuestionUi } from "../../../types/quizz";

export function isPickedCorrect(
  questions: QuestionUi[],
  qIndex: number,
  reponseId: number,
): boolean {
  const cur = questions[qIndex];
  return cur?.reponses.some((r) => r.id === reponseId && r.bonne_reponse) ?? false;
}

export function shuffleQuestionsAnswers(questions: QuestionUi[]): QuestionUi[] {
  return questions.map((question) => ({
    ...question,
    reponses: shuffleQuestionAnswers(question.reponses)
  }));
}

export function buildQuestionCopyJson(q: QuestionUi): string {
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

function shuffleQuestionAnswers(reponses: QuestionUi["reponses"]): QuestionUi["reponses"] {
  const out = [...reponses];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
