import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { CATEGORY_OPTION_ID, type LlmImportOption } from "../../../../ui/atomes/QuestionsLlmImportOptionsPanel";
import { normalizeAndValidateImportText } from "../../../../../lib/llmImportNormalize";
import { normalizeLlmImportCategorie } from "../../../../../lib/questionCategories";
import {
  buildReflexionLlmPrompt,
  getOptionStringValue,
  LLM_QUESTION_COUNT_OPTIONS,
  REFLEXION_LLM_INCLUDE_POOL_ID,
  REFLEXION_LLM_QUESTION_COUNT_ID,
  REFLEXION_LLM_SUBJECT_ID,
} from "./CollectionReflexionLlmImportWidget.metier";
import type { CollectionReflexionLlmImportWidgetProps } from "./CollectionReflexionLlmImportWidget.types";

function initialOptions(): LlmImportOption[] {
  return [
    {
      id: REFLEXION_LLM_QUESTION_COUNT_ID,
      titre: "Nombre de questions à générer",
      type: "liste_selection",
      liste_choix: [...LLM_QUESTION_COUNT_OPTIONS.map(String)],
      value: "5",
    },
    {
      id: REFLEXION_LLM_SUBJECT_ID,
      titre: "Sujet / orientation",
      type: "texte",
      contenus: "Ex. enchaînement pédagogique, prérequis…",
      multiline: true,
      value: "",
    },
    {
      id: REFLEXION_LLM_INCLUDE_POOL_ID,
      titre: "Inclure les intitulés déjà dans la collection (éviter les doublons)",
      type: "case_a_cocher",
      description: "Ajoute la liste des questions déjà présentes au prompt.",
      value: false,
    },
  ];
}

export function useCollectionReflexionLlmImportWidget(props: CollectionReflexionLlmImportWidgetProps) {
  const { data, actions } = props;
  const { collectionId, collectionNom, poolQuestions, disabled } = data;

  const [panelOpen, setPanelOpen] = useState(false);
  const [options, setOptions] = useState<LlmImportOption[]>(() => initialOptions());
  const optionsRef = useRef<LlmImportOption[]>(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    setOptions(initialOptions());
    setPanelOpen(false);
  }, [collectionId]);

  const prompt = useMemo(() => {
    const count = getOptionStringValue(options, REFLEXION_LLM_QUESTION_COUNT_ID) || "5";
    const subject = getOptionStringValue(options, REFLEXION_LLM_SUBJECT_ID);
    const catRaw = getOptionStringValue(options, CATEGORY_OPTION_ID);
    const categoryKey = normalizeLlmImportCategorie(catRaw || "histoire");
    const includeOpt = options.find((o) => o.id === REFLEXION_LLM_INCLUDE_POOL_ID);
    const includePool = includeOpt?.type === "case_a_cocher" && includeOpt.value === true;

    return buildReflexionLlmPrompt({
      questionCount: count,
      categoryKey,
      subject,
      includePoolStems: includePool,
      collectionNom,
      poolQuestions,
    });
  }, [options, collectionNom, poolQuestions]);

  const importFromJson = useCallback(
    async (importText: string): Promise<string> => {
      const dataJson = normalizeAndValidateImportText(importText);
      const opts = optionsRef.current;
      const categorieKey = normalizeLlmImportCategorie(getOptionStringValue(opts, CATEGORY_OPTION_ID) || "histoire");
      const n = dataJson.questions_sans_collection.length;
      actions.onImportLocalPayload(dataJson, categorieKey);
      return `${n} question(s) ajoutée(s) dans « Questions brouillon » (local). Aucune écriture en base ; dépose-les dans la suite puis enlève les brouillons avant « Enregistrer la suite ».`;
    },
    [actions.onImportLocalPayload],
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
