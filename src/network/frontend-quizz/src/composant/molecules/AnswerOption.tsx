import { cn } from "../../lib/cn";

export type AnswerOptionProps = {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPick: () => void;
};

export function AnswerOption({ label, selected, disabled, onPick }: AnswerOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPick}
      class={cn(
        "w-full rounded-[var(--radius-field)] border-2 px-4 py-3 text-left text-sm font-medium transition duration-200",
        "hover:border-flow/50 hover:bg-flow/5",
        selected && "border-flow bg-flow/10 text-flow shadow-sm",
        !selected && "border-base-content/10 bg-base-200/40",
        disabled && "cursor-default opacity-60 hover:border-base-content/10 hover:bg-base-200/40",
      )}
    >
      {label}
    </button>
  );
}
