/**
 * Centralise les classes Tailwind pour `PopUpInformation`.
 */
export const POPUP_INFORMATION_STYLES = {
  overlay: "fixed inset-0 z-[110] flex items-center justify-center p-4",
  backdrop: "absolute inset-0 border-0 bg-base-content/45 p-0",
  dialogBase: "relative z-10 w-full max-w-md rounded-2xl border bg-base-100 p-6 shadow-2xl",
  dialogDanger: "border-error/25 shadow-error/10",
  dialogInfo: "border-base-content/10",
} as const;
