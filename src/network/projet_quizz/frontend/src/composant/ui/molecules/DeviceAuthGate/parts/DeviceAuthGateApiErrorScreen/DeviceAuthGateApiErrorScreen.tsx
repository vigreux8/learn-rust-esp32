import { Button } from "../../../../atomes/Button/Button";
import { Card } from "../../../../atomes/Card/Card";
import { DEVICE_AUTH_GATE_STYLES } from "../../DeviceAuthGate.styles";
import type { DeviceAuthGateApiErrorScreenProps } from "./DeviceAuthGateApiErrorScreen.types";

export function DeviceAuthGateApiErrorScreen(props: DeviceAuthGateApiErrorScreenProps) {
  const { data, actions } = props;
  return (
    <div class={DEVICE_AUTH_GATE_STYLES.fullscreenCenter}>
      <Card class="w-full max-w-md border-base-content/10 shadow-xl shadow-flow/5">
        <h1 class="mb-1 text-xl font-bold text-base-content">Connexion au serveur</h1>
        <p class="mb-4 text-sm text-base-content/65">{data.message}</p>
        <Button variant="flow" class="w-full" onClick={actions.onRetry}>
          Reessayer
        </Button>
      </Card>
    </div>
  );
}
