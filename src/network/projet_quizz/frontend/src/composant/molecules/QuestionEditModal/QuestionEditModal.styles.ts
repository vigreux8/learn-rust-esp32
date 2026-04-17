/**
 * Centralise les classes Tailwind principales pour `QuestionEditModal`.
 */
export const QUESTION_EDIT_MODAL_STYLES = {
  overlay: "fixed inset-0 z-100 flex items-center justify-center p-4",
  backdrop: "absolute inset-0 border-0 bg-base-content/40 p-0",
  dialog: "relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-base-content/10 bg-base-100 p-6 shadow-2xl",
} as const;
