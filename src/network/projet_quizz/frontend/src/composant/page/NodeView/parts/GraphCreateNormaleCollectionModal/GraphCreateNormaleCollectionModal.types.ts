export type GraphCreateNormaleCollectionModalProps = {
  open: boolean;
  busy: boolean;
  error: string | null;
  tagOptions: { id: number; nom: string }[];
  onClose: () => void;
  onSubmit: (payload: { nom: string; tagCollectionId: number | "" }) => void;
};
