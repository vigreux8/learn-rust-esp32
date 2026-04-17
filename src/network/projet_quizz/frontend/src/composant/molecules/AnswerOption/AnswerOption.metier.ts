export function getAnswerOptionState(params: {
  reponseId: number;
  pickedId: number | null;
  revealed: boolean;
  isCorrectAnswer: boolean;
}) {
  const isPicked = params.pickedId === params.reponseId;
  const showCorrect = params.revealed && params.isCorrectAnswer;
  const showWrongPick = params.revealed && isPicked && !params.isCorrectAnswer;
  const dimmed = params.revealed && !params.isCorrectAnswer && !isPicked;

  return { isPicked, showCorrect, showWrongPick, dimmed };
}
