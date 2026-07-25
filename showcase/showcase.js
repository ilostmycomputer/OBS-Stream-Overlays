const preview = document.querySelector("#countdown-preview");
const buttons = [...document.querySelectorAll("[data-countdown-variant]")];

const sources = {
  light: "./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown.html",
  dark: "./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown-dark.html",
};

// Keep this in sync with the production countdown's 1:59 runtime, five-second
// hold at 0:00, and 650ms exit transition.
const COUNTDOWN_RUNTIME_MS = (1 * 60 + 59) * 1000;
const COUNTDOWN_EXIT_HOLD_MS = 5000;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const COUNTDOWN_EXIT_MS = prefersReducedMotion ? 0 : 650;
const COUNTDOWN_CYCLE_MS =
  COUNTDOWN_RUNTIME_MS + COUNTDOWN_EXIT_HOLD_MS + COUNTDOWN_EXIT_MS;

const previews = new Map();
let activeVariant = "light";
let cycleTimer = null;
let cycleToken = 0;
let sourceNonce = 0;

function clearCycleTimer() {
  if (cycleTimer !== null) {
    window.clearTimeout(cycleTimer);
    cycleTimer = null;
  }

  cycleToken += 1;
  return cycleToken;
}

function sourceFor(variant) {
  sourceNonce += 1;
  return `${sources[variant]}?showcaseCycle=${sourceNonce}`;
}

function prepareCountdownPreviews() {
  if (!preview || !preview.parentElement) return;

  const sharedStyles = {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    transition: prefersReducedMotion
      ? "none"
      : "opacity 260ms cubic-bezier(0.22, 1, 0.36, 1)",
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
  darkPreview.src = "about:blank";
  darkPreview.dataset.countdownPreview = "dark";
  darkPreview.setAttribute("aria-hidden", "true");
  Object.assign(darkPreview.style, sharedStyles, {
    opacity: "0",
    pointerEvents: "none",
  });

  preview.parentElement.append(darkPreview);
  previews.set("light", preview);
  previews.set("dark", darkPreview);

  loadVariant("light", false);
}

function setCountdownVariant(variant) {
  if (!previews.has(variant)) return;

  activeVariant = variant;

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

function scheduleNextCycle(variant, token) {
  if (token !== cycleToken) return;

  cycleTimer = window.setTimeout(() => {
    if (token !== cycleToken) return;

    const nextVariant = variant === "light" ? "dark" : "light";
    loadVariant(nextVariant, true);
  }, COUNTDOWN_CYCLE_MS);
}

function loadVariant(variant, activateOnLoad) {
  const token = clearCycleTimer();
  const frame = previews.get(variant);
  if (!frame) return;

  let settled = false;
  const reveal = () => {
    if (settled || token !== cycleToken) return;
    settled = true;

    if (activateOnLoad) {
      setCountdownVariant(variant);
    }

    scheduleNextCycle(variant, token);
  };

  frame.addEventListener("load", reveal, { once: true });
  frame.src = sourceFor(variant);

  // Keep the showcase moving if a browser serves the cached document without
  // dispatching a second load event for the cache-busted URL.
  window.setTimeout(reveal, 3000);
}

prepareCountdownPreviews();

for (const button of buttons) {
  button.addEventListener("click", () => {
    loadVariant(button.dataset.countdownVariant, true);
  });
}
