import { useRef, useState } from "preact/hooks";
import { Download, FileUp, HardDriveDownload, Replace, Shuffle } from "lucide-preact";
import {
  downloadDatabaseJsonExport,
  downloadDatabaseSqlExport,
  postDatabaseJsonMerge,
  postDatabaseSqlReplace,
  type DatabaseJsonMergeResult,
  type DatabaseSqlReplaceResult,
} from "../../lib/api";
import { AppFooter } from "../molecules/AppFooter";
import { AppHeader } from "../molecules/AppHeader";
import { PageMain } from "../molecules/PageMain";
import { Button } from "../atomes/Button";

function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function readFileAsText(file: File): Promise<string> {
  return await file.text();
}

/**
 * Vue export / import de la base (fichiers SQL ou JSON) pour sauvegarder ou fusionner des données hors ligne.
 */
export function DatabaseTransferView() {
  const [sqlBusy, setSqlBusy] = useState(false);
  const [jsonBusy, setJsonBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [lastFilename, setLastFilename] = useState<string | null>(null);

  const sqlImportInputRef = useRef<HTMLInputElement | null>(null);
  const jsonImportInputRef = useRef<HTMLInputElement | null>(null);

  const [sqlImportFile, setSqlImportFile] = useState<File | null>(null);
  const [jsonImportFile, setJsonImportFile] = useState<File | null>(null);

  const [sqlImportBusy, setSqlImportBusy] = useState(false);
  const [jsonImportBusy, setJsonImportBusy] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [sqlImportResult, setSqlImportResult] = useState<DatabaseSqlReplaceResult | null>(null);
  const [jsonImportResult, setJsonImportResult] = useState<DatabaseJsonMergeResult | null>(null);

  const handleExportSql = async () => {
    setSqlBusy(true);
    setExportError(null);
    try {
      const { blob, filename } = await downloadDatabaseSqlExport();
      triggerFileDownload(blob, filename);
      setLastFilename(filename);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export impossible.");
    } finally {
      setSqlBusy(false);
    }
  };

  const handleExportJson = async () => {
    setJsonBusy(true);
    setExportError(null);
    try {
      const { blob, filename } = await downloadDatabaseJsonExport();
      triggerFileDownload(blob, filename);
      setLastFilename(filename);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export impossible.");
    } finally {
      setJsonBusy(false);
    }
  };

  const handleSqlImport = async () => {
    if (sqlImportFile == null) return;
    const ok = window.confirm(
      "Remplacement SQL : cette opération peut détruire ou remplacer des données.\n\n" +
        "Tape OK seulement si tu viens de choisir un dump .sql fiable.",
    );
    if (!ok) return;

    const token = window.prompt('Confirmation requise : saisir exactement REMPLACE_TOUT');
    if (token !== "REMPLACE_TOUT") {
      setImportError("Import SQL annulé : confirmation invalide.");
      return;
    }

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
  };

  const handleJsonImport = async () => {
    if (jsonImportFile == null) return;
    const ok = window.confirm(
      "Fusion JSON : les données seront ajoutées / réconciliées dans la base courante.\n\n" +
        "Les identifiants importés seront remappés pour éviter les collisions.",
    );
    if (!ok) return;

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
  };

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <PageMain narrow>
        <div class="mb-8 space-y-3 text-center">
          <p class="inline-flex items-center gap-2 rounded-full bg-flow/10 px-3 py-1 text-xs font-medium text-flow">
            <HardDriveDownload class="h-3.5 w-3.5" aria-hidden />
            Export / import
          </p>
          <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
            Sauvegarde de la base
          </h1>
          <p class="mx-auto max-w-lg text-sm text-base-content/60">
            Choisis le type d’export : <strong>remplacement</strong> via un dump <code>.sql</code>, ou{" "}
            <strong>fusion</strong> via un export <code>.json</code> pensé pour réimporter les données sans rejouer un
            schéma complet. L’import correspondant est disponible plus bas.
          </p>
        </div>

        <section class="mb-6 rounded-box border border-base-content/10 bg-base-200/30 p-6 sm:p-8">
          <div class="mb-6 flex items-start justify-center gap-3 text-center">
            <span class="rounded-full bg-flow/15 p-2 text-flow">
              <Download class="h-5 w-5" aria-hidden />
            </span>
            <div class="max-w-xl">
              <h2 class="text-base font-semibold text-base-content">Exporter</h2>
              <p class="mt-1 text-sm text-base-content/55">
                Les deux boutons téléchargent un fichier : <code>.sql</code> pour une restauration classique,{" "}
                <code>.json</code> pour préparer une fusion (même schéma, nouveaux identifiants gérés plus tard par
                l’import).
              </p>
            </div>
          </div>

          <div class="mx-auto flex max-w-2xl flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-5">
            <Button
              variant="flow"
              class="btn-lg min-h-16 w-full min-w-[240px] justify-center gap-2 px-8 text-base shadow-xl shadow-flow/20 sm:flex-1"
              disabled={sqlBusy}
              onClick={() => void handleExportSql()}
            >
              <Replace class="h-5 w-5 shrink-0" aria-hidden />
              <span class="flex min-w-0 flex-col items-center leading-tight">
                <span class="font-semibold">Remplacement</span>
                <span class="text-xs font-normal opacity-90">{sqlBusy ? "Préparation…" : "fichier .sql"}</span>
              </span>
            </Button>



            <Button
              variant="learn"
              class="btn-lg min-h-16 w-full min-w-[240px] justify-center gap-2 px-8 text-base shadow-xl shadow-learn/20 sm:flex-1"
              disabled={jsonBusy}
              onClick={() => void handleExportJson()}
            >
              <Shuffle class="h-5 w-5 shrink-0" aria-hidden />
              <span class="flex min-w-0 flex-col items-center leading-tight">
                <span class="font-semibold">Fusion</span>
                <span class="text-xs font-normal opacity-90">{jsonBusy ? "Préparation…" : "fichier .json"}</span>
              </span>
            </Button>
          </div>

          {lastFilename ? (
            <p class="mt-6 text-center text-xs text-success">Dernier export téléchargé : {lastFilename}</p>
          ) : null}
          {exportError ? <p class="mt-3 text-center text-xs text-error">{exportError}</p> : null}
        </section>

        <section class="rounded-box border border-dashed border-base-content/15 bg-base-200/20 p-5">
          <div class="mb-5 flex items-start gap-3">
            <span class="rounded-full bg-learn/15 p-2 text-learn">
              <FileUp class="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 class="text-base font-semibold text-base-content">Importer</h2>
              <p class="mt-1 text-sm text-base-content/55">
                <strong>Remplacement</strong> : rejoue un dump <code>.sql</code> (dangereux). <strong>Fusion</strong> : importe
                un export <code>.json</code> FlowLearn en conservant la base existante autant que possible.
              </p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-box border border-base-content/10 bg-base-100/40 p-4">
              <p class="mb-2 text-sm font-semibold text-base-content">Remplacement (.sql)</p>
              <p class="mb-3 text-xs text-base-content/50">
                Choisis un fichier puis confirme explicitement. Le backend exige la confirmation <code>REMPLACE_TOUT</code>.
              </p>

              <input
                ref={sqlImportInputRef}
                type="file"
                accept=".sql,text/sql,application/sql"
                class="hidden"
                onChange={(e) => {
                  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
                  setSqlImportFile(f);
                }}
              />

              <div class="flex flex-col gap-2">
                <button
                  type="button"
                  class="btn btn-outline btn-sm rounded-full border-base-content/15"
                  disabled={sqlImportBusy}
                  onClick={() => sqlImportInputRef.current?.click()}
                >
                  {sqlImportFile ? sqlImportFile.name : "Choisir un fichier .sql"}
                </button>
                <Button
                  variant="flow"
                  class="btn-sm"
                  disabled={sqlImportBusy || sqlImportFile == null}
                  onClick={() => void handleSqlImport()}
                >
                  {sqlImportBusy ? "Import SQL…" : "Importer (remplacement)"}
                </Button>
              </div>
            </div>

            <div class="rounded-box border border-base-content/10 bg-base-100/40 p-4">
              <p class="mb-2 text-sm font-semibold text-base-content">Fusion (.json)</p>
              <p class="mb-3 text-xs text-base-content/50">
                Utilise un export <code>.json</code> généré par cette app (format <code>flowlearn-sqlite-dump-json</code>).
              </p>

              <input
                ref={jsonImportInputRef}
                type="file"
                accept=".json,application/json"
                class="hidden"
                onChange={(e) => {
                  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
                  setJsonImportFile(f);
                }}
              />

              <div class="flex flex-col gap-2">
                <button
                  type="button"
                  class="btn btn-outline btn-sm rounded-full border-base-content/15"
                  disabled={jsonImportBusy}
                  onClick={() => jsonImportInputRef.current?.click()}
                >
                  {jsonImportFile ? jsonImportFile.name : "Choisir un fichier .json"}
                </button>
                <Button
                  variant="learn"
                  class="btn-sm"
                  disabled={jsonImportBusy || jsonImportFile == null}
                  onClick={() => void handleJsonImport()}
                >
                  {jsonImportBusy ? "Import JSON…" : "Importer (fusion)"}
                </Button>
              </div>
            </div>
          </div>

          {importError ? <p class="mt-4 text-xs text-error">{importError}</p> : null}

          {sqlImportResult ? (
            <p class="mt-3 text-xs text-success">
              SQL : {sqlImportResult.statementsExecuted} instruction(s) exécutée(s). Prisma a été reconnecté.
            </p>
          ) : null}

          {jsonImportResult ? (
            <div class="mt-3 rounded-box border border-base-content/10 bg-base-100/40 p-3 text-xs text-base-content/70">
              <p class="font-semibold text-base-content">Fusion JSON</p>
              <p class="mt-1">
                Insérées : {jsonImportResult.insertedRows} · Ignorées : {jsonImportResult.skippedRows} · Remap d’ids :{" "}
                {jsonImportResult.remappedIds}
              </p>
              {jsonImportResult.warnings.length > 0 ? (
                <ul class="mt-2 list-disc space-y-1 pl-4">
                  {jsonImportResult.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>
      </PageMain>
      <AppFooter />
    </div>
  );
}
