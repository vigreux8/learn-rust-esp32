import type { AnswerOptionStateParams } from "./AnswerOption.types";

export function getAnswerOptionState(params: AnswerOptionStateParams) {
  const isPicked = params.pickedId === params.reponseId;
  const showCorrect = params.revealed && params.isCorrectAnswer;
  const showWrongPick = params.revealed && isPicked && !params.isCorrectAnswer;
  const dimmed = params.revealed && !params.isCorrectAnswer && !isPicked;

  return { isPicked, showCorrect, showWrongPick, dimmed };
}
