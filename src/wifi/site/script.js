const sliders = document.querySelectorAll(".speed-slider");
const stopButtons = document.querySelectorAll(".stop-button");
const statusEl = document.getElementById("transport-status");
let ws = null;
let reconnectTimer = null;
let connectTimeoutTimer = null;
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

function buildWebSocketUrl() {
  const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host || "192.168.71.1";
  return `${wsProtocol}://${host}/ws`;
}

function connectWebSocket() {
  if (!shouldReconnect) {
    return;
  }
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const socket = new WebSocket(buildWebSocketUrl());
  ws = socket;
  setStatus("Connexion WebSocket en cours...");

  if (connectTimeoutTimer) {
    clearTimeout(connectTimeoutTimer);
    connectTimeoutTimer = null;
  }
  connectTimeoutTimer = setTimeout(() => {
    if (ws === socket && socket.readyState === WebSocket.CONNECTING) {
      setStatus("Timeout ouverture WebSocket. Nouvelle tentative...");
      socket.close();
    }
  }, 4000);

  socket.onopen = () => {
    if (ws !== socket) {
      return;
    }
    if (connectTimeoutTimer) {
      clearTimeout(connectTimeoutTimer);
      connectTimeoutTimer = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    flushPending();
    setStatus("WebSocket connecté.");
  };

  socket.onclose = (event) => {
    if (connectTimeoutTimer) {
      clearTimeout(connectTimeoutTimer);
      connectTimeoutTimer = null;
    }
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
  if (connectTimeoutTimer) {
    clearTimeout(connectTimeoutTimer);
    connectTimeoutTimer = null;
  }
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
window.addEventListener("pageshow", () => {
  shouldReconnect = true;
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    connectWebSocket();
  }
});

connectWebSocket();
