import { createNetworkTransport } from "./api/network.js";
import { createServoApi } from "./api/servo.js";
import { setupServoUi } from "./ui.js";

const statusEl = document.getElementById("transport-status");

function setStatus(message) {
  if (statusEl) {
    statusEl.textContent = message;
  }
}

const transport = createNetworkTransport("http", setStatus);
const servoApi = createServoApi(transport);

setupServoUi(servoApi, "http");
transport.start();
