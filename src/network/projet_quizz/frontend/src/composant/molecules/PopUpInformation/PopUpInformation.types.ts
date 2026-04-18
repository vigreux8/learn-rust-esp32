export type PopUpInformationProps = {
  open: boolean;
  title: string;
  message: string;
  variant?: "info" | "danger";
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};
