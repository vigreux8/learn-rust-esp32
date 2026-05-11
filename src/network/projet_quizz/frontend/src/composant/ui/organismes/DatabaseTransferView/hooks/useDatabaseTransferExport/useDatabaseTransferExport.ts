import { useState } from "preact/hooks";
import { downloadDatabaseJsonExport, downloadDatabaseSqlExport } from "../../../../../../lib/api";
import { triggerFileDownload } from "../../DatabaseTransferView.utils";

/**
 * Export base : téléchargement SQL ou JSON, indicateurs de chargement et nom du dernier fichier généré.
 */
export function useDatabaseTransferExport() {
  const [sqlBusy, setSqlBusy] = useState(false);
  const [jsonBusy, setJsonBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [lastFilename, setLastFilename] = useState<string | null>(null);

  const handleExportSql = () => void runExport(downloadDatabaseSqlExport, setSqlBusy, setExportError, setLastFilename);
  const handleExportJson = () => void runExport(downloadDatabaseJsonExport, setJsonBusy, setExportError, setLastFilename);

  return {
    sqlBusy,
    jsonBusy,
    exportError,
    lastFilename,
    handleExportSql,
    handleExportJson,
  };
}

async function runExport(
  downloadFn: () => Promise<{ blob: Blob; filename: string }>,
  setBusy: (v: boolean) => void,
  setExportError: (v: string | null) => void,
  setLastFilename: (v: string | null) => void,
): Promise<void> {
  setBusy(true);
  setExportError(null);
  try {
    const { blob, filename } = await downloadFn();
    triggerFileDownload(blob, filename);
    setLastFilename(filename);
  } catch (error) {
    setExportError(error instanceof Error ? error.message : "Export impossible.");
  } finally {
    setBusy(false);
  }
}
