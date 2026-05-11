import type { LlmImportPayload } from "../../../../molecules/QuestionsLlmImportPanel";
import type { QuestionCategorieKey } from "../../../../../../lib/questionCategories";

export type CollectionReflexionLlmImportWidgetProps = {
  data: {
    collectionId: number;
    collectionNom: string | null;
    poolQuestions: { question: string }[];
    disabled: boolean;
  };
  actions: {
    /** Ajoute les questions au pool local ; aucune écriture en base tant qu’elles ne sont pas glissées dans la suite. */
    onImportLocalPayload: (payload: LlmImportPayload, categorieKey: QuestionCategorieKey) => void;
  };
};
