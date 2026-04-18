import type { LlmImportOption } from "../../atomes/QuestionsLlmImportOptionsPanel";
import { LLM_PROMPT_COLLECTION, LLM_QUESTION_COUNT_OPTIONS } from "../../../lib/llmImportPrompts";
import { QUESTION_CATEGORIE_DEFINITIONS } from "../../../lib/questionCategories";
import type { SousCollectionUi } from "../../../types/quizz";

export function getOptionStringValue(options: LlmImportOption[], id: string): string {
  const option = options.find((entry) => entry.id === id);
  if (typeof option?.value === "string" || typeof option?.value === "number") {
    return String(option.value);
  }
  return "";
}

export const SOUS_LLM_QUESTION_COUNT_ID = "question_count";
export const SOUS_LLM_SUBJECT_ID = "subject";
export const SOUS_LLM_INCLUDE_ASSIGNED_ID = "include_assigned";

export { LLM_QUESTION_COUNT_OPTIONS };

export type BuildSousCollectionLlmPromptParams = {
  questionCount: string;
  categoryKey: "histoire" | "pratique";
  subject: string;
  includeAssignedStems: boolean;
  collectionNom: string | null;
  selectedSous: Pick<SousCollectionUi, "nom" | "description">;
  assignedQuestions: { question: string }[];
};

function formatStemsFromAssigned(questions: { question: string }[]): string {
  if (questions.length === 0) {
    return "";
  }
  return questions
    .map((q, i) => {
      const stem = (q.question ?? "").replace(/\s+/g, " ").trim() || "(intitulé vide)";
      return `${i + 1}. ${stem}`;
    })
    .join("\n");
}

/**
 * Prompt LLM pour générer des questions rattachées à la collection et à la sous-collection sélectionnée.
 */
export function buildSousCollectionLlmPrompt(p: BuildSousCollectionLlmPromptParams): string {
  const catKey = p.categoryKey;
  const catBlock = `\n\n- Catégorie: ${catKey} — ${QUESTION_CATEGORIE_DEFINITIONS[catKey]}`;
  const countBlock = `\n\n- Quantité: le tableau "questions" doit contenir exactement ${p.questionCount} entrée(s).`;
  const sousBlock = `\n\n- Sous-collection (contexte à respecter) :\n  - Nom : ${p.selectedSous.nom}\n  - Description : ${(p.selectedSous.description ?? "").trim() || "(aucune)"}`;
  const colBlock =
    p.collectionNom != null && p.collectionNom.trim() !== ""
      ? `\n\n- Collection parente : ${p.collectionNom.trim()}`
      : "";
  const subjectBlock = p.subject.trim() !== "" ? `\n\n- Sujet / orientation pour les nouvelles questions :\n${p.subject.trim()}` : "";
  let existingBlock = "";
  if (p.includeAssignedStems) {
    const stems = formatStemsFromAssigned(p.assignedQuestions);
    existingBlock =
      stems.length > 0
        ? `\n\n- Questions déjà présentes dans cette sous-collection (évite les doublons ou reformulations trop proches ; tu peux compléter ou approfondir) :\n${stems}`
        : `\n\n- Aucune question n’est encore listée dans cette sous-collection : tu peux couvrir le sujet librement.`;
  }
  const tail = `\n\n- Rappel : les entrées seront enregistrées dans la collection active et rattachées à la sous-collection « ${p.selectedSous.nom} ».`;

  return LLM_PROMPT_COLLECTION + countBlock + sousBlock + colBlock + subjectBlock + catBlock + existingBlock + tail;
}
