import { createNetworkTransport } from "./api/network.js";
import { createServoApi } from "./api/servo.js";
import { setupServoUi } from "./ui.js";

const statusEl = document.getElementById("transport-status");

function setStatus(message) {
  if (statusEl) {
    statusEl.textContent = message;
  }
}

const transport = createNetworkTransport("ws", setStatus);
const servoApi = createServoApi(transport);

setupServoUi(servoApi, "ws");
transport.start();

window.addEventListener("beforeunload", () => transport.stop());
window.addEventListener("pagehide", () => transport.stop());
window.addEventListener("pageshow", () => transport.resume());
