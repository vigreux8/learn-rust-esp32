import { useCallback, useRef, useState } from "preact/hooks";
import {
  createEmptyCollection,
  importAppCollectionQuestionsJson,
  importQuestionsJson,
} from "../../../../../../lib/api";
import { normalizeAndValidateAppCollectionImportText } from "../../../../../../lib/appCollectionImportNormalize";
import { normalizeAndValidateImportText } from "../../../../../../lib/llmImportNormalize";
import type { UseCollectionsJsonImportOptions, UseCollectionsJsonImportPanel } from "./useCollectionsJsonImport.types";

/**
 * Panneau d’import JSON (questions LLM ou export d’app) : fichier, validation normalisée, création de collection
 * vide le cas échéant et rappel des intégrations parent (reload).
 */
export function useCollectionsJsonImport(
  options: UseCollectionsJsonImportOptions,
): UseCollectionsJsonImportPanel {
  const {
    identity: { userId },
    integrations,
  } = options;

  const jsonImportInputRef = useRef<HTMLInputElement | null>(null);
  const [jsonImportOpen, setJsonImportOpen] = useState(false);
  const [jsonImportMode, setJsonImportMode] = useState<"app" | "llm">("app");
  const [jsonImportText, setJsonImportText] = useState("");
  const [jsonImportBusy, setJsonImportBusy] = useState(false);
  const [jsonImportMessage, setJsonImportMessage] = useState<string | null>(null);
  const [jsonImportError, setJsonImportError] = useState<string | null>(null);
  const [jsonImportCategorie, setJsonImportCategorie] = useState<
    "histoire" | "pratique" | "connaissance"
  >("histoire");

  const handleJsonImportRun = useCallback(async () => {
    setJsonImportBusy(true);
    setJsonImportError(null);
    setJsonImportMessage(null);
    try {
      if (jsonImportMode === "app") {
        const normalized = normalizeAndValidateAppCollectionImportText(jsonImportText);
        normalized.user_id = userId;
        let collectionCreeeId: number | undefined;
        try {
          const nouvelle = await createEmptyCollection({ userId, nom: normalized.collection.nom });
          collectionCreeeId = nouvelle.id;
          const res = await importAppCollectionQuestionsJson(normalized, { collectionId: nouvelle.id });
          const { list, picker } = await integrations.loadBootstrap();
          integrations.setCollections(list);
          integrations.setPersonalitesPicker(picker);
          setJsonImportText("");
          setJsonImportMessage(
            `Import reussi (FlowLearn) : collection « ${normalized.collection.nom} » creee, ${res.createdQuestions} question(s).`,
          );
        } catch (inner) {
          if (collectionCreeeId != null) {
            try {
              await integrations.deleteCollection(collectionCreeeId, userId);
            } catch {
              /* rollback best-effort */
            }
          }
          throw inner;
        }
        return;
      }
      const normalizedLlm = normalizeAndValidateImportText(jsonImportText);
      normalizedLlm.user_id = userId;
      const res = await importQuestionsJson(normalizedLlm, { categorie: jsonImportCategorie });
      const { list, picker } = await integrations.loadBootstrap();
      integrations.setCollections(list);
      integrations.setPersonalitesPicker(picker);
      setJsonImportText("");
      setJsonImportMessage(
        res.createdCollections > 0
          ? `Import reussi (LLM) : ${res.createdQuestions} question(s), ${res.createdCollections} nouvelle(s) collection(s).`
          : `Import reussi (LLM) : ${res.createdQuestions} question(s).`,
      );
    } catch (e) {
      setJsonImportError(e instanceof Error ? e.message : "Import JSON impossible.");
    } finally {
      setJsonImportBusy(false);
    }
  }, [
    integrations,
    jsonImportCategorie,
    jsonImportMode,
    jsonImportText,
    userId,
  ]);

  const onJsonImportFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      setJsonImportError(null);
      setJsonImportMessage(null);
      const text = await file.text();
      setJsonImportText(text);
      setJsonImportOpen(true);
    } catch {
      setJsonImportError("Lecture du fichier impossible.");
    } finally {
      input.value = "";
    }
  };

  return {
    inputRef: jsonImportInputRef,
    panel: {
      open: jsonImportOpen,
      mode: jsonImportMode,
      categorie: jsonImportCategorie,
      busy: jsonImportBusy,
      text: jsonImportText,
      error: jsonImportError,
      message: jsonImportMessage,
      onChangeCategorie: setJsonImportCategorie,
      onOpenFilePicker: () => jsonImportInputRef.current?.click(),
      onChangeText: setJsonImportText,
      onRun: () => void handleJsonImportRun(),
      onFileChange: (evt: Event) => void onJsonImportFileChange(evt),
    },
    chrome: {
      headerJsonImportOpen: jsonImportOpen,
      headerJsonImportMode: jsonImportMode,
      onHeaderOpenFlowLearnImport: () => {
        setJsonImportMode("app");
        setJsonImportOpen(true);
      },
      setChromeOpen: setJsonImportOpen,
      setChromeMode: setJsonImportMode,
    },
  };
}
