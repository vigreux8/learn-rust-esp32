import { Download } from "lucide-preact";
import { Button } from "../../atomes/Button/Button";
import { useActionExportCollectionJson } from "./ActionExportCollectionJson.hook";
import type { ActionExportCollectionJsonProps } from "./ActionExportCollectionJson.types";

export function ActionExportCollectionJson(props: ActionExportCollectionJsonProps) {
  const { bouton, feedback } = useActionExportCollectionJson(props);

  return (
    <div class="flex flex-col items-stretch gap-1 sm:items-end">
      <Button variant="outline" class="gap-2" disabled={bouton.disabled} onClick={bouton.onClick}>
        <Download class="h-4 w-4" aria-hidden />
        {bouton.busy ? "Export..." : "Export JSON"}
      </Button>
      {feedback.erreur ? <p class="text-xs text-error sm:text-right">{feedback.erreur}</p> : null}
    </div>
  );
}
