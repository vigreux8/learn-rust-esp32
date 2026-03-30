export function setupServoUi(servoApi, mode) {
  const sliders = document.querySelectorAll(".speed-slider");
  const stopButtons = document.querySelectorAll(".stop-button");

  function resetSliderToZero(target) {
    const slider = document.querySelector(`.speed-slider[data-target="${target}"]`);
    if (!slider) {
      return;
    }

    slider.value = "0";
    servoApi.stop(target);
  }

  sliders.forEach((slider) => {
    const target = slider.dataset.target;

    if (mode === "http") {
      const sendOnRelease = () => {
        servoApi.move(target, slider.value);
      };

      slider.addEventListener("change", sendOnRelease);
      slider.addEventListener("pointerup", sendOnRelease);
      slider.addEventListener("touchend", sendOnRelease, { passive: true });
      return;
    }

    slider.addEventListener("input", () => {
      servoApi.move(target, slider.value);
    });
  });

  stopButtons.forEach((button) => {
    button.addEventListener("click", () => {
      resetSliderToZero(button.dataset.target);
    });
  });
}
