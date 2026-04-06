import { cn } from "../../lib/cn";

export type AnswerOptionProps = {
  label: string;
  reponseId: number;
  pickedId: number | null;
  revealed: boolean;
  isCorrectAnswer: boolean;
  disabled: boolean;
  onPick: () => void;
};

export function AnswerOption({
  label,
  reponseId,
  pickedId,
  revealed,
  isCorrectAnswer,
  disabled,
  onPick,
}: AnswerOptionProps) {
  const isPicked = pickedId === reponseId;
  const showCorrect = revealed && isCorrectAnswer;
  const showWrongPick = revealed && isPicked && !isCorrectAnswer;
  const dimmed = revealed && !isCorrectAnswer && !isPicked;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPick}
      class={cn(
        "w-full rounded-full border-2 px-5 py-3.5 text-left text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        !revealed && "border-base-content/10 bg-base-200/45 hover:border-flow/40 hover:bg-flow/[0.07] hover:scale-[1.02]",
        dimmed && "scale-[0.98] border-transparent bg-base-200/25 opacity-50",
        showCorrect && "border-flow/45 bg-flow/12 text-base-content shadow-md shadow-flow/10 ring-2 ring-flow/20",
        showWrongPick && "border-learn/40 bg-learn/10 text-base-content ring-2 ring-learn/15",
      )}
    >
      {label}
    </button>
  );
}
