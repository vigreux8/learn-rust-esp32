import type { DatabaseJsonMergeResult, DatabaseSqlReplaceResult } from "../../../lib/api";

export type DatabaseTransferViewProps = Record<string, never>;

export type DatabaseTransferExportSlice = {
  sqlBusy: boolean;
  jsonBusy: boolean;
  exportError: string | null;
  lastFilename: string | null;
  handleExportSql: () => void;
  handleExportJson: () => void;
};

export type DatabaseTransferImportSlice = {
  sqlImportFile: File | null;
  jsonImportFile: File | null;
  sqlImportBusy: boolean;
  jsonImportBusy: boolean;
  importError: string | null;
  sqlImportResult: DatabaseSqlReplaceResult | null;
  jsonImportResult: DatabaseJsonMergeResult | null;
  onPickSqlImportFile: (file: File | null) => void;
  onPickJsonImportFile: (file: File | null) => void;
  handleSqlImport: () => void;
  handleJsonImport: () => void;
};
