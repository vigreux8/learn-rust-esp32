import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { CATEGORY_OPTION_ID, type LlmImportOption } from "../../atomes/QuestionsLlmImportOptionsPanel";
import { importQuestionsJson } from "../../../lib/api";
import { normalizeAndValidateImportText } from "../../../lib/llmImportNormalize";
import {
  buildSousCollectionLlmPrompt,
  getOptionStringValue,
  LLM_QUESTION_COUNT_OPTIONS,
  SOUS_LLM_INCLUDE_ASSIGNED_ID,
  SOUS_LLM_QUESTION_COUNT_ID,
  SOUS_LLM_SUBJECT_ID,
} from "./SousCollectionLlmImportWidget.metier";
import type { SousCollectionLlmImportWidgetProps } from "./SousCollectionLlmImportWidget.types";

function initialSousLlmOptions(): LlmImportOption[] {
  return [
    {
      id: SOUS_LLM_QUESTION_COUNT_ID,
      titre: "Nombre de questions à générer",
      type: "liste_selection",
      liste_choix: [...LLM_QUESTION_COUNT_OPTIONS.map(String)],
      value: "5",
    },
    {
      id: SOUS_LLM_SUBJECT_ID,
      titre: "Sujet / orientation",
      type: "texte",
      contenus: "Ex. temps composés, vocabulaire médical…",
      multiline: true,
      value: "",
    },
    {
      id: SOUS_LLM_INCLUDE_ASSIGNED_ID,
      titre: "Inclure les questions déjà dans cette sous-collection",
      type: "case_a_cocher",
      description:
        "Si coché, les intitulés des questions déjà rattachées sont ajoutés au prompt pour limiter les doublons.",
      value: false,
    },
  ];
}

export function useSousCollectionLlmImportWidget(props: SousCollectionLlmImportWidgetProps) {
  const { data, actions } = props;
  const { collectionId, sousCollectionId, collectionNom, selectedSous, assignedQuestions, disabled } = data;

  const [panelOpen, setPanelOpen] = useState(false);
  const [options, setOptions] = useState<LlmImportOption[]>(() => initialSousLlmOptions());
  const optionsRef = useRef<LlmImportOption[]>(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    setOptions(initialSousLlmOptions());
    setPanelOpen(false);
  }, [selectedSous.id]);

  const prompt = useMemo(() => {
    const count = getOptionStringValue(options, SOUS_LLM_QUESTION_COUNT_ID) || "5";
    const subject = getOptionStringValue(options, SOUS_LLM_SUBJECT_ID);
    const catRaw = getOptionStringValue(options, CATEGORY_OPTION_ID);
    const categoryKey = catRaw === "pratique" ? "pratique" : "histoire";
    const includeOpt = options.find((o) => o.id === SOUS_LLM_INCLUDE_ASSIGNED_ID);
    const includeAssigned = includeOpt?.type === "case_a_cocher" && includeOpt.value === true;

    return buildSousCollectionLlmPrompt({
      questionCount: count,
      categoryKey,
      subject,
      includeAssignedStems: includeAssigned,
      collectionNom,
      selectedSous: { nom: selectedSous.nom, description: selectedSous.description },
      assignedQuestions,
    });
  }, [options, collectionNom, selectedSous.nom, selectedSous.description, assignedQuestions]);

  const importFromJson = useCallback(
    async (importText: string): Promise<string> => {
      const dataJson = normalizeAndValidateImportText(importText);
      const opts = optionsRef.current;
      const categorie = getOptionStringValue(opts, CATEGORY_OPTION_ID) === "pratique" ? "pratique" : "histoire";
      const res = await importQuestionsJson(dataJson, {
        collectionId,
        sousCollectionId,
        categorie,
      });
      actions.onImportSuccess();
      return `Import réussi : ${res.createdQuestions} question(s) créée(s).`;
    },
    [actions, collectionId, sousCollectionId],
  );

  const togglePanel = useCallback(() => {
    if (!disabled) {
      setPanelOpen((o) => !o);
    }
  }, [disabled]);

  return {
    state: {
      panelOpen,
      options,
      prompt,
      disabled,
    },
    actions: {
      setOptions,
      togglePanel,
      importFromJson,
    },
  };
}
