export type ActionImportLlmProps = {
  data: {
    panneauImportOuvert: boolean;
    disabled?: boolean;
  };
  actions: {
    onBasculerPanneauImport: () => void;
  };
};
