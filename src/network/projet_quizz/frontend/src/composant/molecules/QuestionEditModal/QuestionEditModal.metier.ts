export type CreateReponseDraft = { texte: string; correcte: boolean };

export function defaultCreateReponses(): CreateReponseDraft[] {
  return [
    { texte: "", correcte: true },
    { texte: "", correcte: false },
    { texte: "", correcte: false },
    { texte: "", correcte: false },
  ];
}
