import { FileJson } from "lucide-preact";
import { Button } from "../../atomes/Button/Button";
import type { ActionImportLlmProps } from "./ActionImportLlm.types";

export function ActionImportLlm(props: ActionImportLlmProps) {
  const { data, actions } = props;

  return (
    <Button
      variant="learn"
      class="gap-2"
      disabled={data.disabled === true}
      aria-expanded={data.panneauImportOuvert}
      onClick={actions.onBasculerPanneauImport}
    >
      <FileJson class="h-4 w-4" aria-hidden />
      Import LLM
    </Button>
  );
}
