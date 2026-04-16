import { FileJson } from "lucide-preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { importQuestionsJson } from "../../lib/api";
import {
  LLM_PROMPT_BASE,
  LLM_PROMPT_COLLECTION,
  LLM_QUESTION_COUNT_OPTIONS,
  formatExistingQuestionStemsForPrompt,
} from "../../lib/llmImportPrompts";
import { QUESTION_CATEGORIE_DEFINITIONS } from "../../lib/questionCategories";
import type {
  CollectionUi,
  QuizzModuleRow,
  QuizzQuestionRow,
} from "../../types/quizz";
import { Button } from "../atomes/Button";
import {
  CATEGORY_OPTION_ID,
  type LlmImportOption,
} from "../molecules/QuestionsLlmImportOptionsPanel";
import {
  QuestionsLlmImportPanel,
  type LlmImportCollectionBlock,
  type LlmImportPayload,
  type LlmImportQuestion,
  type LlmImportReponse,
} from "../molecules/QuestionsLlmImportPanel";

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
  return typeof option?.value === "string" || typeof option?.value === "number"
    ? String(option.value)
    : "";
}

function normalizeAndValidateImportText(importText: string): LlmImportPayload {
  const parsed = JSON.parse(importText) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON invalide : objet racine attendu.");
  }
  const root = parsed as Record<string, unknown>;

  const parseReponses = (value: unknown, ctx: string): LlmImportQuestion["reponses"] => {
    if (!Array.isArray(value) || value.length !== 4) {
      throw new Error(`${ctx} : il faut exactement 4 réponses.`);
    }
    const out: LlmImportReponse[] = [];
    let correctCount = 0;
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw new Error(`${ctx}[${i}] : objet réponse attendu.`);
      }
      const raw = item as Record<string, unknown>;
      const texte = raw.texte ?? raw.reponse;
      if (typeof texte !== "string" || texte.trim() === "") {
        throw new Error(`${ctx}[${i}] : "texte" non vide requis.`);
      }
      const correcte = raw.correcte === true || raw.bonne_reponse === 1;
      if (correcte) correctCount += 1;
      out.push({ texte: texte.trim(), correcte });
    }
    if (correctCount !== 1) {
      throw new Error(`${ctx} : exactement une réponse doit être correcte.`);
    }
    return out as LlmImportQuestion["reponses"];
  };

  const parseQuestion = (value: unknown, ctx: string): LlmImportQuestion => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`${ctx} : objet question attendu.`);
    }
    const raw = value as Record<string, unknown>;
    if (typeof raw.question !== "string" || raw.question.trim() === "") {
      throw new Error(`${ctx} : "question" non vide requise.`);
    }
    const commentaire = typeof raw.commentaire === "string" ? raw.commentaire.trim() : "";
    return {
      question: raw.question.trim(),
      commentaire,
      reponses: parseReponses(raw.reponses, `${ctx}.reponses`),
    };
  };

  const parseQuestionsArray = (value: unknown, ctx: string): LlmImportQuestion[] => {
    if (value == null) return [];
    if (!Array.isArray(value)) {
      throw new Error(`${ctx} : tableau attendu.`);
    }
    return value.map((q, index) => parseQuestion(q, `${ctx}[${index}]`));
  };

  const parseCollections = (value: unknown): LlmImportCollectionBlock[] => {
    if (value == null) return [];
    if (!Array.isArray(value)) {
      throw new Error(`collections : tableau attendu.`);
    }
    return value.map((block, index) => {
      if (!block || typeof block !== "object" || Array.isArray(block)) {
        throw new Error(`collections[${index}] : objet attendu.`);
      }
      const raw = block as Record<string, unknown>;
      if (typeof raw.nom !== "string" || raw.nom.trim() === "") {
        throw new Error(`collections[${index}] : "nom" non vide requis.`);
      }
      const questions = parseQuestionsArray(raw.questions, `collections[${index}].questions`);
      if (questions.length === 0) {
        throw new Error(`collections[${index}] : au moins une question requise.`);
      }
      return { nom: raw.nom.trim(), questions };
    });
  };

  const userIdRaw = root.user_id;
  let userId: number | undefined;
  if (userIdRaw != null) {
    if (typeof userIdRaw === "number" && Number.isInteger(userIdRaw) && userIdRaw > 0) {
      userId = userIdRaw;
    } else if (
      typeof userIdRaw === "string" &&
      /^\d+$/.test(userIdRaw.trim()) &&
      Number(userIdRaw.trim()) > 0
    ) {
      userId = Number(userIdRaw.trim());
    } else {
      throw new Error(`user_id : entier positif attendu.`);
    }
  }

  const rootQuestions = parseQuestionsArray(root.questions, "questions");
  const collections = parseCollections(root.collections);
  const questionsSansCollection = parseQuestionsArray(
    root.questions_sans_collection,
    "questions_sans_collection",
  );

  if (rootQuestions.length > 0 && (collections.length > 0 || questionsSansCollection.length > 0)) {
    throw new Error(
      `Format mixte interdit : utilise soit "questions", soit "collections"/"questions_sans_collection".`,
    );
  }

  const normalized: LlmImportPayload = {
    user_id: userId,
    collections,
    questions_sans_collection:
      rootQuestions.length > 0 ? rootQuestions : questionsSansCollection,
  };

  if (
    normalized.collections.length === 0 &&
    normalized.questions_sans_collection.length === 0
  ) {
    throw new Error(`Aucune question détectée dans le JSON.`);
  }
  return normalized;
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
    const col =
      targetCollectionNumeric != null
        ? collections.find((entry) => entry.id === targetCollectionNumeric)
        : null;
    const switched = importLlmLastSyncedCollectionId.current !== targetCollectionNumeric;

    if (targetCollectionNumeric == null) {
      importLlmLastSyncedCollectionId.current = null;
    } else if (switched) {
      importLlmLastSyncedCollectionId.current = targetCollectionNumeric;
    }

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
        contenus: targetCollectionNumeric != null ? "Prérempli depuis la collection" : "Ex. Ma thématique",
        value:
          switched && targetCollectionNumeric != null
            ? (col?.nom ?? "")
            : currentCollectionName || (targetCollectionNumeric != null ? (col?.nom ?? "") : ""),
      },
      {
        id: SUBJECT_OPTION_ID,
        titre: "Sujet des questions",
        type: "texte",
        contenus: "Ex. verbes irréguliers du groupe 3, révision bac SVT…",
        multiline: true,
        value: currentSubject,
      },
      {
        id: EXISTING_STEMS_OPTION_ID,
        titre: "Éviter les répétitions",
        type: "case_a_cocher",
        description:
          targetCollectionNumeric == null
            ? "Disponible lorsque tu filtres sur une collection."
            : "Lister les intitulés déjà en base pour la catégorie sélectionnée afin d’éviter les doublons.",
        disabled: targetCollectionNumeric == null,
        value: targetCollectionNumeric == null ? false : (previousExistingValue ?? false),
        function: () => {
          const selectedCategory = getOptionValue(optionsRef.current, CATEGORY_OPTION_ID) || "histoire";
          const filteredQuestions = questions.filter((q) => q.categorie_type === selectedCategory);
          return filteredQuestions.length > 0
            ? formatExistingQuestionStemsForPrompt(filteredQuestions)
            : "";
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

      const countBlock =
        targetCollectionNumeric != null
          ? `\n\n— Quantité : le tableau racine "questions" doit contenir exactement ${questionCount} objet(s)-question (ni plus ni moins).`
          : `\n\n— Quantité : le JSON doit représenter exactement ${questionCount} question(s) au total (somme des questions dans tous les blocs "collections" et dans "questions_sans_collection").`;
      const nameBlock =
        collectionName.length > 0
          ? targetCollectionNumeric != null
            ? `\n\n— Nom de la collection (thème / cohérence) : « ${collectionName} ». Le JSON ne doit pas dupliquer ce nom dans un champ "collections" : seulement le tableau "questions".`
            : `\n\n— Nom de la collection cible dans le JSON : utilise exactement « ${collectionName} » comme "nom" dans le bloc "collections" concerné (ou fusionne avec une collection existante de ce nom pour cet utilisateur).`
          : "";
      const subjectBlock =
        subject.length > 0 ? `\n\n— Sujet / thème des nouvelles questions à rédiger :\n${subject}` : "";
      const categorieBlock = `\n\n— Catégorie enregistrée pour chaque question importée (ref_categorie) : « ${catKey} » — ${QUESTION_CATEGORIE_DEFINITIONS[catKey]}`;
      const existingBlock =
        targetCollectionNumeric != null && existingStems.length > 0
          ? `\n\n— Questions déjà présentes dans cette collection pour la catégorie « ${catKey} » uniquement (intitulés seuls, sans réponses) — évite les doublons et les paraphrases trop proches :\n${existingStems}`
          : "";

      if (targetCollectionNumeric == null) {
        return LLM_PROMPT_BASE + countBlock + nameBlock + subjectBlock + categorieBlock;
      }
      const col = collections.find((entry) => entry.id === targetCollectionNumeric);
      const nom = col?.nom ?? `id ${targetCollectionNumeric}`;
      const mod =
        importTargetModuleId != null
          ? allModules.find((entry) => entry.id === importTargetModuleId)
          : undefined;
      let tail = `\n\n— Collection active dans l’interface : « ${nom} » (id ${targetCollectionNumeric}).`;
      if (mod) {
        tail += `\n— Après import, lien vers la supercollection « ${mod.nom} » (id ${mod.id}) si tu l’as sélectionnée ci-dessus.`;
      }
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
        const mid =
          cid != null && importTargetModuleId != null
            ? importTargetModuleId
            : undefined;
        const categorieApi =
          getOptionValue(options, CATEGORY_OPTION_ID) === "pratique" ? "pratique" : "histoire";
        const res = await importQuestionsJson(data, {
          collectionId: cid,
          moduleId: mid,
          categorie: categorieApi,
        });
        onImportSuccess();
        if (cid != null) {
          return `Import réussi : ${res.createdQuestions} question(s) créée(s) — ajoutées à la collection affichée.`;
        }
        return res.createdCollections > 0
          ? `Import réussi : ${res.createdQuestions} question(s) créée(s), ${res.createdCollections} nouvelle(s) collection(s).`
          : `Import réussi : ${res.createdQuestions} question(s) créée(s).`;
      },
    }),
    [
      buildPrompt,
      options,
      targetCollectionNumeric,
      importTargetModuleId,
      onImportSuccess,
    ],
  );

  return (
    <>
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Questions</h1>
          <p class="mt-1 text-sm text-base-content/60">
            Modifier ou supprimer via l’API backend (Prisma / SQLite).
          </p>
        </div>
        <Button variant="learn" class="gap-2 self-start sm:self-auto" onClick={() => setImportOpen((o) => !o)}>
          <FileJson class="h-4 w-4" aria-hidden />
          Import LLM
        </Button>
      </div>

      {importOpen ? (
        <QuestionsLlmImportPanel
          options={options}
          setOptions={setOptions}
          llmImportWorkflow={llmImportWorkflow}
        />
      ) : null}
    </>
  );
}
