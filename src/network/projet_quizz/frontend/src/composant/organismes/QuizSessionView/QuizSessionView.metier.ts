import type { QuestionUi } from "../../../types/quizz";

export function isPickedCorrect(
  questions: QuestionUi[],
  qIndex: number,
  reponseId: number,
): boolean {
  const cur = questions[qIndex];
  return cur?.reponses.some((r) => r.id === reponseId && r.bonne_reponse) ?? false;
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
