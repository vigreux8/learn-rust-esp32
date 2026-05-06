export type CollectionGroupEditModalProps = {
  settings: {
    open: boolean;
    title: string;
    nomInputId: string;
    descriptionInputId: string;
  };
  data: {
    nom: string;
    description: string;
  };
  status: {
    busy: boolean;
  };
  actions: {
    onClose: () => void;
    onChangeNom: (value: string) => void;
    onChangeDescription: (value: string) => void;
    onSubmit: () => void;
  };
};
