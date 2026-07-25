const preview = document.querySelector("#countdown-preview");
const buttons = [...document.querySelectorAll("[data-countdown-variant]")];

const sources = {
  light: "./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown.html",
  dark: "./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown-dark.html",
};

const previews = new Map();

function prepareCountdownPreviews() {
  if (!preview || !preview.parentElement) return;

  const sharedStyles = {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    transition: "opacity 260ms cubic-bezier(0.22, 1, 0.36, 1)",
    willChange: "opacity",
  };

  Object.assign(preview.style, sharedStyles, {
    opacity: "1",
    pointerEvents: "auto",
  });
  preview.dataset.countdownPreview = "light";
  preview.setAttribute("aria-hidden", "false");

  const darkPreview = preview.cloneNode(false);
  darkPreview.id = "countdown-preview-dark";
  darkPreview.title = "Start Stream Countdown dark preview";
  darkPreview.src = sources.dark;
  darkPreview.dataset.countdownPreview = "dark";
  darkPreview.setAttribute("aria-hidden", "true");
  Object.assign(darkPreview.style, sharedStyles, {
    opacity: "0",
    pointerEvents: "none",
  });

  preview.parentElement.append(darkPreview);
  previews.set("light", preview);
  previews.set("dark", darkPreview);
}

function setCountdownVariant(variant) {
  if (!previews.has(variant)) return;

  for (const [name, frame] of previews) {
    const active = name === variant;
    frame.style.opacity = active ? "1" : "0";
    frame.style.pointerEvents = active ? "auto" : "none";
    frame.setAttribute("aria-hidden", String(!active));
  }

  for (const button of buttons) {
    const active = button.dataset.countdownVariant === variant;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

prepareCountdownPreviews();

for (const button of buttons) {
  button.addEventListener("click", () => setCountdownVariant(button.dataset.countdownVariant));
}
