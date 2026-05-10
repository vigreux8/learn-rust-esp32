import type { DatabaseTransferViewProps } from "./DatabaseTransferView.types";
import { useDatabaseTransferExport } from "./hooks/useDatabaseTransferExport";
import { useDatabaseTransferImport } from "./hooks/useDatabaseTransferImport";

/**
 * Orchestrateur transfert DB : relie les hooks import et export pour l’écran maintenance.
 */
export function useDatabaseTransferView(props: DatabaseTransferViewProps = {}) {
  void props;
  const exporting = useDatabaseTransferExport();
  const importing = useDatabaseTransferImport();

  return { exporting, importing };
}
