import { useState } from "preact/hooks";
import { downloadCollectionAsAppJson } from "../../../lib/collectionAppJson";
import type { ActionExportCollectionJsonProps } from "./ActionExportCollectionJson.types";

export function useActionExportCollectionJson(props: ActionExportCollectionJsonProps) {
  const { data } = props;
  const { collections, targetCollectionNumeric } = data;

  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportCollectionJson = () => {
    if (targetCollectionNumeric == null) return;
    setExportBusy(true);
    setExportError(null);
    try {
      const col = collections.find((entry) => entry.id === targetCollectionNumeric);
      if (!col) throw new Error("Collection introuvable dans la liste chargee.");
      downloadCollectionAsAppJson(col);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export JSON impossible.");
    } finally {
      setExportBusy(false);
    }
  };

  return {
    bouton: {
      disabled: exportBusy || targetCollectionNumeric == null,
      busy: exportBusy,
      onClick: handleExportCollectionJson,
    },
    feedback: {
      erreur: exportError,
    },
  };
}
