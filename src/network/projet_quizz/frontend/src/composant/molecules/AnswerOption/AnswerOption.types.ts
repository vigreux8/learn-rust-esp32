export type AnswerOptionProps = {
  label: string;
  reponseId: number;
  pickedId: number | null;
  revealed: boolean;
  isCorrectAnswer: boolean;
  disabled: boolean;
  onPick: () => void;
};

export type AnswerOptionStateParams = {
  reponseId: number;
  pickedId: number | null;
  revealed: boolean;
  isCorrectAnswer: boolean;
};
