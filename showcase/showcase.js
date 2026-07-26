const preview = document.querySelector("#countdown-preview");
const buttons = [...document.querySelectorAll("[data-countdown-variant]")];

const sources = {
  light: "./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown.html?v=halftone-radio-rings-1",
  dark: "./Overlays%20%26%20Plugins/overlays/countdown/stream-countdown-dark.html?v=halftone-radio-rings-1",
};

// Keep this in sync with the production countdown's 1:59 runtime, five-second
// hold at 0:00, and 650ms exit transition.
const COUNTDOWN_START_SECONDS = 1 * 60 + 59;
const COUNTDOWN_RUNTIME_MS = COUNTDOWN_START_SECONDS * 1000;
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
let countdownDeadline = 0;

function clearCycleTimer() {
  if (cycleTimer !== null) {
    window.clearTimeout(cycleTimer);
    cycleTimer = null;
  }

  cycleToken += 1;
  return cycleToken;
}

function startCountdownCycle() {
  countdownDeadline = Date.now() + COUNTDOWN_RUNTIME_MS;
}

function sourceFor(variant) {
  if (countdownDeadline === 0) {
    startCountdownCycle();
  }

  sourceNonce += 1;
  const params = new URLSearchParams({
    showcaseCycle: String(sourceNonce),
    showcaseDeadline: String(countdownDeadline),
  });
  return `${sources[variant]}?${params}`;
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

  startCountdownCycle();
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

  const delay =
    Math.max(0, countdownDeadline - Date.now()) +
    COUNTDOWN_EXIT_HOLD_MS +
    COUNTDOWN_EXIT_MS;

  cycleTimer = window.setTimeout(() => {
    if (token !== cycleToken) return;

    const nextVariant = variant === "light" ? "dark" : "light";
    startCountdownCycle();
    loadVariant(nextVariant, true);
  }, delay);
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

{
  const demo = document.querySelector("[data-cursor-zoom-demo]");

  if (demo) {
    const image = demo.querySelector("[data-cursor-zoom-image]");
    const status = demo.querySelector("[data-cursor-zoom-status]");
    const count = demo.querySelector("[data-cursor-zoom-count]");
    const REQUIRED_CLICKS = 5;
    const CLICK_WINDOW_MS = 1200;
    const SOURCE_CLICK_RADIUS = 180;
    const SOURCE_WIDTH = 1920;
    const TARGET_ZOOM = 2.5;
    const ZOOM_IN_MS = prefersReducedMotion ? 0 : 300;
    const ZOOM_OUT_MS = prefersReducedMotion ? 0 : 400;
    const TRACK_MS = 15000;
    const FOLLOW_SMOOTHING = 0.18;
    const REFERENCE_FRAME_MS = 1000 / 60;

    let clicks = [];
    let countResetTimer = null;
    let trackTimer = null;
    let trackCountdownInterval = null;
    let trackDeadline = 0;
    let animationFrame = null;
    let lastFrameAt = performance.now();
    let zoom = 1;
    let zoomFrom = 1;
    let zoomTo = 1;
    let zoomStartedAt = 0;
    let zoomDuration = 0;
    let zoomEase = easeOutCubic;
    let zoomTransitioning = false;
    let zoomActive = false;
    let targetX = demo.clientWidth / 2;
    let targetY = demo.clientHeight / 2;
    let smoothedX = targetX;
    let smoothedY = targetY;

    function clamp(value, minimum, maximum) {
      return Math.min(maximum, Math.max(minimum, value));
    }

    function easeOutCubic(value) {
      const progress = clamp(value, 0, 1);
      return 1 - Math.pow(1 - progress, 3);
    }

    function easeInOutCubic(value) {
      const progress = clamp(value, 0, 1);
      return progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    }

    function updateTrackingCountdown() {
      if (!zoomActive || trackDeadline === 0) return;

      const remainingSeconds = Math.max(
        0,
        Math.ceil((trackDeadline - performance.now()) / 1000),
      );
      const nextText = `${remainingSeconds}s`;
      if (count.textContent !== nextText) {
        count.textContent = nextText;
      }
    }

    function updateHud() {
      if (zoomActive) {
        status.textContent = "2.5x cursor tracking";
        updateTrackingCountdown();
        demo.classList.add("is-zoomed");
        return;
      }

      demo.classList.remove("is-zoomed");
      status.textContent = clicks.length
        ? "Keep clicking near that point"
        : "Click 5x near one point";
      count.textContent = `${clicks.length} / ${REQUIRED_CLICKS}`;
    }

    function applyTransform() {
      const width = demo.clientWidth;
      const height = demo.clientHeight;
      const viewportWidth = width / zoom;
      const viewportHeight = height / zoom;
      const centreX = clamp(
        smoothedX,
        viewportWidth / 2,
        width - viewportWidth / 2,
      );
      const centreY = clamp(
        smoothedY,
        viewportHeight / 2,
        height - viewportHeight / 2,
      );
      const translateX = width / 2 - centreX * zoom;
      const translateY = height / 2 - centreY * zoom;

      image.style.transform =
        `translate3d(${translateX}px, ${translateY}px, 0) scale(${zoom})`;
    }

    function runAnimation(frameTime) {
      const elapsedFrame = Math.max(1, frameTime - lastFrameAt);
      lastFrameAt = frameTime;

      if (zoomActive) {
        const smoothingAlpha =
          1 - Math.pow(1 - FOLLOW_SMOOTHING, elapsedFrame / REFERENCE_FRAME_MS);
        smoothedX += (targetX - smoothedX) * smoothingAlpha;
        smoothedY += (targetY - smoothedY) * smoothingAlpha;
      }

      if (zoomTransitioning) {
        const progress = zoomDuration === 0
          ? 1
          : Math.min(1, (frameTime - zoomStartedAt) / zoomDuration);
        zoom = zoomFrom + (zoomTo - zoomFrom) * zoomEase(progress);
        zoomTransitioning = progress < 1;
      }

      applyTransform();

      const followingPointer =
        zoomActive
        && (
          Math.abs(smoothedX - targetX) > 0.05
          || Math.abs(smoothedY - targetY) > 0.05
        );

      if (zoomTransitioning || followingPointer) {
        animationFrame = requestAnimationFrame(runAnimation);
      } else {
        animationFrame = null;
      }
    }

    function ensureAnimation() {
      if (animationFrame !== null) return;
      lastFrameAt = performance.now();
      animationFrame = requestAnimationFrame(runAnimation);
    }

    function transitionZoom(nextZoom, duration, easing) {
      zoomFrom = zoom;
      zoomTo = nextZoom;
      zoomStartedAt = performance.now();
      zoomDuration = duration;
      zoomEase = easing;
      zoomTransitioning = true;
      ensureAnimation();
    }

    function clearClickProgress() {
      clicks = [];
      window.clearTimeout(countResetTimer);
      countResetTimer = null;
    }

    function resetDemo({ animate = true } = {}) {
      clearClickProgress();
      window.clearTimeout(trackTimer);
      trackTimer = null;
      window.clearInterval(trackCountdownInterval);
      trackCountdownInterval = null;
      trackDeadline = 0;
      zoomActive = false;
      updateHud();
      transitionZoom(1, animate ? ZOOM_OUT_MS : 0, easeInOutCubic);
    }

    function startZoom(x, y) {
      clearClickProgress();
      targetX = x;
      targetY = y;
      smoothedX = x;
      smoothedY = y;
      zoomActive = true;
      trackDeadline = performance.now() + TRACK_MS;
      updateHud();
      transitionZoom(TARGET_ZOOM, ZOOM_IN_MS, easeOutCubic);

      window.clearTimeout(trackTimer);
      window.clearInterval(trackCountdownInterval);
      trackCountdownInterval = window.setInterval(
        updateTrackingCountdown,
        250,
      );
      trackTimer = window.setTimeout(() => resetDemo(), TRACK_MS);
    }

    function createClickMarker(x, y) {
      const marker = document.createElement("span");
      marker.className = "cursor-zoom-click";
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      marker.setAttribute("aria-hidden", "true");
      demo.append(marker);
      marker.addEventListener("animationend", () => marker.remove(), {
        once: true,
      });
    }

    function relativePoint(event) {
      const rect = demo.getBoundingClientRect();
      return {
        x: clamp(event.clientX - rect.left, 0, rect.width),
        y: clamp(event.clientY - rect.top, 0, rect.height),
      };
    }

    demo.addEventListener("pointermove", event => {
      const point = relativePoint(event);
      targetX = point.x;
      targetY = point.y;
      if (zoomActive) ensureAnimation();
    });

    demo.addEventListener("pointerdown", event => {
      if (zoomActive || (!event.isPrimary && event.pointerType !== "mouse")) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const point = relativePoint(event);
      const now = performance.now();
      const clickRadius = demo.clientWidth * (SOURCE_CLICK_RADIUS / SOURCE_WIDTH);
      clicks = clicks.filter(click => now - click.time <= CLICK_WINDOW_MS);
      clicks.push({ ...point, time: now });
      createClickMarker(point.x, point.y);

      const candidate = clicks.slice(-REQUIRED_CLICKS);
      const first = candidate[0];
      const triggered =
        candidate.length === REQUIRED_CLICKS
        && candidate.at(-1).time - first.time <= CLICK_WINDOW_MS
        && candidate.every(click =>
          Math.hypot(click.x - first.x, click.y - first.y) <= clickRadius
        );

      if (triggered) {
        startZoom(point.x, point.y);
        return;
      }

      updateHud();
      window.clearTimeout(countResetTimer);
      countResetTimer = window.setTimeout(() => {
        clearClickProgress();
        updateHud();
      }, CLICK_WINDOW_MS);
    });

    demo.addEventListener("pointerleave", event => {
      if (event.pointerType !== "touch") resetDemo();
    });
    demo.addEventListener("pointercancel", () => resetDemo());
    demo.addEventListener("blur", () => resetDemo());
    demo.addEventListener("keydown", event => {
      if (event.key === "Escape") resetDemo();
    });
    demo.addEventListener("dragstart", event => event.preventDefault());

    updateHud();
    applyTransform();
  }
}
