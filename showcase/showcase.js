const preview = document.querySelector("#countdown-preview");
const buttons = [...document.querySelectorAll("[data-countdown-variant]")];

const sources = {
  light: "./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown.html",
  dark: "./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown-dark.html",
};

function setCountdownVariant(variant) {
  if (!preview || !sources[variant]) return;
  preview.src = sources[variant];

  for (const button of buttons) {
    const active = button.dataset.countdownVariant === variant;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

for (const button of buttons) {
  button.addEventListener("click", () => setCountdownVariant(button.dataset.countdownVariant));
}
