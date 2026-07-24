export const ACTIVATION_MODES = Object.freeze([
  'recording',
  'streaming',
  'either',
]);

export function isActivationOutputActive({ mode, streaming, recording }) {
  if (mode === 'recording') return recording;
  if (mode === 'streaming') return streaming;
  if (mode === 'either') return streaming || recording;
  return false;
}

export function activationModeLabel(mode) {
  if (mode === 'recording') return 'recording';
  if (mode === 'streaming') return 'streaming';
  return 'recording or streaming';
}
