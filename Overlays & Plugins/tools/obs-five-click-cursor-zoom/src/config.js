import fs from 'node:fs/promises';
import { ACTIVATION_MODES } from './output-gate.js';

const DEFAULTS = {
  obs: {
    url: 'ws://127.0.0.1:4455',
    password: '',
    zoomSourceName: 'Click Zoom Layer',
  },
  trigger: {
    clicks: 5,
    windowMs: 1200,
    radiusPx: 180,
    cooldownMs: 2000,
    leftMouseButtonCode: 1,
    activationMode: 'recording',
  },
  zoom: {
    factor: 2.5,
    trackMs: 15000,
    zoomInMs: 300,
    zoomOutMs: 400,
    fps: 60,
    followSmoothing: 0.18,
  },
  display: {
    left: 0,
    top: 0,
    width: 1920,
    height: 1080,
  },
};

function mergeConfig(userConfig) {
  return {
    ...DEFAULTS,
    ...userConfig,
    obs: { ...DEFAULTS.obs, ...userConfig.obs },
    trigger: { ...DEFAULTS.trigger, ...userConfig.trigger },
    zoom: { ...DEFAULTS.zoom, ...userConfig.zoom },
    display: { ...DEFAULTS.display, ...userConfig.display },
  };
}

function requireFiniteNumber(value, name, { minimum = Number.NEGATIVE_INFINITY } = {}) {
  if (!Number.isFinite(value) || value < minimum) {
    throw new TypeError(`${name} must be a finite number greater than or equal to ${minimum}`);
  }
}

export async function loadConfig(configPath) {
  const raw = await fs.readFile(configPath, 'utf8');
  const config = mergeConfig(JSON.parse(raw));

  if (!config.obs.url.startsWith('ws://') && !config.obs.url.startsWith('wss://')) {
    throw new TypeError('obs.url must begin with ws:// or wss://');
  }
  if (!config.obs.zoomSourceName.trim()) {
    throw new TypeError('obs.zoomSourceName cannot be empty');
  }

  requireFiniteNumber(config.trigger.clicks, 'trigger.clicks', { minimum: 2 });
  requireFiniteNumber(config.trigger.windowMs, 'trigger.windowMs', { minimum: 1 });
  requireFiniteNumber(config.trigger.radiusPx, 'trigger.radiusPx', { minimum: 0 });
  requireFiniteNumber(config.trigger.cooldownMs, 'trigger.cooldownMs', { minimum: 0 });
  requireFiniteNumber(config.trigger.leftMouseButtonCode, 'trigger.leftMouseButtonCode', { minimum: 0 });
  if (!ACTIVATION_MODES.includes(config.trigger.activationMode)) {
    throw new TypeError(`trigger.activationMode must be one of: ${ACTIVATION_MODES.join(', ')}`);
  }
  requireFiniteNumber(config.zoom.factor, 'zoom.factor', { minimum: 1 });
  requireFiniteNumber(config.zoom.trackMs, 'zoom.trackMs', { minimum: 1 });
  requireFiniteNumber(config.zoom.zoomInMs, 'zoom.zoomInMs', { minimum: 0 });
  requireFiniteNumber(config.zoom.zoomOutMs, 'zoom.zoomOutMs', { minimum: 0 });
  requireFiniteNumber(config.zoom.fps, 'zoom.fps', { minimum: 1 });
  requireFiniteNumber(config.zoom.followSmoothing, 'zoom.followSmoothing', { minimum: 0 });
  requireFiniteNumber(config.display.left, 'display.left');
  requireFiniteNumber(config.display.top, 'display.top');
  requireFiniteNumber(config.display.width, 'display.width', { minimum: 1 });
  requireFiniteNumber(config.display.height, 'display.height', { minimum: 1 });

  if (!Number.isInteger(config.trigger.clicks)) {
    throw new TypeError('trigger.clicks must be an integer');
  }
  if (config.zoom.followSmoothing > 1) {
    throw new TypeError('zoom.followSmoothing must be between 0 and 1');
  }

  return config;
}
