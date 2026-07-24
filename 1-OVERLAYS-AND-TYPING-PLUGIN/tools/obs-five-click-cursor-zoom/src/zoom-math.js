function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function mapScreenPointToSource({
  screenX,
  screenY,
  display,
  sourceWidth,
  sourceHeight,
}) {
  const normalisedX = clamp((screenX - display.left) / display.width, 0, 1);
  const normalisedY = clamp((screenY - display.top) / display.height, 0, 1);

  return {
    x: normalisedX * sourceWidth,
    y: normalisedY * sourceHeight,
  };
}

export function calculateZoomTransform({
  sourceWidth,
  sourceHeight,
  canvasWidth,
  canvasHeight,
  cursorX,
  cursorY,
  zoom,
}) {
  const safeZoom = Math.max(1, zoom);
  const canvasAspect = canvasWidth / canvasHeight;
  const sourceAspect = sourceWidth / sourceHeight;

  let fittedWidth;
  let fittedHeight;

  if (sourceAspect >= canvasAspect) {
    fittedHeight = sourceHeight;
    fittedWidth = fittedHeight * canvasAspect;
  } else {
    fittedWidth = sourceWidth;
    fittedHeight = fittedWidth / canvasAspect;
  }

  const viewportWidth = fittedWidth / safeZoom;
  const viewportHeight = fittedHeight / safeZoom;
  const centreX = clamp(cursorX, viewportWidth / 2, sourceWidth - viewportWidth / 2);
  const centreY = clamp(cursorY, viewportHeight / 2, sourceHeight - viewportHeight / 2);

  const cropLeft = Math.round(centreX - viewportWidth / 2);
  const cropTop = Math.round(centreY - viewportHeight / 2);
  const cropRight = Math.round(sourceWidth - cropLeft - viewportWidth);
  const cropBottom = Math.round(sourceHeight - cropTop - viewportHeight);
  const visibleWidth = sourceWidth - cropLeft - cropRight;
  const visibleHeight = sourceHeight - cropTop - cropBottom;

  return {
    positionX: 0,
    positionY: 0,
    rotation: 0,
    scaleX: canvasWidth / visibleWidth,
    scaleY: canvasHeight / visibleHeight,
    cropLeft,
    cropRight,
    cropTop,
    cropBottom,
    alignment: 5,
    boundsType: 'OBS_BOUNDS_NONE',
  };
}

export function easeOutCubic(t) {
  const value = clamp(t, 0, 1);
  return 1 - Math.pow(1 - value, 3);
}

export function easeInOutCubic(t) {
  const value = clamp(t, 0, 1);
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

export function smoothingAlpha(baseAlpha, elapsedMs, referenceFrameMs = 1000 / 60) {
  const clamped = clamp(baseAlpha, 0, 1);
  return 1 - Math.pow(1 - clamped, elapsedMs / referenceFrameMs);
}

const WRITABLE_TRANSFORM_FIELDS = [
  'alignment',
  'boundsAlignment',
  'boundsHeight',
  'boundsType',
  'boundsWidth',
  'cropBottom',
  'cropLeft',
  'cropRight',
  'cropTop',
  'positionX',
  'positionY',
  'rotation',
  'scaleX',
  'scaleY',
];

export function pickWritableTransform(transform) {
  return Object.fromEntries(
    WRITABLE_TRANSFORM_FIELDS
      .filter((field) => transform[field] !== undefined)
      .map((field) => [field, transform[field]]),
  );
}
