import { Download, FileUp, HardDriveDownload, Replace, Shuffle } from "lucide-preact";
import { AppFooter } from "../../molecules/AppFooter/AppFooter";
import { AppHeader } from "../../molecules/AppHeader/AppHeader";
import { PageMain } from "../../molecules/PageMain/PageMain";
import { Button } from "../../atomes/Button/Button";
import { useDatabaseTransferView } from "./DatabaseTransferView.hook";
import { DATABASE_TRANSFER_VIEW_STYLES } from "./DatabaseTransferView.styles";

export function DatabaseTransferView() {
  const { exporting, importing } = useDatabaseTransferView();

  return (
    <div class={DATABASE_TRANSFER_VIEW_STYLES.root}>
      <AppHeader />
      <PageMain narrow>
        <div class="mb-8 space-y-3 text-center">
          <p class="inline-flex items-center gap-2 rounded-full bg-flow/10 px-3 py-1 text-xs font-medium text-flow">
            <HardDriveDownload class="h-3.5 w-3.5" aria-hidden />
            Export / import
          </p>
          <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Sauvegarde de la base</h1>
          <p class="mx-auto max-w-lg text-sm text-base-content/60">
            Choisis le type d export : <strong>remplacement</strong> via un dump <code>.sql</code>, ou{" "}
            <strong>fusion</strong> via un export <code>.json</code> pense pour reimporter les donnees sans rejouer un
            schema complet. L import correspondant est disponible plus bas.
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
                Les deux boutons telechargent un fichier : <code>.sql</code> pour une restauration classique,{" "}
                <code>.json</code> pour preparer une fusion (meme schema, nouveaux identifiants geres plus tard par
                l import).
              </p>
            </div>
          </div>

          <div class="mx-auto flex max-w-2xl flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-5">
            <Button
              variant="flow"
              class="btn-lg min-h-16 w-full min-w-[240px] justify-center gap-2 px-8 text-base shadow-xl shadow-flow/20 sm:flex-1"
              disabled={exporting.sqlBusy}
              onClick={exporting.handleExportSql}
            >
              <Replace class="h-5 w-5 shrink-0" aria-hidden />
              <span class="flex min-w-0 flex-col items-center leading-tight">
                <span class="font-semibold">Remplacement</span>
                <span class="text-xs font-normal opacity-90">{exporting.sqlBusy ? "Preparation..." : "fichier .sql"}</span>
              </span>
            </Button>

            <Button
              variant="learn"
              class="btn-lg min-h-16 w-full min-w-[240px] justify-center gap-2 px-8 text-base shadow-xl shadow-learn/20 sm:flex-1"
              disabled={exporting.jsonBusy}
              onClick={exporting.handleExportJson}
            >
              <Shuffle class="h-5 w-5 shrink-0" aria-hidden />
              <span class="flex min-w-0 flex-col items-center leading-tight">
                <span class="font-semibold">Fusion</span>
                <span class="text-xs font-normal opacity-90">{exporting.jsonBusy ? "Preparation..." : "fichier .json"}</span>
              </span>
            </Button>
          </div>

          {exporting.lastFilename ? (
            <p class="mt-6 text-center text-xs text-success">Dernier export telecharge : {exporting.lastFilename}</p>
          ) : null}
          {exporting.exportError ? <p class="mt-3 text-center text-xs text-error">{exporting.exportError}</p> : null}
        </section>

        <section class="rounded-box border border-dashed border-base-content/15 bg-base-200/20 p-5">
          <div class="mb-5 flex items-start gap-3">
            <span class="rounded-full bg-learn/15 p-2 text-learn">
              <FileUp class="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 class="text-base font-semibold text-base-content">Importer</h2>
              <p class="mt-1 text-sm text-base-content/55">
                <strong>Remplacement</strong> : rejoue un dump <code>.sql</code> (dangereux). <strong>Fusion</strong> :
                importe un export <code>.json</code> FlowLearn en conservant la base existante autant que possible.
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
                ref={importing.sqlImportInputRef}
                type="file"
                accept=".sql,text/sql,application/sql"
                class="hidden"
                onChange={(e) => importing.onPickSqlImportFile((e.target as HTMLInputElement).files?.[0] ?? null)}
              />

              <div class="flex flex-col gap-2">
                <button
                  type="button"
                  class="btn btn-outline btn-sm rounded-full border-base-content/15"
                  disabled={importing.sqlImportBusy}
                  onClick={importing.openSqlFilePicker}
                >
                  {importing.sqlImportFile ? importing.sqlImportFile.name : "Choisir un fichier .sql"}
                </button>
                <Button
                  variant="flow"
                  class="btn-sm"
                  disabled={importing.sqlImportBusy || importing.sqlImportFile == null}
                  onClick={importing.handleSqlImport}
                >
                  {importing.sqlImportBusy ? "Import SQL..." : "Importer (remplacement)"}
                </Button>
              </div>
            </div>

            <div class="rounded-box border border-base-content/10 bg-base-100/40 p-4">
              <p class="mb-2 text-sm font-semibold text-base-content">Fusion (.json)</p>
              <p class="mb-3 text-xs text-base-content/50">
                Utilise un export <code>.json</code> genere par cette app (format <code>flowlearn-sqlite-dump-json</code>).
              </p>

              <input
                ref={importing.jsonImportInputRef}
                type="file"
                accept=".json,application/json"
                class="hidden"
                onChange={(e) => importing.onPickJsonImportFile((e.target as HTMLInputElement).files?.[0] ?? null)}
              />

              <div class="flex flex-col gap-2">
                <button
                  type="button"
                  class="btn btn-outline btn-sm rounded-full border-base-content/15"
                  disabled={importing.jsonImportBusy}
                  onClick={importing.openJsonFilePicker}
                >
                  {importing.jsonImportFile ? importing.jsonImportFile.name : "Choisir un fichier .json"}
                </button>
                <Button
                  variant="learn"
                  class="btn-sm"
                  disabled={importing.jsonImportBusy || importing.jsonImportFile == null}
                  onClick={importing.handleJsonImport}
                >
                  {importing.jsonImportBusy ? "Import JSON..." : "Importer (fusion)"}
                </Button>
              </div>
            </div>
          </div>

          {importing.importError ? <p class="mt-4 text-xs text-error">{importing.importError}</p> : null}

          {importing.sqlImportResult ? (
            <p class="mt-3 text-xs text-success">
              SQL : {importing.sqlImportResult.statementsExecuted} instruction(s) executee(s). Prisma a ete reconnecte.
            </p>
          ) : null}

          {importing.jsonImportResult ? (
            <div class="mt-3 rounded-box border border-base-content/10 bg-base-100/40 p-3 text-xs text-base-content/70">
              <p class="font-semibold text-base-content">Fusion JSON</p>
              <p class="mt-1">
                Inserees : {importing.jsonImportResult.insertedRows} · Ignorees : {importing.jsonImportResult.skippedRows} · Remap d ids :{" "}
                {importing.jsonImportResult.remappedIds}
              </p>
              {importing.jsonImportResult.warnings.length > 0 ? (
                <ul class="mt-2 list-disc space-y-1 pl-4">
                  {importing.jsonImportResult.warnings.map((w) => (
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
