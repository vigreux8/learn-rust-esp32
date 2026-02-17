const sliders = document.querySelectorAll(".speed-slider");
const stopButtons = document.querySelectorAll(".stop-button");
const statusEl = document.getElementById("transport-status");
let ws = null;
let reconnectTimer = null;
const pendingByTarget = new Map();

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
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  ws = new WebSocket(`${protocol}://${window.location.host}/ws`);

  ws.onopen = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    flushPending();
    setStatus("WebSocket connecté.");
  };

  ws.onclose = () => {
    setStatus("WebSocket déconnecté. Reconnexion...");
    reconnectTimer = setTimeout(connectWebSocket, 1500);
  };

  ws.onerror = () => {
    setStatus("Erreur WebSocket.");
  };

  ws.onmessage = (event) => {
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

window.addEventListener("beforeunload", () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
});

connectWebSocket();
setStatus("Connexion WebSocket en cours...");
