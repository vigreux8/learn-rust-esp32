import type { QuizzModuleRow } from "../../../types/quizz";

export type CreatePersonnaliteModalProps = {
  open: boolean;
  busy: boolean;
  error: string | null;
  modules: QuizzModuleRow[];
  onClose: () => void;
  onSubmit: (payload: {
    nom: string;
    prenom: string;
    naissance: number;
    mort: number | null;
    resumer: string;
    moduleId: number | "";
  }) => void;
};
