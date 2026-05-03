import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { importQuestionsJson } from "../../../lib/api";
import { normalizeAndValidateImportText } from "../../../lib/llmImportNormalize";
import {
  LLM_QUESTION_COUNT_OPTIONS,
  formatExistingQuestionStemsForPrompt,
} from "../../../lib/llmImportPrompts";
import { CATEGORY_OPTION_ID, type LlmImportOption } from "../../atomes/QuestionsLlmImportOptionsPanel";
import type { LlmImportWorkflow } from "../../molecules/QuestionsLlmImportPanel";
import {
  COLLECTION_NAME_OPTION_ID,
  EXISTING_STEMS_OPTION_ID,
  QUESTION_COUNT_OPTION_ID,
  SUBJECT_OPTION_ID,
  buildImportSuccessMessage,
  buildLlmImportPrompt,
} from "./QuestionsActionBoutons.metier";
import type { QuestionsActionBoutonsProps } from "./QuestionsActionBoutons.types";
import { getOptionValue } from "./QuestionsActionBoutons.utils";

export function useQuestionsActionBoutons(props: QuestionsActionBoutonsProps) {
  const { data, actions, llmImportExtras } = props;
  const { targetCollectionNumeric, collections, allModules, importTargetModuleId, questions } = data;

  const [importOpen, setImportOpen] = useState(false);
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
      {
        id: QUESTION_COUNT_OPTION_ID,
        titre: "Nombre de questions",
        type: "liste_selection",
        liste_choix: LLM_QUESTION_COUNT_OPTIONS.map(String),
        value: currentQuestionCount || "5",
      },
      {
        id: COLLECTION_NAME_OPTION_ID,
        titre: "Nom de la collection",
        type: "texte",
        contenus: targetCollectionNumeric != null ? "Prerempli depuis la collection" : "Ex. Ma thematique",
        value:
          switched && targetCollectionNumeric != null
            ? (col?.nom ?? "")
            : currentCollectionName || (targetCollectionNumeric != null ? (col?.nom ?? "") : ""),
      },
      {
        id: SUBJECT_OPTION_ID,
        titre: "Sujet des questions",
        type: "texte",
        contenus: "Ex. verbes irreguliers...",
        multiline: true,
        value: currentSubject,
      },
      {
        id: EXISTING_STEMS_OPTION_ID,
        titre: "Eviter les repetitions",
        type: "case_a_cocher",
        description:
          targetCollectionNumeric == null
            ? "Disponible lorsque tu filtres sur une collection."
            : "Lister les intitules deja en base.",
        disabled: targetCollectionNumeric == null,
        value: targetCollectionNumeric == null ? false : (previousExistingValue ?? false),
        action: () => {
          const selectedCategory = getOptionValue(optionsRef.current, CATEGORY_OPTION_ID) || "histoire";
          const filteredQuestions = questions.filter((q) => q.categorie_type === selectedCategory);
          return filteredQuestions.length > 0 ? formatExistingQuestionStemsForPrompt(filteredQuestions) : "";
        },
      },
    ]);
  }, [targetCollectionNumeric, collections, questions]);

  const buildPrompt = useMemo(
    () => (currentOptions: LlmImportOption[]) =>
      buildLlmImportPrompt({
        questionCount: getOptionValue(currentOptions, QUESTION_COUNT_OPTION_ID) || "5",
        category: getOptionValue(currentOptions, CATEGORY_OPTION_ID) || "histoire",
        collectionName: getOptionValue(currentOptions, COLLECTION_NAME_OPTION_ID).trim(),
        subject: getOptionValue(currentOptions, SUBJECT_OPTION_ID).trim(),
        existingStems: getOptionValue(currentOptions, EXISTING_STEMS_OPTION_ID).trim(),
        targetCollectionNumeric,
        collections,
        importTargetModuleId,
        allModules,
      }),
    [targetCollectionNumeric, collections, importTargetModuleId, allModules],
  );

  const llmImportWorkflow = useMemo<LlmImportWorkflow>(
    () => ({
      buildPrompt,
      importFromJson: async (importText: string): Promise<string> => {
        const dataJson = normalizeAndValidateImportText(importText);
        const cid = targetCollectionNumeric ?? undefined;
        const mid = cid != null && importTargetModuleId != null ? importTargetModuleId : undefined;
        const categorieApi = getOptionValue(options, CATEGORY_OPTION_ID) === "pratique" ? "pratique" : "histoire";
        const sousId = llmImportExtras?.sousCollectionId;
        const res = await importQuestionsJson(dataJson, {
          collectionId: cid,
          moduleId: mid,
          categorie: categorieApi,
          ...(sousId != null ? { sousCollectionId: sousId } : {}),
        });
        actions.onImportSuccess();
        return buildImportSuccessMessage(res, cid != null);
      },
    }),
    [buildPrompt, options, targetCollectionNumeric, importTargetModuleId, actions, llmImportExtras],
  );

  const toggleImport = () => setImportOpen((o) => !o);

  return {
    state: {
      importOpen,
      options,
      llmImportWorkflow,
    },
    actions: {
      setOptions,
      toggleImport,
    },
  };
}
