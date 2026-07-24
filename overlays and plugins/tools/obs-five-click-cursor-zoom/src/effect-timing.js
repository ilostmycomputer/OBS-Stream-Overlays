import { easeInOutCubic, easeOutCubic } from './zoom-math.js';

export function getZoomPhase({
  elapsedMs,
  zoomInMs,
  trackMs,
  zoomOutMs,
  targetZoom,
}) {
  if (elapsedMs <= zoomInMs) {
    const progress = zoomInMs === 0 ? 1 : elapsedMs / zoomInMs;
    return {
      zoom: 1 + (targetZoom - 1) * easeOutCubic(progress),
      done: false,
    };
  }

  if (elapsedMs < trackMs) {
    return { zoom: targetZoom, done: false };
  }

  const zoomOutElapsed = elapsedMs - trackMs;
  if (zoomOutElapsed >= zoomOutMs) {
    return { zoom: 1, done: true };
  }

  const progress = zoomOutMs === 0 ? 1 : zoomOutElapsed / zoomOutMs;
  return {
    zoom: 1 + (targetZoom - 1) * (1 - easeInOutCubic(progress)),
    done: false,
  };
}
