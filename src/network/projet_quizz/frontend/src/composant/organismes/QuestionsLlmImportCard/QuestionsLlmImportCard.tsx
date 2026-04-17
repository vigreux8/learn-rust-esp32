import { Download, FileJson } from "lucide-preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { importQuestionsJson } from "../../../lib/api";
import { normalizeAndValidateImportText } from "../../../lib/llmImportNormalize";
import { downloadCollectionAsAppJson } from "../../../lib/collectionAppJson";
import {
  LLM_PROMPT_BASE,
  LLM_PROMPT_COLLECTION,
  LLM_QUESTION_COUNT_OPTIONS,
  formatExistingQuestionStemsForPrompt,
} from "../../../lib/llmImportPrompts";
import { QUESTION_CATEGORIE_DEFINITIONS } from "../../../lib/questionCategories";
import type { CollectionUi, QuizzModuleRow, QuizzQuestionRow } from "../../../types/quizz";
import { Button } from "../../atomes/Button/Button";
import { CATEGORY_OPTION_ID, type LlmImportOption } from "../../molecules/QuestionsLlmImportOptionsPanel/QuestionsLlmImportOptionsPanel";
import { QuestionsLlmImportPanel } from "../../molecules/QuestionsLlmImportPanel/QuestionsLlmImportPanel";
import { QUESTIONS_LLM_IMPORT_CARD_STYLES } from "./QuestionsLlmImportCard.styles";

export type QuestionsLlmImportCardProps = {
  targetCollectionNumeric: number | null;
  collections: CollectionUi[];
  allModules: QuizzModuleRow[];
  importTargetModuleId: number | null;
  questions: QuizzQuestionRow[];
  onImportSuccess: () => void;
};

const QUESTION_COUNT_OPTION_ID = "question_count";
const COLLECTION_NAME_OPTION_ID = "collection_name";
const SUBJECT_OPTION_ID = "subject";
const EXISTING_STEMS_OPTION_ID = "existing_stems";

function getOptionValue(options: LlmImportOption[], id: string): string {
  const option = options.find((entry) => entry.id === id);
  return typeof option?.value === "string" || typeof option?.value === "number" ? String(option.value) : "";
}

export function QuestionsLlmImportCard({
  targetCollectionNumeric,
  collections,
  allModules,
  importTargetModuleId,
  questions,
  onImportSuccess,
}: QuestionsLlmImportCardProps) {
  const [importOpen, setImportOpen] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [options, setOptions] = useState<LlmImportOption[]>([]);
  const importLlmLastSyncedCollectionId = useRef<number | null>(null);
  const optionsRef = useRef<LlmImportOption[]>([]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const currentCollectionName = getOptionValue(options, COLLECTION_NAME_OPTION_ID);
    const currentSubject = getOptionValue(options, SUBJECT_OPTION_ID);
    const currentQuestionCount = getOptionValue(options, QUESTION_COUNT_OPTION_ID);
    const previousExistingValue = options.find((entry) => entry.id === EXISTING_STEMS_OPTION_ID)?.value;
    const col = targetCollectionNumeric != null ? collections.find((entry) => entry.id === targetCollectionNumeric) : null;
    const switched = importLlmLastSyncedCollectionId.current !== targetCollectionNumeric;
    if (targetCollectionNumeric == null) importLlmLastSyncedCollectionId.current = null;
    else if (switched) importLlmLastSyncedCollectionId.current = targetCollectionNumeric;

    setOptions([
      { id: QUESTION_COUNT_OPTION_ID, titre: "Nombre de questions", type: "liste_selection", liste_choix: LLM_QUESTION_COUNT_OPTIONS.map(String), value: currentQuestionCount || "5" },
      {
        id: COLLECTION_NAME_OPTION_ID,
        titre: "Nom de la collection",
        type: "texte",
        contenus: targetCollectionNumeric != null ? "Prerempli depuis la collection" : "Ex. Ma thematique",
        value: switched && targetCollectionNumeric != null ? (col?.nom ?? "") : currentCollectionName || (targetCollectionNumeric != null ? (col?.nom ?? "") : ""),
      },
      { id: SUBJECT_OPTION_ID, titre: "Sujet des questions", type: "texte", contenus: "Ex. verbes irreguliers...", multiline: true, value: currentSubject },
      {
        id: EXISTING_STEMS_OPTION_ID,
        titre: "Eviter les repetitions",
        type: "case_a_cocher",
        description: targetCollectionNumeric == null ? "Disponible lorsque tu filtres sur une collection." : "Lister les intitules deja en base.",
        disabled: targetCollectionNumeric == null,
        value: targetCollectionNumeric == null ? false : (previousExistingValue ?? false),
        function: () => {
          const selectedCategory = getOptionValue(optionsRef.current, CATEGORY_OPTION_ID) || "histoire";
          const filteredQuestions = questions.filter((q) => q.categorie_type === selectedCategory);
          return filteredQuestions.length > 0 ? formatExistingQuestionStemsForPrompt(filteredQuestions) : "";
        },
      },
    ]);
  }, [targetCollectionNumeric, collections, questions]);

  const buildPrompt = useMemo(
    () => (currentOptions: LlmImportOption[]) => {
      const questionCount = getOptionValue(currentOptions, QUESTION_COUNT_OPTION_ID) || "5";
      const category = getOptionValue(currentOptions, CATEGORY_OPTION_ID) || "histoire";
      const collectionName = getOptionValue(currentOptions, COLLECTION_NAME_OPTION_ID).trim();
      const subject = getOptionValue(currentOptions, SUBJECT_OPTION_ID).trim();
      const existingStems = getOptionValue(currentOptions, EXISTING_STEMS_OPTION_ID).trim();
      const catKey = category === "pratique" ? "pratique" : "histoire";
      const countBlock = targetCollectionNumeric != null ? `\n\n- Quantite: "questions" doit contenir exactement ${questionCount}.` : `\n\n- Quantite: JSON doit representer exactement ${questionCount} questions au total.`;
      const nameBlock = collectionName.length > 0 ? `\n\n- Nom de collection: ${collectionName}` : "";
      const subjectBlock = subject.length > 0 ? `\n\n- Sujet:\n${subject}` : "";
      const categorieBlock = `\n\n- Categorie: ${catKey} - ${QUESTION_CATEGORIE_DEFINITIONS[catKey]}`;
      const existingBlock = targetCollectionNumeric != null && existingStems.length > 0 ? `\n\n- Eviter doublons:\n${existingStems}` : "";
      if (targetCollectionNumeric == null) return LLM_PROMPT_BASE + countBlock + nameBlock + subjectBlock + categorieBlock;
      const col = collections.find((entry) => entry.id === targetCollectionNumeric);
      const nom = col?.nom ?? `id ${targetCollectionNumeric}`;
      const mod = importTargetModuleId != null ? allModules.find((entry) => entry.id === importTargetModuleId) : undefined;
      let tail = `\n\n- Collection active: ${nom} (${targetCollectionNumeric}).`;
      if (mod) tail += `\n- Lien supercollection: ${mod.nom} (${mod.id}).`;
      return LLM_PROMPT_COLLECTION + countBlock + nameBlock + subjectBlock + categorieBlock + existingBlock + tail;
    },
    [targetCollectionNumeric, collections, importTargetModuleId, allModules],
  );

  const llmImportWorkflow = useMemo(
    () => ({
      buildPrompt,
      importFromJson: async (importText: string): Promise<string> => {
        const data = normalizeAndValidateImportText(importText);
        const cid = targetCollectionNumeric ?? undefined;
        const mid = cid != null && importTargetModuleId != null ? importTargetModuleId : undefined;
        const categorieApi = getOptionValue(options, CATEGORY_OPTION_ID) === "pratique" ? "pratique" : "histoire";
        const res = await importQuestionsJson(data, { collectionId: cid, moduleId: mid, categorie: categorieApi });
        onImportSuccess();
        if (cid != null) return `Import reussi: ${res.createdQuestions} question(s) creee(s).`;
        return res.createdCollections > 0 ? `Import reussi: ${res.createdQuestions} question(s), ${res.createdCollections} collection(s).` : `Import reussi: ${res.createdQuestions} question(s).`;
      },
    }),
    [buildPrompt, options, targetCollectionNumeric, importTargetModuleId, onImportSuccess],
  );

  const handleExportCollectionJson = () => {
    if (targetCollectionNumeric == null) return;
    setExportBusy(true);
    setExportError(null);
    try {
      const col = collections.find((entry) => entry.id === targetCollectionNumeric);
      if (!col) throw new Error("Collection introuvable dans la liste chargee.");
      downloadCollectionAsAppJson(col);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export JSON impossible.");
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <>
      <div class={QUESTIONS_LLM_IMPORT_CARD_STYLES.header}>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Questions</h1>
          <p class="mt-1 text-sm text-base-content/60">Modifier ou supprimer via l API backend (Prisma / SQLite).</p>
        </div>
        <div class="flex flex-col gap-2 self-start sm:flex-row sm:items-center sm:self-auto">
          <Button variant="outline" class="gap-2" disabled={exportBusy || targetCollectionNumeric == null} onClick={() => handleExportCollectionJson()}>
            <Download class="h-4 w-4" aria-hidden />
            {exportBusy ? "Export..." : "Export JSON"}
          </Button>
          <Button variant="learn" class="gap-2" onClick={() => setImportOpen((o) => !o)}>
            <FileJson class="h-4 w-4" aria-hidden />
            Import LLM
          </Button>
        </div>
      </div>
      {exportError ? <p class="mb-3 text-xs text-error">{exportError}</p> : null}
      {importOpen ? <QuestionsLlmImportPanel options={options} setOptions={setOptions} llmImportWorkflow={llmImportWorkflow} /> : null}
    </>
  );
}
