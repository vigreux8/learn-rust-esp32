import { DEMO_DEVICE_MAC } from "../../../../../../lib/config";
import { Button } from "../../../../atomes/Button/Button";
import { Card } from "../../../../atomes/Card/Card";
import { DEVICE_AUTH_GATE_STYLES } from "../../DeviceAuthGate.styles";
import { useDeviceAuthGatePseudotForm } from "./DeviceAuthGatePseudotForm.hook";
import type { DeviceAuthGatePseudotFormProps } from "./DeviceAuthGatePseudotForm.types";

export function DeviceAuthGatePseudotForm(props: DeviceAuthGatePseudotFormProps) {
  const vm = useDeviceAuthGatePseudotForm(props);

  return (
    <div class={DEVICE_AUTH_GATE_STYLES.fullscreenCenter}>
      <Card class="w-full max-w-md border-base-content/10 shadow-xl shadow-flow/5">
        <h1 class="mb-1 text-xl font-bold text-base-content">Premiere visite</h1>
        <p class="mb-4 text-sm text-base-content/65">
          Cet appareil n est pas reconnu en base (ou la base est vide). Indique ton pseudonyme pour creer ton profil (demo :
          MAC simulee{" "}
          <code class="rounded bg-base-200 px-1.5 py-0.5 text-xs">{DEMO_DEVICE_MAC}</code>
          ).
        </p>
        <label class="mb-2 block text-sm font-medium text-base-content/80" for="gate-pseudot">
          Pseudonyme
        </label>
        <input
          id="gate-pseudot"
          class="input input-bordered mb-3 w-full rounded-xl border-base-content/15 bg-base-100"
          type="text"
          autoComplete="username"
          placeholder="ex. zelda_quizz"
          value={vm.field.value}
          disabled={vm.field.disabled}
          onInput={(e) => vm.field.onInput((e.target as HTMLInputElement).value)}
        />
        {vm.status.error ? <p class="mb-3 text-sm text-error">{vm.status.error}</p> : null}
        <Button
          variant="flow"
          class="w-full"
          disabled={vm.status.busy || !vm.field.value.trim()}
          onClick={vm.actions.onSubmitClick}
        >
          {vm.status.busy ? "Enregistrement..." : "Continuer"}
        </Button>
      </Card>
    </div>
  );
}
