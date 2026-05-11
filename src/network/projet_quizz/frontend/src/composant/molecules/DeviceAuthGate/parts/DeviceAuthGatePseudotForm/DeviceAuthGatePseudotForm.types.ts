export type DeviceAuthGatePseudotFormProps = {
  actions: { onSubmit: (pseudot: string) => void };
  status: { busy: boolean; error: string | null };
};
