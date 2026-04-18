import { LLM_PROMPT_BASE, LLM_PROMPT_COLLECTION } from "../../../lib/llmImportPrompts";
import { QUESTION_CATEGORIE_DEFINITIONS } from "../../../lib/questionCategories";
import type { CollectionUi, QuizzModuleRow } from "../../../types/quizz";

type PromptBuildingBlocks = {
  countBlock: string;
  nameBlock: string;
  subjectBlock: string;
  categorieBlock: string;
  existingBlock: string;
};

export const QUESTION_COUNT_OPTION_ID = "question_count";
export const COLLECTION_NAME_OPTION_ID = "collection_name";
export const SUBJECT_OPTION_ID = "subject";
export const EXISTING_STEMS_OPTION_ID = "existing_stems";

export type BuildPromptParams = {
  questionCount: string;
  category: string;
  collectionName: string;
  subject: string;
  existingStems: string;
  targetCollectionNumeric: number | null;
  collections: CollectionUi[];
  importTargetModuleId: number | null;
  allModules: QuizzModuleRow[];
};

export function buildLlmImportPrompt(params: BuildPromptParams): string {
  const {
    questionCount,
    category,
    collectionName,
    subject,
    existingStems,
    targetCollectionNumeric,
    collections,
    importTargetModuleId,
    allModules,
  } = params;

  const catKey = category === "pratique" ? "pratique" : "histoire";

  const blocks: PromptBuildingBlocks = {
    countBlock:
      targetCollectionNumeric != null
        ? `\n\n- Quantite: "questions" doit contenir exactement ${questionCount}.`
        : `\n\n- Quantite: JSON doit representer exactement ${questionCount} questions au total.`,
    nameBlock: collectionName.length > 0 ? `\n\n- Nom de collection: ${collectionName}` : "",
    subjectBlock: subject.length > 0 ? `\n\n- Sujet:\n${subject}` : "",
    categorieBlock: `\n\n- Categorie: ${catKey} - ${QUESTION_CATEGORIE_DEFINITIONS[catKey]}`,
    existingBlock:
      targetCollectionNumeric != null && existingStems.length > 0
        ? `\n\n- Eviter doublons:\n${existingStems}`
        : "",
  };

  if (targetCollectionNumeric == null) {
    return (
      LLM_PROMPT_BASE + blocks.countBlock + blocks.nameBlock + blocks.subjectBlock + blocks.categorieBlock
    );
  }

  const col = collections.find((entry) => entry.id === targetCollectionNumeric);
  const nom = col?.nom ?? `id ${targetCollectionNumeric}`;
  const mod = importTargetModuleId != null ? allModules.find((entry) => entry.id === importTargetModuleId) : undefined;

  let tail = `\n\n- Collection active: ${nom} (${targetCollectionNumeric}).`;
  if (mod) tail += `\n- Lien supercollection: ${mod.nom} (${mod.id}).`;

  return (
    LLM_PROMPT_COLLECTION +
    blocks.countBlock +
    blocks.nameBlock +
    blocks.subjectBlock +
    blocks.categorieBlock +
    blocks.existingBlock +
    tail
  );
}

export function buildImportSuccessMessage(result: { createdQuestions: number; createdCollections: number }, hasTargetCollection: boolean): string {
  if (hasTargetCollection) return `Import reussi: ${result.createdQuestions} question(s) creee(s).`;
  if (result.createdCollections > 0) {
    return `Import reussi: ${result.createdQuestions} question(s), ${result.createdCollections} collection(s).`;
  }
  return `Import reussi: ${result.createdQuestions} question(s).`;
}
