import { UserSessionContext } from "../../../../lib/userSession";
import { DeviceAuthGateApiErrorScreen } from "./parts/DeviceAuthGateApiErrorScreen";
import { DeviceAuthGateCheckingScreen } from "./parts/DeviceAuthGateCheckingScreen";
import { DeviceAuthGatePseudotForm } from "./parts/DeviceAuthGatePseudotForm";
import { DeviceAuthGateWelcomeOverlay } from "./parts/DeviceAuthGateWelcomeOverlay";
import { useDeviceAuthGate } from "./DeviceAuthGate.hook";
import type { DeviceAuthGateProps } from "./DeviceAuthGate.types";

export function DeviceAuthGate(props: DeviceAuthGateProps) {
  const { children } = props;
  const view = useDeviceAuthGate(children);
  const { session, screen, body } = view;

  return (
    <UserSessionContext.Provider value={session.providerValue}>
      {screen.checking ? <DeviceAuthGateCheckingScreen /> : null}
      {screen.apiError != null ? (
        <DeviceAuthGateApiErrorScreen data={{ message: screen.apiError.message }} actions={{ onRetry: screen.apiError.onRetry }} />
      ) : null}
      {screen.pseudot != null ? (
        <DeviceAuthGatePseudotForm actions={{ onSubmit: screen.pseudot.onSubmit }} status={{ busy: screen.pseudot.busy, error: screen.pseudot.error }} />
      ) : null}
      {screen.welcome != null ? (
        <DeviceAuthGateWelcomeOverlay data={{ pseudot: screen.welcome.pseudot }} actions={{ onDone: screen.welcome.onDone }} />
      ) : null}
      {body}
    </UserSessionContext.Provider>
  );
}
