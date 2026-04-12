import type { QuestionUi } from "../types/quizz";

export type PlayOrder = "random" | "linear";

export function playOrderFromSearch(): PlayOrder {
  if (typeof window === "undefined") return "random";
  const v = new URLSearchParams(window.location.search).get("order");
  return v === "linear" ? "linear" : "random";
}

/** Suffixe query pour la navigation (défaut aléatoire = pas de paramètre). */
export function playOrderQuerySuffix(order: PlayOrder): string {
  return order === "linear" ? "?order=linear" : "";
}

export function shuffleQuestions(questions: QuestionUi[]): QuestionUi[] {
  const copy = [...questions];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
