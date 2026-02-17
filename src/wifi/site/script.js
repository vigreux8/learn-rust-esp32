const sliders = document.querySelectorAll(".speed-slider");
const stopButtons = document.querySelectorAll(".stop-button");
const statusEl = document.getElementById("transport-status");
let ws = null;
let reconnectTimer = null;
const pendingByTarget = new Map();
let shouldReconnect = true;

function setStatus(message) {
  if (statusEl) {
    statusEl.textContent = message;
  }
}

function sendSpeed(target, value) {
  const message = `${target}:${value}`;
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(message);
    return;
  }

  pendingByTarget.set(target, message);
}

function flushPending() {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return;
  }

  for (const message of pendingByTarget.values()) {
    ws.send(message);
  }
  pendingByTarget.clear();
}

function resetSliderToZero(target) {
  const slider = document.querySelector(`.speed-slider[data-target="${target}"]`);
  if (!slider) {
    return;
  }

  slider.value = "0";
  sendSpeed(target, 0);
}

function connectWebSocket() {
  if (!shouldReconnect) {
    return;
  }
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
  ws = socket;

  socket.onopen = () => {
    if (ws !== socket) {
      return;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    flushPending();
    setStatus("WebSocket connecté.");
  };

  socket.onclose = (event) => {
    if (ws === socket) {
      ws = null;
    }
    if (!shouldReconnect) {
      return;
    }
    setStatus(`WebSocket déconnecté (code ${event.code}). Reconnexion...`);
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectWebSocket();
      }, 1500);
    }
  };

  socket.onerror = () => {
    setStatus("Erreur WebSocket.");
  };

  socket.onmessage = (event) => {
    if (event.data && event.data !== "ok" && event.data !== "connected") {
      setStatus(`ESP32: ${event.data}`);
    }
  };
}

sliders.forEach((slider) => {
  slider.addEventListener("input", () => {
    sendSpeed(slider.dataset.target, slider.value);
  });
});

stopButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;
    resetSliderToZero(target);
  });
});

function cleanupWebSocket() {
  shouldReconnect = false;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    ws.close(1000, "navigate");
  }
  ws = null;
}

window.addEventListener("beforeunload", cleanupWebSocket);
window.addEventListener("pagehide", cleanupWebSocket);

connectWebSocket();
setStatus("Connexion WebSocket en cours...");
