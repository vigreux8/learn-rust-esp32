import { useState } from "preact/hooks";

import type { DeviceAuthGatePseudotFormProps } from "./DeviceAuthGatePseudotForm.types";

export function useDeviceAuthGatePseudotForm(props: DeviceAuthGatePseudotFormProps) {
  const { actions, status } = props;
  const [value, setValue] = useState("");

  return {
    field: {
      value,
      onInput: setValue,
      disabled: status.busy,
    },
    actions: {
      onSubmitClick: () => actions.onSubmit(value.trim()),
    },
    status,
  };
}
