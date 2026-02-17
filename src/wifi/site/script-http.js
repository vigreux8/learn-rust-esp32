const sliders = document.querySelectorAll(".speed-slider");
const stopButtons = document.querySelectorAll(".stop-button");
const statusEl = document.getElementById("transport-status");

function setStatus(message) {
  if (statusEl) {
    statusEl.textContent = message;
  }
}

async function sendSpeed(target, value) {
  try {
    const response = await fetch("/api/servo", {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: `${target}:${value}`,
    });

    if (!response.ok) {
      setStatus(`HTTP erreur ${response.status}`);
    } else {
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
  sendSpeed(target, 0);
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

setStatus("Canal HTTP prêt.");
