import type { AnswerOptionStateParams } from "./AnswerOption.types";

/**
 * Dérive l’état visuel d’une option de réponse (sélection, bonne / mauvaise, atténuation) à partir du jeu courant.
 */
export function getAnswerOptionState(params: AnswerOptionStateParams) {
  const isPicked = params.pickedId === params.reponseId;
  const showCorrect = params.revealed && params.isCorrectAnswer;
  const showWrongPick = params.revealed && isPicked && !params.isCorrectAnswer;
  const dimmed = params.revealed && !params.isCorrectAnswer && !isPicked;

  return { isPicked, showCorrect, showWrongPick, dimmed };
}
