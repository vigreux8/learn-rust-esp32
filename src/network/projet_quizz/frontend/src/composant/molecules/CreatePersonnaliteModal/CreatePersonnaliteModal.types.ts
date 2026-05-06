export type CreatePersonnaliteModalProps = {
  open: boolean;
  busy: boolean;
  error: string | null;
  tagOptions: { id: number; nom: string }[];
  onClose: () => void;
  onSubmit: (payload: {
    nom: string;
    prenom: string;
    naissance: number;
    mort: number | null;
    resumer: string;
    tagCollectionId: number | "";
  }) => void;
};
