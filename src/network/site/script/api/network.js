function buildWebSocketUrl() {
  const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host || "192.168.71.1";
  return `${wsProtocol}://${host}/ws`;
}

function createWebSocketTransport(setStatus) {
  let ws = null;
  let reconnectTimer = null;
  let connectTimeoutTimer = null;
  const pendingByTarget = new Map();
  let shouldReconnect = true;

  function clearTimers() {
    if (connectTimeoutTimer) {
      clearTimeout(connectTimeoutTimer);
      connectTimeoutTimer = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
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

    clearTimers();
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

      clearTimers();
      flushPending();
      setStatus("WebSocket connecté.");
    };

    socket.onclose = (event) => {
      if (ws === socket) {
        ws = null;
      }

      clearTimers();
      if (!shouldReconnect) {
        return;
      }

      setStatus(`WebSocket déconnecté (code ${event.code}). Reconnexion...`);
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectWebSocket();
      }, 1500);
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

  return {
    start() {
      shouldReconnect = true;
      connectWebSocket();
    },

    send(target, value, _force = false) {
      const message = `${target}:${value}`;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        return;
      }

      pendingByTarget.set(target, message);
    },

    stop() {
      shouldReconnect = false;
      clearTimers();
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close(1000, "navigate");
      }
      ws = null;
    },

    resume() {
      shouldReconnect = true;
      if (!ws || ws.readyState === WebSocket.CLOSED) {
        connectWebSocket();
      }
    },
  };
}

function createHttpTransport(setStatus) {
  const lastSent = new Map();

  return {
    start() {
      setStatus("Canal HTTP prêt.");
    },

    async send(target, value, force = false) {
      const speed = String(value);
      if (!force && lastSent.get(target) === speed) {
        return;
      }

      try {
        const response = await fetch("/api/servo", {
          method: "POST",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
          keepalive: false,
          body: `${target}:${speed}`,
        });

        if (!response.ok) {
          setStatus(`HTTP erreur ${response.status}`);
        } else {
          lastSent.set(target, speed);
          setStatus("Commande HTTP envoyée.");
        }
      } catch (_error) {
        setStatus("Erreur réseau HTTP.");
      }
    },

    stop() {},
    resume() {},
  };
}

export function createNetworkTransport(mode, setStatus) {
  if (mode === "http") {
    return createHttpTransport(setStatus);
  }

  return createWebSocketTransport(setStatus);
}
