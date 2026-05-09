import { useRef, useState } from "preact/hooks";
import {
  postDatabaseJsonMerge,
  postDatabaseSqlReplace,
  type DatabaseJsonMergeResult,
  type DatabaseSqlReplaceResult,
} from "../../../../../lib/api";
import { readFileAsText } from "../../DatabaseTransferView.utils";

export function useDatabaseTransferImport() {
  const sqlImportInputRef = useRef<HTMLInputElement | null>(null);
  const jsonImportInputRef = useRef<HTMLInputElement | null>(null);

  const [sqlImportFile, setSqlImportFile] = useState<File | null>(null);
  const [jsonImportFile, setJsonImportFile] = useState<File | null>(null);

  const [sqlImportBusy, setSqlImportBusy] = useState(false);
  const [jsonImportBusy, setJsonImportBusy] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [sqlImportResult, setSqlImportResult] = useState<DatabaseSqlReplaceResult | null>(null);
  const [jsonImportResult, setJsonImportResult] = useState<DatabaseJsonMergeResult | null>(null);

  const handleSqlImport = () => {
    if (sqlImportFile == null) return;
    const ok = window.confirm(
      "Remplacement SQL : cette operation peut detruire ou remplacer des donnees.\n\n" +
        "Tape OK seulement si tu viens de choisir un dump .sql fiable.",
    );
    if (!ok) return;

    const token = window.prompt("Confirmation requise : saisir exactement REMPLACE_TOUT");
    if (token !== "REMPLACE_TOUT") {
      setImportError("Import SQL annule : confirmation invalide.");
      return;
    }

    void (async () => {
      setSqlImportBusy(true);
      setImportError(null);
      setSqlImportResult(null);
      setJsonImportResult(null);
      try {
        const script = await readFileAsText(sqlImportFile);
        const result = await postDatabaseSqlReplace(script);
        setSqlImportResult(result);
      } catch (error) {
        setImportError(error instanceof Error ? error.message : "Import SQL impossible.");
      } finally {
        setSqlImportBusy(false);
      }
    })();
  };

  const handleJsonImport = () => {
    if (jsonImportFile == null) return;
    const ok = window.confirm(
      "Fusion JSON : les donnees seront ajoutees / reconciliees dans la base courante.\n\n" +
        "Les identifiants importes seront remappes pour eviter les collisions.",
    );
    if (!ok) return;

    void (async () => {
      setJsonImportBusy(true);
      setImportError(null);
      setJsonImportResult(null);
      setSqlImportResult(null);
      try {
        const text = await readFileAsText(jsonImportFile);
        const payload = JSON.parse(text) as unknown;
        const result = await postDatabaseJsonMerge(payload);
        setJsonImportResult(result);
      } catch (error) {
        setImportError(error instanceof Error ? error.message : "Import JSON impossible.");
      } finally {
        setJsonImportBusy(false);
      }
    })();
  };

  return {
    sqlImportFile,
    jsonImportFile,
    sqlImportBusy,
    jsonImportBusy,
    importError,
    sqlImportResult,
    jsonImportResult,
    onPickSqlImportFile: setSqlImportFile,
    onPickJsonImportFile: setJsonImportFile,
    handleSqlImport,
    handleJsonImport,
    openSqlFilePicker: () => sqlImportInputRef.current?.click(),
    openJsonFilePicker: () => jsonImportInputRef.current?.click(),
    sqlImportInputRef,
    jsonImportInputRef,
  };
}
