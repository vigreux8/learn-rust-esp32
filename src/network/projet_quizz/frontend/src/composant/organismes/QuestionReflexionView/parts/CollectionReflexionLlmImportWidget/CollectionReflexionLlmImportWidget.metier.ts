import type { LlmImportOption } from "../../../../atomes/QuestionsLlmImportOptionsPanel";
import { LLM_PROMPT_COLLECTION, LLM_QUESTION_COUNT_OPTIONS } from "../../../../../lib/llmImportPrompts";
import { QUESTION_CATEGORIE_DEFINITIONS, type QuestionCategorieKey } from "../../../../../lib/questionCategories";

export function getOptionStringValue(options: LlmImportOption[], id: string): string {
  const option = options.find((entry) => entry.id === id);
  if (typeof option?.value === "string" || typeof option?.value === "number") {
    return String(option.value);
  }
  return "";
}

export const REFLEXION_LLM_QUESTION_COUNT_ID = "question_count";
export const REFLEXION_LLM_SUBJECT_ID = "subject";
export const REFLEXION_LLM_INCLUDE_POOL_ID = "include_pool";

export { LLM_QUESTION_COUNT_OPTIONS };

export type BuildReflexionLlmPromptParams = {
  questionCount: string;
  categoryKey: QuestionCategorieKey;
  subject: string;
  includePoolStems: boolean;
  collectionNom: string | null;
  poolQuestions: { question: string }[];
};

function formatStems(questions: { question: string }[]): string {
  if (questions.length === 0) return "";
  return questions
    .map((q, i) => {
      const stem = (q.question ?? "").replace(/\s+/g, " ").trim() || "(intitulé vide)";
      return `${i + 1}. ${stem}`;
    })
    .join("\n");
}

/** Prompt LLM : brouillons locaux (zone « Questions brouillon ») pour la suite logique. */
export function buildReflexionLlmPrompt(p: BuildReflexionLlmPromptParams): string {
  const catKey = p.categoryKey;
  const catBlock = `\n\n- Catégorie: ${catKey} — ${QUESTION_CATEGORIE_DEFINITIONS[catKey]}`;
  const countBlock = `\n\n- Quantité: le tableau "questions" doit contenir exactement ${p.questionCount} entrée(s).`;
  const colBlock =
    p.collectionNom != null && p.collectionNom.trim() !== ""
      ? `\n\n- Collection : ${p.collectionNom.trim()}`
      : "";
  const subjectBlock =
    p.subject.trim() !== ""
      ? `\n\n- Sujet / orientation pour les nouvelles questions :\n${p.subject.trim()}`
      : "";
  let poolBlock = "";
  if (p.includePoolStems) {
    const stems = formatStems(p.poolQuestions);
    poolBlock =
      stems.length > 0
        ? `\n\n- Questions déjà dans la collection (évite les doublons) :\n${stems}`
        : `\n\n- La collection est encore vide côté questions : tu peux couvrir le sujet librement.`;
  }
  const tail =
    `\n\n- Rappel : ces entrées servent de brouillon dans l’éditeur ; une question n’est enregistrée en base que lorsque tu la places dans la suite ordonnée (puis enregistrement de la suite).`;

  return LLM_PROMPT_COLLECTION + countBlock + colBlock + subjectBlock + catBlock + poolBlock + tail;
}
