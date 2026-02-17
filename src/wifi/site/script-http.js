const sliders = document.querySelectorAll(".speed-slider");
const stopButtons = document.querySelectorAll(".stop-button");
const statusEl = document.getElementById("transport-status");
const lastSent = new Map();

function setStatus(message) {
  if (statusEl) {
    statusEl.textContent = message;
  }
}

async function sendSpeed(target, value, force = false) {
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
}

function resetSliderToZero(target) {
  const slider = document.querySelector(`.speed-slider[data-target="${target}"]`);
  if (!slider) {
    return;
  }

  slider.value = "0";
  sendSpeed(target, 0, true);
}

sliders.forEach((slider) => {
  const sendOnRelease = () => {
    sendSpeed(slider.dataset.target, slider.value);
  };

  slider.addEventListener("change", sendOnRelease);
  slider.addEventListener("pointerup", sendOnRelease);
  slider.addEventListener("touchend", sendOnRelease, { passive: true });
});

stopButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;
    resetSliderToZero(target);
  });
});

setStatus("Canal HTTP prêt.");
