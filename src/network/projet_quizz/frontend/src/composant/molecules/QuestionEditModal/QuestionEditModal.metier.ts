import type { CreateReponseDraft } from "./QuestionEditModal.types";

export function defaultCreateReponses(): CreateReponseDraft[] {
  return [
    { texte: "", correcte: true },
    { texte: "", correcte: false },
    { texte: "", correcte: false },
    { texte: "", correcte: false },
  ];
}
