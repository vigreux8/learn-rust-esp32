import type { QuestionUi } from "../types/quizz";

export type PlayOrder = "random" | "linear";

/** Filtre de type de question pour une session de jeu (API `qtype`). */
export type PlayQtype = "histoire" | "pratique" | "melanger";

export type PlaySessionQueryOpts = {
  order?: PlayOrder;
  qtype?: PlayQtype;
};

export function playOrderFromSearch(): PlayOrder {
  if (typeof window === "undefined") return "random";
  const v = new URLSearchParams(window.location.search).get("order");
  return v === "linear" ? "linear" : "random";
}

export function playQtypeFromSearch(): PlayQtype {
  if (typeof window === "undefined") return "melanger";
  const v = new URLSearchParams(window.location.search).get("qtype");
  if (v === "histoire" || v === "pratique" || v === "melanger") return v;
  return "melanger";
}

/** Query string pour `/play/...` (ordre + filtre type ; défauts sans paramètres inutiles). */
export function buildPlaySessionQuery(opts: PlaySessionQueryOpts): string {
  const p = new URLSearchParams();
  const order = opts.order ?? "random";
  if (order === "linear") p.set("order", "linear");
  const qtype = opts.qtype ?? "melanger";
  if (qtype !== "melanger") p.set("qtype", qtype);
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Suffixe query pour l’ordre seul (rétrocompatibilité). */
export function playOrderQuerySuffix(order: PlayOrder): string {
  return buildPlaySessionQuery({ order });
}

export function shuffleQuestions(questions: QuestionUi[]): QuestionUi[] {
  const copy = [...questions];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function playQtypeLabel(q: PlayQtype): string {
  if (q === "histoire") return "Histoire";
  if (q === "pratique") return "Pratique";
  return "Mélanger";
}
