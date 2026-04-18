import { cn } from "../../../lib/cn";
import { getAnswerOptionState } from "./AnswerOption.hook";
import { ANSWER_OPTION_STYLES } from "./AnswerOption.styles";
import type { AnswerOptionProps } from "./AnswerOption.types";

export function AnswerOption({
  label,
  reponseId,
  pickedId,
  revealed,
  isCorrectAnswer,
  disabled,
  onPick,
}: AnswerOptionProps) {
  const { dimmed, showCorrect, showWrongPick } = getAnswerOptionState({
    reponseId,
    pickedId,
    revealed,
    isCorrectAnswer,
  });

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPick}
      class={cn(
        ANSWER_OPTION_STYLES.base,
        !revealed && ANSWER_OPTION_STYLES.idle,
        dimmed && ANSWER_OPTION_STYLES.dimmed,
        showCorrect && ANSWER_OPTION_STYLES.correct,
        showWrongPick && ANSWER_OPTION_STYLES.wrong,
      )}
    >
      {label}
    </button>
  );
}
