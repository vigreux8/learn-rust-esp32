/**
 * Centralise les classes Tailwind pour `PlayModePicker`.
 */
export const PLAY_MODE_PICKER_STYLES = {
  wrapper: "grid w-full gap-3 text-left",
  optionLabelBase: "mb-1 block text-xs font-semibold uppercase tracking-wide text-base-content/45",
  checkboxLabel: "flex cursor-pointer items-center gap-2 text-sm text-base-content/80",
  radioGroup: "flex flex-col gap-1.5 text-sm text-base-content/85",
  radioLabel: "flex cursor-pointer items-center gap-2",
  helper: "text-xs text-base-content/45",
} as const;
