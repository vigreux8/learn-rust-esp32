export type UnsavedChainLeaveModalProps = {
  open: boolean;
  /** Enregistrement de la suite en cours */
  saveBusy: boolean;
  /** Rechargement après abandon des modifications */
  discardBusy: boolean;
  onCancel: () => void;
  onSave: () => void | Promise<void>;
  onDiscard: () => void | Promise<void>;
};
