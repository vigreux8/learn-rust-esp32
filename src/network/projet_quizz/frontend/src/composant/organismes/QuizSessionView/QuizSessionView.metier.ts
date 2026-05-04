import { cn } from "../../../lib/cn";
import type { QuestionUi, QuizzQuestionRow, RefQuestionScaleRow } from "../../../types/quizz";

export function isPickedCorrect(
  questions: QuestionUi[],
  qIndex: number,
  reponseId: number,
): boolean {
  const cur = questions[qIndex];
  return cur?.reponses.some((r) => r.id === reponseId && r.bonne_reponse) ?? false;
}

export function shuffleQuestionsAnswers(questions: QuestionUi[]): QuestionUi[] {
  return questions.map((question) => ({
    ...question,
    reponses: shuffleQuestionAnswers(question.reponses)
  }));
}

export function buildQuestionCopyJson(q: QuestionUi): string {
  return JSON.stringify(
    {
      question: q.question,
      commentaire: q.commentaire,
      reponses: q.reponses.map((r) => ({
        reponse: r.reponse,
        bonne_reponse: r.bonne_reponse,
      })),
    },
    null,
    2,
  );
}

function shuffleQuestionAnswers(reponses: QuestionUi["reponses"]): QuestionUi["reponses"] {
  const out = [...reponses];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

const DIFFICULTE_ORDER: Record<string, number> = {
  facile: 0,
  moyen: 1,
  difficile: 2,
};

const IMPORTANCE_ORDER_UI: Record<string, number> = {
  faible: 0,
  standard: 1,
  forte: 2,
};

/** Ordre d’affichage : facile → moyen → difficile. */
export function sortRefDifficulteForQuizSession(rows: RefQuestionScaleRow[]): RefQuestionScaleRow[] {
  return [...rows].sort(
    (a, b) =>
      (DIFFICULTE_ORDER[a.lvl.trim().toLowerCase()] ?? 99) -
      (DIFFICULTE_ORDER[b.lvl.trim().toLowerCase()] ?? 99),
  );
}

/** Ordre d’affichage : faible → standard → forte. */
export function sortRefImportanceForQuizSession(rows: RefQuestionScaleRow[]): RefQuestionScaleRow[] {
  return [...rows].sort(
    (a, b) =>
      (IMPORTANCE_ORDER_UI[a.lvl.trim().toLowerCase()] ?? 99) -
      (IMPORTANCE_ORDER_UI[b.lvl.trim().toLowerCase()] ?? 99),
  );
}

export function mergeQuizSessionQuestionFromRow(q: QuestionUi, row: QuizzQuestionRow): QuestionUi {
  return {
    ...q,
    verifier: row.verifier,
    question: row.question,
    commentaire: row.commentaire,
    categorie_id: row.categorie_id,
    categorie_type: row.categorie_type,
    categorie_e_id: row.categorie_e_id,
    categorie_e_type: row.categorie_e_type,
    importance_id: row.importance_id,
    importance_lvl: row.importance_lvl,
    difficulter_id: row.difficulter_id,
    difficulter_lvl: row.difficulter_lvl,
  };
}

/** État inactif : neutre, aligné sur le fond de l’app (pas de couleur sémantique). */
const QUIZ_SESSION_SCALE_CHIP_OFF =
  "border-base-content/12 bg-base-200/50 text-base-content/60 hover:border-base-content/22 hover:bg-base-200/65";

export function quizSessionDifficulteChipClass(lvl: string, active: boolean): string {
  const key = lvl.trim().toLowerCase();
  const base =
    "btn btn-xs min-h-9 w-full rounded-lg border-2 text-left text-xs font-semibold normal-case transition-all duration-200";
  if (!active) {
    return cn(base, QUIZ_SESSION_SCALE_CHIP_OFF);
  }
  const on: Record<string, string> = {
    /** Facile : bleu flow très délavé */
    facile: "border-flow/28 bg-flow/[0.11] text-flow shadow-sm",
    /** Moyen : bleu intermédiaire */
    moyen: "border-flow/50 bg-flow/22 text-flow shadow-sm",
    /** Difficile : bleu marque (flow) */
    difficile:
      "border-flow bg-flow text-white shadow-md shadow-flow/25 hover:brightness-110",
  };
  return cn(base, on[key] ?? "border-flow/45 bg-flow/18 text-flow");
}

export function quizSessionImportanceChipClass(lvl: string, active: boolean): string {
  const key = lvl.trim().toLowerCase();
  const base =
    "btn btn-xs min-h-9 w-full rounded-lg border-2 text-left text-xs font-semibold normal-case transition-all duration-200";
  if (!active) {
    return cn(base, QUIZ_SESSION_SCALE_CHIP_OFF);
  }
  const on: Record<string, string> = {
    /** Faible : comme facile — bleu délavé */
    faible: "border-flow/28 bg-flow/[0.11] text-flow shadow-sm",
    /** Standard : bleu intermédiaire */
    standard: "border-flow/50 bg-flow/22 text-flow shadow-sm",
    /** Forte : bleu marque (flow), comme difficile */
    forte:
      "border-flow bg-flow text-white shadow-md shadow-flow/25 hover:brightness-110",
  };
  return cn(base, on[key] ?? "border-flow/45 bg-flow/18 text-flow");
}

export function formatRefLvlLabel(lvl: string): string {
  const t = lvl.trim();
  if (t.length === 0) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
